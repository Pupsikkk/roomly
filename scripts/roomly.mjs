#!/usr/bin/env node
/**
 * Roomly — cross-platform project CLI (Node ESM)
 * Usage:
 *   node scripts/roomly.mjs [up|dev|down|infra|obs|build|logs|ps|help]
 *   npm run up | npm run dev | ...
 *
 * Scale profile: infra/docker/services.conf  (0 = off, N = replicas)
 */

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  readFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDevJwtPrivateKey } from './generate-jwt-keys.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INFRA_DIR = path.join(ROOT, 'infra');
const SECRETS_DIR = path.join(INFRA_DIR, 'secrets');
const ENV_FILE = path.join(SECRETS_DIR, '.env');
const ENV_EXAMPLE = path.join(SECRETS_DIR, '.env.example');
const COMPOSE_DIR = path.join(INFRA_DIR, 'docker');
const COMPOSE_FILE = path.join(COMPOSE_DIR, 'docker-compose.yml');
const COMPOSE_OBS_FILE = path.join(COMPOSE_DIR, 'docker-compose.obs.yml');
const COMPOSE_DEV_FILE = path.join(COMPOSE_DIR, 'docker-compose.dev.yml');
const SERVICES_CONF = path.join(COMPOSE_DIR, 'services.conf');

const JS_SERVICES = ['gateway', 'user-service', 'notification-service'];
const CORE_INFRA_SERVICES = ['postgres', 'redis', 'rabbitmq'];
const OBS_CORE_SERVICES = [
  'tempo',
  'otel-collector',
  'loki',
  'grafana',
  'prometheus',
];
const DEFAULT_SCALE = {
  obs: 1,
  postgres: 1,
  redis: 1,
  rabbitmq: 1,
  gateway: 1,
  'user-service': 1,
  'notification-service': 1,
};

/** Host-published ports — scaling >1 usually fails on bind. */
const HOST_PORT_SERVICES = new Set([
  'postgres',
  'redis',
  'rabbitmq',
  'gateway-lb',
  'tempo',
  'otel-collector',
  'loki',
  'grafana',
  'prometheus',
]);

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function ensureEnv() {
  if (!existsSync(ENV_FILE)) {
    copyFileSync(ENV_EXAMPLE, ENV_FILE);
    console.log('Created infra/secrets/.env from infra/secrets/.env.example');
  }
  loadEnvFile(ENV_FILE);
  ensureDevJwtPrivateKey();
}

/** Parse infra/docker/services.conf → { key: number }. */
function loadServicesConf() {
  const scale = { ...DEFAULT_SCALE };
  if (!existsSync(SERVICES_CONF)) {
    console.warn(`Missing ${SERVICES_CONF} — using defaults (all = 1)`);
    return scale;
  }
  const text = readFileSync(SERVICES_CONF, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const raw = trimmed.slice(eq + 1).trim();
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      console.warn(`services.conf: ignore invalid value ${key}=${raw}`);
      continue;
    }
    scale[key] = n;
  }
  return scale;
}

/**
 * @returns {{
 *   services: string[],
 *   counts: Record<string, number>,
 *   warnings: string[],
 * }}
 */
function planFromConf(scale) {
  const services = [];
  const counts = {};
  const warnings = [];

  const add = (name, count) => {
    if (count <= 0) return;
    services.push(name);
    counts[name] = count;
    if (count > 1 && HOST_PORT_SERVICES.has(name)) {
      warnings.push(
        `${name}=${count}: publishes a host port — Compose usually cannot scale it`,
      );
    }
  };

  for (const name of CORE_INFRA_SERVICES) {
    add(name, scale[name] ?? 0);
  }

  if ((scale.obs ?? 0) > 0) {
    for (const name of OBS_CORE_SERVICES) add(name, 1);
    if ((scale.postgres ?? 0) > 0) add('postgres-exporter', 1);
    if ((scale.redis ?? 0) > 0) add('redis-exporter', 1);
  }

  for (const name of JS_SERVICES) {
    add(name, scale[name] ?? 0);
  }

  // Single host entrypoint in front of gateway replica(s).
  if ((scale.gateway ?? 0) > 0) {
    add('gateway-lb', 1);
  }

  if ((scale['user-service'] ?? 0) > 0) {
    add('user-migrate', 1);
  }

  return { services, counts, warnings };
}

function scaleArgsFor(counts, serviceNames) {
  const args = [];
  for (const name of serviceNames) {
    const n = counts[name] ?? 1;
    if (n > 1) args.push('--scale', `${name}=${n}`);
  }
  return args;
}

function printPlan(services, counts, warnings) {
  const scaled = Object.entries(counts)
    .filter(([, n]) => n > 1)
    .map(([k, n]) => `${k}=${n}`);
  console.log(`services.conf → ${services.join(', ') || '(nothing)'}`);
  if (scaled.length) console.log(`scale → ${scaled.join(', ')}`);
  for (const w of warnings) console.warn(`warn: ${w}`);
}

function needsGatewayImage(services) {
  return services.some((s) =>
    ['gateway', 'user-service', 'notification-service', 'user-migrate'].includes(
      s,
    ),
  );
}

/** Always merge base + obs; optionally add more overlays (e.g. dev). */
function composeArgs(extraFiles = []) {
  const args = [
    'compose',
    '-f',
    COMPOSE_FILE,
    '-f',
    COMPOSE_OBS_FILE,
    '--env-file',
    ENV_FILE,
  ];
  for (const file of extraFiles) {
    args.push('-f', file);
  }
  args.push('--project-directory', INFRA_DIR);
  return args;
}

function run(cmd, args, { inherit = true } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: inherit ? 'inherit' : 'pipe',
    env: process.env,
    shell: false,
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0 && result.status !== null) {
    process.exit(result.status);
  }
  return result;
}

function dockerCompose(fileExtra, ...args) {
  run('docker', [...composeArgs(fileExtra), ...args]);
}

function env(name, fallback) {
  return process.env[name] || fallback;
}

function printObsUrls() {
  console.log(`  Grafana:       http://localhost:${env('GRAFANA_PORT', '3003')}`);
  console.log(`  Tempo API:     http://localhost:${env('TEMPO_HTTP_PORT', '3200')}`);
  console.log(`  Prometheus:    http://localhost:${env('PROMETHEUS_PORT', '9090')}`);
}

function cmdUp() {
  ensureEnv();
  const { services, counts, warnings } = planFromConf(loadServicesConf());
  printPlan(services, counts, warnings);
  if (services.length === 0) {
    console.error('Nothing to start — enable services in infra/docker/services.conf');
    process.exit(1);
  }
  if (needsGatewayImage(services)) {
    dockerCompose([], 'build', 'gateway');
  }
  dockerCompose([], 'up', '-d', ...scaleArgsFor(counts, services), ...services);
  console.log('');
  console.log('Roomly is up (prod mode)');
  if (services.includes('gateway')) {
    console.log(`  Gateway:       http://localhost:${env('GATEWAY_PORT', '3000')}`);
    console.log(`  Swagger:       http://localhost:${env('GATEWAY_PORT', '3000')}/docs`);
  }
  if (services.includes('rabbitmq')) {
    console.log(`  RabbitMQ UI:   http://localhost:${env('RABBITMQ_MGMT_PORT', '15672')}`);
  }
  if (services.includes('grafana')) printObsUrls();
}

function cmdDev() {
  ensureEnv();
  const { services, counts, warnings } = planFromConf(loadServicesConf());
  printPlan(services, counts, warnings);
  if (services.length === 0) {
    console.error('Nothing to start — enable services in infra/docker/services.conf');
    process.exit(1);
  }

  const detached = services.filter((s) => !JS_SERVICES.includes(s));
  const foreground = services.filter((s) => JS_SERVICES.includes(s));

  if (needsGatewayImage(services)) {
    dockerCompose([COMPOSE_DEV_FILE], 'build', 'gateway');
  }
  if (detached.length) {
    dockerCompose(
      [COMPOSE_DEV_FILE],
      'up',
      '-d',
      ...scaleArgsFor(counts, detached),
      ...detached,
    );
  }
  if (foreground.length) {
    dockerCompose(
      [COMPOSE_DEV_FILE],
      'up',
      ...scaleArgsFor(counts, foreground),
      ...foreground,
    );
  }
}

function cmdInfra() {
  ensureEnv();
  dockerCompose([], 'up', '-d', ...CORE_INFRA_SERVICES);
  console.log('Core infrastructure is up (postgres, redis, rabbitmq)');
  console.log(`  RabbitMQ UI: http://localhost:${env('RABBITMQ_MGMT_PORT', '15672')}`);
}

function cmdObs() {
  ensureEnv();
  dockerCompose([], 'up', '-d', ...OBS_CORE_SERVICES, 'postgres-exporter', 'redis-exporter');
  console.log('Observability stack is up');
  printObsUrls();
}

function cmdDown(extra = []) {
  ensureEnv();
  dockerCompose([], 'down', ...extra);
}

function cmdBuild() {
  ensureEnv();
  dockerCompose([], 'build', 'gateway');
}

function cmdLogs(services = []) {
  ensureEnv();
  dockerCompose([], 'logs', '-f', ...services);
}

function cmdPs() {
  ensureEnv();
  dockerCompose([], 'ps');
}

function cmdHelp() {
  console.log(`Roomly — quick commands (cross-platform Node CLI)

  npm run up          start from infra/docker/services.conf (detached, prod)
  npm run dev         same profile + Nest watch
  npm run auth:keys   generate local JWT RSA private key (once; skip if exists)
  npm run infra       force postgres, redis, rabbitmq
  npm run obs         force observability stack
  npm run down        stop all services
  npm run build:apps  rebuild Nest image (gateway)
  npm run logs        follow logs (optional: npm run logs -- gateway)
  npm run ps          show running containers
  npm run roomly -- help

Compose / secrets:
  infra/docker/docker-compose*.yml
  infra/docker/services.conf   # 0=off, N=replicas (obs is 0/1 group)
  infra/secrets/.env

Examples:
  npm run up
  npm run dev
  # edit infra/docker/services.conf → notification-service=0, gateway=1
  npm run down
`);
}

function main() {
  const [command = 'up', ...rest] = process.argv.slice(2);

  switch (command) {
    case 'up':
    case 'start':
      cmdUp();
      break;
    case 'dev':
      cmdDev();
      break;
    case 'infra':
      cmdInfra();
      break;
    case 'obs':
      cmdObs();
      break;
    case 'down':
    case 'stop':
      cmdDown(rest);
      break;
    case 'build':
      cmdBuild();
      break;
    case 'logs':
      cmdLogs(rest);
      break;
    case 'ps':
    case 'status':
      cmdPs();
      break;
    case 'help':
    case '-h':
    case '--help':
      cmdHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      cmdHelp();
      process.exit(1);
  }
}

main();
