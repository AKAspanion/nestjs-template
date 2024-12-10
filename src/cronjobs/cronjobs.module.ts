import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { AuditService } from 'src/modules/audit/audit.service';
import { AuditLogDbService } from 'src/db/audit-log/audit-log-db.service';
import { AuditLogDbRepository } from 'src/db/audit-log/audit-log-db.repository';

@Module({
  providers: [
    CronjobsService,
    AuditService,
    AuditLogDbService,
    AuditLogDbRepository,
  ],
})
export class CronjobsModule {}
