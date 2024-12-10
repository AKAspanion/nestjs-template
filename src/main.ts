import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { AuditService } from './modules/audit/audit.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeOpenTelemetry } from './common/opentelemetry/opentelemetry';
import { Logger, VersioningType } from '@nestjs/common';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { TracingInterceptor } from './modules/tracing/tracing.interceptor';
import { APP_NAME, VERSIONS } from './constants/app';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { engine } from 'express-handlebars';

export async function bootstrap() {
  startOTEL();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // use view engine
  app.setBaseViewsDir([
    join(__dirname, '..', 'views/docs'),
    join(__dirname, '..', 'views/admin'),
  ]);
  app.engine(
    'hbs',
    engine({
      extname: 'hbs',
      partialsDir: join(__dirname, '..', 'views/partials'),
      layoutsDir: join(__dirname, '..', 'views/layouts'),
    }),
  );
  app.setViewEngine('hbs');

  // Apply tracing interceptor globally
  app.useGlobalInterceptors(new TracingInterceptor());

  app.enableCors();

  app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSIONS,
  });

  const config = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(`${APP_NAME} REST API Documentation`)
    .setVersion('1.0')
    .addTag(APP_NAME)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  writeFileSync(
    join(__dirname, '../src/', 'swagger.json'),
    JSON.stringify(document, null, 2),
    { encoding: 'utf8' },
  );
  SwaggerModule.setup('api', app, document);

  const auditService = app.get(AuditService);

  app.useGlobalFilters(new HttpExceptionFilter(auditService));

  const port = process.env.PORT || 3000;

  app.enableShutdownHooks();

  await app.listen(port);
}

async function startOTEL() {
  try {
    const otelObj = await initializeOpenTelemetry();
    await otelObj.start();
  } catch (error) {
    Logger.error('Error starting OpenTelemetry', error);
  }
}

bootstrap().catch(handleError);

function handleError(error: unknown) {
  console.error(error);
  process.exit(1);
}

process.on('uncaughtException', handleError);
