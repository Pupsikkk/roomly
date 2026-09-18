import { SpanKind, trace, type SpanOptions } from '@opentelemetry/api';
import { recordActiveSpanError } from './record-active-span-error';

const DEFAULT_TRACER = 'roomly';
const TRACED_FLAG = Symbol('roomly.traced');
const EXCLUDE_TRACE_FLAG = Symbol('roomly.excludeTrace');

const DEFAULT_CLASS_EXCLUDE = new Set([
  'constructor',
  'onModuleInit',
  'onModuleDestroy',
  'onApplicationBootstrap',
  'onApplicationShutdown',
  'beforeApplicationShutdown',
]);

/** Distinguishes local CPU / business logic from outbound I/O wrappers. */
export type SpanWork = 'cpu' | 'network' | 'local';

export type WithSpanOptions = {
  tracerName?: string;
  work?: SpanWork;
  kind?: SpanKind;
  attributes?: Record<string, string | number | boolean>;
};

export type TracedOptions = WithSpanOptions & {
  /**
   * Method decorator: full span name override.
   * Class decorator: ignored (names stay `ClassName.method`).
   */
  name?: string;
};

type FlaggedFn = ((...args: unknown[]) => unknown) & {
  [TRACED_FLAG]?: boolean;
  [EXCLUDE_TRACE_FLAG]?: boolean;
};

/**
 * Run `fn` inside a child span. No-op tracer when OTel SDK is not started.
 *
 * - `work: 'cpu'` — sync/heavy local compute (bcrypt, JWT sign)
 * - `work: 'network'` — wrapper around outbound I/O (HTTP client)
 * - `work: 'local'` — default business logic
 *
 * Auto-instrumented clients (HTTP/pg/redis/RMQ) already use SpanKind.CLIENT;
 * filter by `span.kind` or attribute `roomly.work` in Jaeger.
 */
export async function withSpan<T>(
  name: string,
  fn: () => Promise<T> | T,
  options: WithSpanOptions = {},
): Promise<T> {
  const work = options.work ?? 'local';
  const kind =
    options.kind ??
    (work === 'network' ? SpanKind.CLIENT : SpanKind.INTERNAL);

  const spanOptions: SpanOptions = {
    kind,
    attributes: {
      'roomly.work': work,
      ...options.attributes,
    },
  };

  return trace
    .getTracer(options.tracerName ?? DEFAULT_TRACER)
    .startActiveSpan(name, spanOptions, async (span) => {
      try {
        return await fn();
      } catch (error) {
        recordActiveSpanError(error);
        throw error;
      } finally {
        span.end();
      }
    });
}

/**
 * Skip this method when the class has `@Traced()`.
 * Method decorators run before class decorators, so the flag is visible in time.
 *
 * @example
 * `@Traced({ work: 'cpu' })`
 * class RsaJwtTokenSigner {
 *   signAccessToken() { ... }
 *   `@ExcludeTracer()`
 *   getJwks() { ... }
 * }
 */
export function ExcludeTracer(): MethodDecorator {
  return (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const original = descriptor.value as FlaggedFn;
    if (typeof original !== 'function') {
      throw new Error('@ExcludeTracer() can only be applied to methods');
    }
    original[EXCLUDE_TRACE_FLAG] = true;
    return descriptor;
  };
}

/**
 * Trace a method or every method on a class.
 *
 * Method decorators run before class decorators — a method already marked
 * with `@Traced()` is not wrapped again; `@ExcludeTracer()` opts out of class tracing.
 *
 * @example
 * `@Traced()`
 * `@Traced({ work: 'cpu' })`
 * async signAccessToken() { ... }
 *
 * `@Traced({ work: 'network' })`
 * class AuthHttpClient { signIn() { ... } signUp() { ... } }
 */
export function Traced(
  nameOrOptions?: string | TracedOptions,
): ClassDecorator & MethodDecorator {
  const options: TracedOptions =
    typeof nameOrOptions === 'string'
      ? { name: nameOrOptions }
      : (nameOrOptions ?? {});

  return ((
    target: object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (propertyKey !== undefined && descriptor) {
      const className = (target as { constructor: Function }).constructor
        .name;
      wrapMethod(propertyKey, descriptor, options, className, options.name);
      return descriptor;
    }

    const ctor = target as Function;
    const proto = ctor.prototype as object;

    for (const key of Object.getOwnPropertyNames(proto)) {
      if (DEFAULT_CLASS_EXCLUDE.has(key)) continue;

      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (!desc || typeof desc.value !== 'function') continue;

      wrapMethod(key, desc, options, ctor.name);
      Object.defineProperty(proto, key, desc);
    }

    return ctor;
  }) as ClassDecorator & MethodDecorator;
}

function wrapMethod(
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  options: WithSpanOptions & { name?: string },
  className: string,
  nameOverride?: string,
): void {
  const original = descriptor.value as FlaggedFn;
  if (typeof original !== 'function') {
    throw new Error('@Traced() can only wrap methods');
  }
  if (original[TRACED_FLAG] || original[EXCLUDE_TRACE_FLAG]) return;

  const spanName = nameOverride ?? `${className}.${String(propertyKey)}`;

  const wrapped: FlaggedFn = function (this: unknown, ...args: unknown[]) {
    return withSpan(spanName, () => original.apply(this, args), options);
  };
  wrapped[TRACED_FLAG] = true;
  // Nest/Swagger attach @Post/@Api* metadata onto the method function itself.
  copyReflectMetadata(original, wrapped);
  Object.defineProperty(wrapped, 'name', {
    value: original.name,
    configurable: true,
  });

  descriptor.value = wrapped;
}

function copyReflectMetadata(from: object, to: object): void {
  for (const key of Reflect.getMetadataKeys(from)) {
    Reflect.defineMetadata(key, Reflect.getMetadata(key, from), to);
  }
}
