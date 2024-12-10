import * as process from 'process';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import * as api from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'; // HTTP exporter
import { OTLP_ENDPOINT } from 'src/constants/app';

let otelSDK: NodeSDK | null = null;

export async function initializeOpenTelemetry() {
  if (!otelSDK) {
    const contextManager = new AsyncHooksContextManager().enable();
    api.context.setGlobalContextManager(contextManager);

    const otlpExporter = new OTLPTraceExporter({
      // url: 'http://otel-collector:4318/v1/traces',
      url: `${OTLP_ENDPOINT}/v1/traces`,
    });

    otelSDK = new NodeSDK({
      traceExporter: otlpExporter,
      spanProcessor: new BatchSpanProcessor(otlpExporter),
      contextManager: contextManager,
      textMapPropagator: new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator(),
          new B3Propagator(),
          new B3Propagator({
            injectEncoding: B3InjectEncoding.MULTI_HEADER,
          }),
        ],
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
          '@opentelemetry/instrumentation-express': { enabled: true },
        }),
        new NestInstrumentation(),
        new PrismaInstrumentation(),
      ],
    });

    return otelSDK;
  }
}

export async function shutdownOpenTelemetry() {
  return otelSDK.shutdown().then(
    () => console.log('SDK shut down successfully'),
    // (err) => console.log('Error shutting down SDK', err),
  );
}

process.on('SIGTERM', () => {
  shutdownOpenTelemetry().finally(() => process.exit(0));
});

export default otelSDK;
