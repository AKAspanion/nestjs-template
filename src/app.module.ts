import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DBModule } from './db/db.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RequestLoggingMiddleware } from './middlewares/request-logging.middleware';
import { EncryptionService } from './common/encryption/encryption.service';
import { APP_SLUG, THROTTLE_LIMIT, THROTTLE_SECONDS } from './constants/app';
import { OpenTelemetryModule } from 'nestjs-otel';
import { TracingModule } from './modules/tracing/tracing.module';
import { HealthModule } from './modules/health/health.module';
import { DocsModule } from './modules/docs/docs.module';

const OpenTelemetryModuleConfig = OpenTelemetryModule.forRoot({
  metrics: {
    hostMetrics: true,
    apiMetrics: {
      enable: true,
      defaultAttributes: {
        custom: 'label',
      },
      ignoreRoutes: ['/favicon.ico'],
      ignoreUndefinedRoutes: false,
      prefix: APP_SLUG,
    },
  },
});

@Module({
  imports: [
    TracingModule,
    OpenTelemetryModuleConfig,
    DBModule,
    HealthModule,
    CronjobsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      renderPath: '/client',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: THROTTLE_SECONDS * 1000,
        limit: THROTTLE_LIMIT,
      },
    ]),
    CacheModule.register({
      ttl: 60000,
      max: 100,
      isGlobal: true,
    }),
    DocsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EncryptionService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
