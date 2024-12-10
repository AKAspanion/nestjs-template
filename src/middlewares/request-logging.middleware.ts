import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('RequestLoggingMiddleware');

  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    this.logger.log(
      `Request: ${this.formattedDate()} ${method} ${originalUrl}`,
    );
    next();
  }

  formattedDate() {
    const d = new Date();
    return `${d.toISOString()}`;
  }
}
