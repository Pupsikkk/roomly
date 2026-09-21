const path = require('node:path');

/**
 * Keep OpenTelemetry + pino as Node requires so instrumentation can patch
 * Module.require (webpack's __webpack_require__ would break pino → OTLP logs).
 */
const OTEL_PINO_EXTERNALS = [
  /^@opentelemetry\//,
  'pino',
  'pino-http',
  'pino-pretty',
  'nestjs-pino',
  'thread-stream',
  '@grpc/grpc-js',
  '@grpc/proto-loader',
];

const otelApi = path.resolve(__dirname, 'node_modules/@opentelemetry/api');

/** @param {import('webpack').Configuration} options */
module.exports = function (options) {
  const prev = options.externals;
  const externals = [
    ...(Array.isArray(prev) ? prev : prev ? [prev] : []),
    ...OTEL_PINO_EXTERNALS,
  ];

  return {
    ...options,
    externals,
    resolve: {
      ...options.resolve,
      // One API instance for app code + instrumentation (shared ALS context).
      alias: {
        ...(options.resolve?.alias ?? {}),
        '@opentelemetry/api': otelApi,
        '@roomly/common': path.resolve(__dirname, 'libs/common/src'),
        '@roomly/infra': path.resolve(__dirname, 'libs/infra/src'),
        '@roomly/contracts': path.resolve(__dirname, 'libs/contracts/src'),
        '@roomly/clients': path.resolve(__dirname, 'libs/clients/src'),
      },
    },
  };
};
