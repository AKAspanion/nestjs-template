import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppException } from 'src/exception/http-exception.filter';
import { handleException } from 'src/exception/utils';

@Injectable()
export class ClientIdSecretMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ClientIdSecretMiddleware.name);

  // constructor(private sdkConfigService: SdkConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...headers } = req.headers;

      const clientIdQuery = (req.query.client_id || '') as string;

      const clientId = headers['x-client-id'] || clientIdQuery;

      if (!clientId || typeof clientId !== 'string' || clientId.trim() === '') {
        throw new AppException('GEN0000');
      }

      const client = '';

      // const client = await this.sdkConfigService.getClientIdSecret(clientId);

      if (!client) {
        throw new AppException('GEN0001');
      }

      // req.headers['x-tenant-id'] = client.tenantId;

      next();
    } catch (error) {
      this.logger.error(error);
      handleException(error);
    }
  }
}
