export const APP_NAME = 'NestJS Template';
export const APP_SLUG = 'template-be';

export const VERSIONS = ['1'];
export const THROTTLE_SECONDS = 60;
export const THROTTLE_LIMIT = 50;

export const EXPIRE_CHALLENGE_AFTER_MINS = 5;
export const EXPIRE_SIM_BINDING_AFTER_MINS = 5;

export const OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';
export const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

export const TRACER_NAME = `${APP_SLUG}`;
