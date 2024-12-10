import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RabbitMQHealthCheckService extends HealthIndicator {
  constructor(private readonly audit: AuditService) {
    super();
  }

  async check(): Promise<HealthIndicatorResult> {
    const isConnected = this.audit.connection.isConnected();
    const status = this.getStatus('rabbitmq', isConnected);
    if (isConnected) {
      return status;
    }

    throw new HealthCheckError('RabbitMQ is not reachable', status);
  }
}
