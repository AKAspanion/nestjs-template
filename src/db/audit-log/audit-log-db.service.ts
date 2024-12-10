import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuditLogDbRepository } from './audit-log-db.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogDbService {
  constructor(private readonly auditRepository: AuditLogDbRepository) {}

  /**
   * Creates a new audit log record in the database.
   * @param data The data for creating the log.
   * @returns The newly created audit record.
   * @throws Error if any other error occurs during database interaction.
   */
  async create(data) {
    try {
      return await this.auditRepository.create(data);
    } catch (error) {
      console.error('Error while creating audit log:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          'Database error while creating audit log',
        );
      }
      throw new InternalServerErrorException('Error while creating audit log');
    }
  }
}
