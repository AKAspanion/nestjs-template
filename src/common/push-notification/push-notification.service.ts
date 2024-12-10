import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { JWT } from 'google-auth-library';
import { AppException } from 'src/exception/http-exception.filter';
import { handleException } from 'src/exception/utils';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  // constructor(private readonly tenantConfigService: TenantConfigService) {}

  private async callNotificationServer(
    accessToken: string,
    project: string,
    payload: any,
  ) {
    return axios.post(
      `https://fcm.googleapis.com/v1/projects/${project}/messages:send`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );
  }

  private async getAccessToken(key): Promise<string> {
    const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
    return new Promise(function (resolve, reject) {
      const jwtClient = new JWT(
        key.client_email,
        null,
        key.private_key,
        SCOPES,
        null,
      );
      jwtClient.authorize(function (err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
    });
  }

  async sendNotification(
    tenantId: string,
    token: string,
    title: string,
    body: string,
    data: any,
  ): Promise<void> {
    try {
      const message = {
        token,
        notification: {
          title,
          body,
        },
        data,
      };
      // const config = await this.tenantConfigService.getTenantConfig(tenantId);
      // const serviceAccount = config?.firebase?.service_account;
      const serviceAccount: any = {};

      if (!serviceAccount) {
        throw new AppException('GEN0500');
      }

      const accessToken = await this.getAccessToken(serviceAccount);
      await this.callNotificationServer(
        accessToken,
        serviceAccount.project_id,
        { message },
      );
      this.logger.log(`Push notification sent successfully`);
    } catch (error) {
      this.logger.error('Error sending push notification', error);
      handleException(error);
    }
  }
}
