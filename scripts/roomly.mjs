#!/usr/bin/env node
/**
 * Roomly — cross-platform project CLI (Node ESM)
 * Usage:
 *   node scripts/roomly.mjs [up|dev|down|infra|build|logs|ps|help]
 *   npm run up | npm run dev | ...
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
const ENV_FILE = path.join(INFRA_DIR, '.env');
const ENV_EXAMPLE = path.join(INFRA_DIR, '.env.example');
const COMPOSE_FILE = path.join(INFRA_DIR, 'docker-compose.yml');
const COMPOSE_DEV_FILE = path.join(INFRA_DIR, 'docker-compose.dev.yml');

const JS_SERVICES = ['gateway', 'user-service', 'notification-service'];
const INFRA_SERVICES = ['postgres', 'redis', 'rabbitmq'];

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
    console.log('Created infra/.env from infra/.env.example');
  }
  loadEnvFile(ENV_FILE);
  ensureDevJwtPrivateKey();
}

function composeArgs(extraFiles = []) {
  const args = ['compose', '-f', COMPOSE_FILE];
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

function cmdUp() {
  ensureEnv();
  dockerCompose([], 'build', 'gateway');
  dockerCompose([], 'up', '-d', ...JS_SERVICES);
  console.log('');
  console.log('Roomly is up (prod mode)');
  console.log(`  Gateway:       http://localhost:${env('GATEWAY_PORT', '3000')}`);
  console.log(`  Swagger:       http://localhost:${env('GATEWAY_PORT', '3000')}/docs`);
  console.log(`  RabbitMQ UI:   http://localhost:${env('RABBITMQ_MGMT_PORT', '15672')}`);
  console.log('  (user / notification — internal only, no host ports)');
}

function cmdDev() {
  ensureEnv();
  dockerCompose([COMPOSE_DEV_FILE], 'build', 'gateway');
  dockerCompose([COMPOSE_DEV_FILE], 'up', ...JS_SERVICES);
}

function cmdInfra() {
  ensureEnv();
  dockerCompose([], 'up', '-d', ...INFRA_SERVICES);
  console.log('Infrastructure is up (postgres, redis, rabbitmq)');
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

  npm run up          start infra + Nest services (detached, prod image)
  npm run dev         hot-reload (infra/docker-compose.dev.yml)
  npm run auth:keys   generate local JWT RSA private key (once; skip if exists)
  npm run infra       only postgres, redis, rabbitmq
  npm run down        stop all services
  npm run build:apps  rebuild Nest image (gateway)
  npm run logs        follow logs (optional: npm run logs -- gateway)
  npm run ps          show running containers
  npm run roomly -- help

  Also: node scripts/roomly.mjs <command>

Compose / env live in infra/:
  infra/docker-compose.yml
  infra/docker-compose.dev.yml
  infra/.env

Examples:
  npm run up
  npm run dev
  npm run logs -- gateway
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
