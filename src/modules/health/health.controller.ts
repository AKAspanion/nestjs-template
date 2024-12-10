import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { DBService } from 'src/db/db.service';
import { RabbitMQHealthCheckService } from './health.rabbitmq';

@ApiTags('Health check')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: PrismaHealthIndicator,
    private prisma: DBService,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly rabbitmq: RabbitMQHealthCheckService,
  ) {}

  // Endpoint for checking server health
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
      () => this.memory.checkHeap('memory_heap', 3000 * 1024 * 1024),
      () => this.db.pingCheck('database', this.prisma, {}),
      () => this.rabbitmq.check(),
    ]);
  }
}
