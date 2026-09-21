/**
 * Roomly gateway load test (k6).
 *
 * Env (compose sets these):
 *   BASE_URL   default http://gateway-lb
 *   VUS        virtual users (default 10)
 *   DURATION   e.g. 30s, 2m (default 30s)
 *   RAMP_VUS   peak VUs during ramp scenario (optional)
 *
 * Flow per VU:
 *   1) sign-up (unique email) — 201 or 409 OK
 *   2) sign-in — cookies
 *   3) loop: GET /users/me + occasional GET /health
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = (__ENV.BASE_URL || 'http://gateway-lb').replace(/\/$/, '');
const VUS = Number(__ENV.VUS || 10);
const DURATION = __ENV.DURATION || '30s';
const PASSWORD = __ENV.LOADTEST_PASSWORD || 'Test1234!';

const meLatency = new Trend('roomly_me_duration', true);
const authFail = new Rate('roomly_auth_fail');

export const options = {
  scenarios: {
    gateway_load: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
      gracefulStop: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<1500'],
    roomly_auth_fail: ['rate<0.05'],
    checks: ['rate>0.9'],
  },
};

function jsonHeaders() {
  return { headers: { 'Content-Type': 'application/json' }, redirects: 0 };
}

/** Wait for gateway-lb → gateway (Nest may still be compiling in `npm run dev`). */
function waitForGateway(timeoutMs = 180_000, intervalMs = 2_000) {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = 0;
  while (Date.now() < deadline) {
    const health = http.get(`${BASE_URL}/health`);
    lastStatus = health.status;
    if (health.status === 200) return health;
    sleep(intervalMs / 1000);
  }
  throw new Error(
    `Gateway not ready at ${BASE_URL}/health within ${timeoutMs}ms (last status ${lastStatus})`,
  );
}

export function setup() {
  const health = waitForGateway();
  check(health, { 'gateway healthy': (r) => r.status === 200 });
  return { startedAt: Date.now() };
}

export default function () {
  const email = `load.vu${__VU}.i${__ITER}.${Date.now()}@roomly.test`;

  group('auth', () => {
    const signUp = http.post(
      `${BASE_URL}/auth/sign-up`,
      JSON.stringify({ email, password: PASSWORD }),
      jsonHeaders(),
    );
    const signUpOk = check(signUp, {
      'sign-up 201 or 409': (r) => r.status === 201 || r.status === 409,
    });
    if (!signUpOk) authFail.add(1);

    const signIn = http.post(
      `${BASE_URL}/auth/sign-in`,
      JSON.stringify({ email, password: PASSWORD }),
      jsonHeaders(),
    );
    const signInOk = check(signIn, {
      'sign-in 200': (r) => r.status === 200,
    });
    if (!signInOk) {
      authFail.add(1);
      sleep(1);
      return;
    }
  });

  // Authenticated traffic (cookies kept by VU jar from sign-in).
  for (let i = 0; i < 5; i++) {
    group('authenticated', () => {
      const me = http.get(`${BASE_URL}/users/me`);
      meLatency.add(me.timings.duration);
      check(me, { 'GET /users/me 200': (r) => r.status === 200 });
    });

    if (i % 2 === 0) {
      const health = http.get(`${BASE_URL}/health`);
      check(health, { 'GET /health 200': (r) => r.status === 200 });
    }
    sleep(0.2);
  }
}
