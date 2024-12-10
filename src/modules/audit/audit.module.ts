import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { DBModule } from 'src/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { AuditLogDbRepository } from 'src/db/audit-log/audit-log-db.repository';

@Module({
  imports: [ConfigModule, DBModule],
  controllers: [AuditController],
  providers: [AuditService, AuditLogDbRepository],
  exports: [AuditService],
})
export class AuditModule {}
