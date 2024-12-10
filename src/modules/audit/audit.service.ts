import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { AuditLogDbService } from 'src/db/audit-log/audit-log-db.service';
import { AuditPayload } from './dto/create-audit.dto';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import { RABBITMQ_URL } from 'src/constants/app';
import { ResponseUtil } from 'src/utils/helpers/response-utils';

@Injectable()
export class AuditService implements OnModuleInit {
  public connection: IAmqpConnectionManager;
  private channelWrapper: ChannelWrapper;
  private dlqChannelWrapper: ChannelWrapper;
  private readonly maxAttempts = 3; // Maximum retry attempts

  constructor(private auditDBService: AuditLogDbService) {
    this.connection = amqp.connect([RABBITMQ_URL]);
    this.channelWrapper = this.connection.createChannel();
    this.dlqChannelWrapper = this.connection.createChannel();
  }

  async sendToQueue(queue: string, content: AuditPayload) {
    try {
      await this.channelWrapper.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(content)),
      );
    } catch (error) {
      Logger.error('Error sending message to queue:', error);
      await this.retrySendToQueue(queue, content);
    }
  }

  private async retrySendToQueue(
    queue: string,
    content: AuditPayload,
    attempt: number = 1,
  ) {
    const maxAttempts = 3; // Maximum retry attempts
    const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff

    if (attempt > maxAttempts) {
      Logger.log('Max retry attempts exceeded, message not sent:', content);
      return;
    }

    try {
      Logger.log(`Retrying sendToQueue attempt ${attempt} for queue ${queue}`);
      await this.channelWrapper.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(content)),
      );
    } catch (error) {
      Logger.error(`Retry attempt ${attempt} failed:`, error);
      // Retry with backoff
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await this.retrySendToQueue(queue, content, attempt + 1);
    }
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue('auditQueue', { durable: true });
        await channel.consume('auditQueue', async (data) => {
          if (data) {
            const content = JSON.parse(data.content.toString());
            try {
              await this.auditDBService.create(content);
              // await this.emailService.sendEmail(content);
              channel.ack(data);
            } catch (error) {
              Logger.error('Error processing message:', error);
              if (content.attempts < this.maxAttempts) {
                content.attempts = content.attempts ? content.attempts + 1 : 1;
                await channel.nack(data, false, true);
              } else {
                Logger.error('Max retry attempts exceeded, moving to DLQ');
                await this.handleFailedMessage(channel, data);
              }
            }
          }
        });
      });

      await this.dlqChannelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue('auditQueue-dlq', { durable: true });
        await channel.consume('auditQueue-dlq', async (data) => {
          if (data) {
            const content = JSON.parse(data.content.toString());
            try {
              await this.auditDBService.create(content);
              channel.ack(data);
            } catch (error) {
              Logger.error('Error processing DLQ message:', error);
              await this.archiveMessage(data);
              channel.ack(data);
            }
          }
        });
      });
      console.log('Consumer service started and listening for messages.');
    } catch (err) {
      console.log('Error starting the consumer:', err);
    }
  }

  private async handleFailedMessage(channel: ConfirmChannel, data: any) {
    try {
      await this.sendToQueue(
        'auditQueue-dlq',
        JSON.parse(data.content.toString()),
      );
      channel.ack(data);
    } catch (error) {
      console.error('Failed to handle message:', error);
      channel.ack(data);
    }
  }

  private async archiveMessage(data: AuditPayload) {
    try {
      await this.sendToQueue('auditQueue-archived', data);
      console.log('Message archived successfully.');
    } catch (error) {
      console.error('Error archiving message:', error);
    }
  }

  async create(queueData: AuditPayload) {
    await this.sendToQueue('auditQueue', queueData);
    return ResponseUtil.success({}, 'Success');
  }

  async audit(
    action: string,
    message: string,
    status: string,
    data: object = {},
    identity: string | null = null,
    tenantId: string | null = null,
  ) {
    Logger.log('audit function called');

    const queueData = {
      tenantId,
      message,
      action,
      status,
      identity,
      data,
    };
    await this.sendToQueue('auditQueue', queueData);
  }
}
