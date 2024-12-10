import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditService } from 'src/modules/audit/audit.service';

@Injectable()
export class CronjobsService {
  callsCount = 0;

  constructor(private readonly auditService: AuditService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async testCron() {
    ++this.callsCount;
    const currDate = new Date();
    console.log(currDate, 'Running cron job every minute');

    const activityData = {
      action: 'cron-test',
      status: 'run',
      message: 'Running test cron job',
      activityBy: { source: 'SYSTEM', metadata: {} },
      data: {},
    };

    this.auditService.sendToQueue('auditQueue', activityData);
  }
}
