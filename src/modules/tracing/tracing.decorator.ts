import * as api from '@opentelemetry/api';
import { SetMetadata } from '@nestjs/common';
import { contextBase } from '@opentelemetry/sdk-node';
import { copyMetadataFromFunctionToFunction } from 'nestjs-otel/lib/opentelemetry.utils';
import { snakeCase, startCase } from 'lodash';
import { TRACER_NAME } from 'src/constants/app';

export const TRACE_SPAN = 'TRACE_SPAN';

// Apply this decorator to any method to auto-trace it
export const TraceDecorator = (spanName?: string): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    SetMetadata(TRACE_SPAN, spanName)(target, propertyKey, descriptor);
  };
};

export function TraceMethod(
  spanName?: string,
  additionalData?: (args: any[]) => Record<string, any>, // Pass a function to generate dynamic data
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const tracer = api.trace.getTracer(TRACER_NAME);

    descriptor.value = async function (...args: any[]) {
      const methodSpan = tracer.startSpan(spanName || propertyKey);

      // Use the provided function to generate dynamic attributes
      if (additionalData) {
        const attributes = additionalData(args);
        Object.keys(attributes).forEach((key) => {
          methodSpan.setAttribute(key, attributes[key]);
        });
      }

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        methodSpan.recordException(error);
        throw error;
      } finally {
        methodSpan.end();
      }
    };

    return descriptor;
  };
}

function ExecutionTimeHistogram({
  description,
  unit = 'ms',
  valueType = contextBase.ValueType.DOUBLE,
}: contextBase.MetricOptions = {}) {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    // if (!repoMetrics || process.env.OTEL_SDK_DISABLED) {
    //   return;
    // }

    const method = descriptor.value;
    const className = target.constructor.name as string;
    const propertyName = String(propertyKey);
    const metricName = `${snakeCase(className).replaceAll(/_(?=(repository)|(controller)|(provider)|(service)|(module))/g, '.')}.${snakeCase(propertyName)}.duration`;

    const metricDescription =
      description ??
      `The elapsed time in ${unit} for the ${startCase(className)} to ${startCase(propertyName).toLowerCase()}`;

    let histogram: contextBase.Histogram | undefined;

    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = method.apply(this, args);

      void Promise.resolve(result)
        .then(() => {
          const end = performance.now();
          if (!histogram) {
            histogram = contextBase.metrics
              .getMeter('naoPaymentsMetricsHistogram')
              .createHistogram(metricName, {
                description: metricDescription,
                unit,
                valueType,
              });
          }
          histogram.record(end - start, {});
        })
        .catch(() => {
          // noop
        });

      return result;
    };

    copyMetadataFromFunctionToFunction(method, descriptor.value);
  };
}

export function DecorateAll(
  decorator: <T>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) => TypedPropertyDescriptor<T> | void,
) {
  return (target: any) => {
    const descriptors = Object.getOwnPropertyDescriptors(target.prototype);
    for (const [propName, descriptor] of Object.entries(descriptors)) {
      const isMethod =
        typeof descriptor.value == 'function' && propName !== 'constructor';
      if (!isMethod) {
        continue;
      }
      decorator(
        {
          ...target,
          constructor: { ...target.constructor, name: target.name } as any,
        },
        propName,
        descriptor,
      );
      Object.defineProperty(target.prototype, propName, descriptor);
    }
  };
}

export const Instrumentation = () => DecorateAll(ExecutionTimeHistogram());
