import { Injectable } from '@nestjs/common';
import { DBService } from '../db.service';
import { AuditLog } from '@prisma/client';

@Injectable()
export class AuditLogDbRepository {
  constructor(private readonly prisma: DBService) {}

  /**
   * Creates a new audit log record in the database.
   * @param data The data for creating the log.
   * @returns The newly created audit record.
   * @throws Error if any other error occurs during database interaction.
   */
  async create(data): Promise<AuditLog | null> {
    try {
      const newData = { ...data };
      if (data && typeof data.activityBy === 'object') {
        newData.activityBy = JSON.stringify(data.activityBy);
      }
      if (data && typeof data.data === 'object') {
        newData.data = JSON.stringify(data.data);
      }

      return await this.prisma.auditLog.create({
        data: newData,
      });
    } catch (error) {
      throw error;
    }
  }
}
