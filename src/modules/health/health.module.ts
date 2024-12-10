import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { RabbitMQHealthCheckService } from './health.rabbitmq';
import { AuditService } from '../audit/audit.service';
import { AuditLogDbService } from 'src/db/audit-log/audit-log-db.service';
import { AuditLogDbRepository } from 'src/db/audit-log/audit-log-db.repository';

@Module({
  imports: [
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
    HttpModule,
  ],
  providers: [
    RabbitMQHealthCheckService,
    AuditService,
    AuditLogDbService,
    AuditLogDbRepository,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
