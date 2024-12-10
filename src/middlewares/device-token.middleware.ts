import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenizationService } from 'src/common/tokenization/tokenization.service';

@Injectable()
export class DecodeTokenMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DecodeTokenMiddleware.name);

  constructor(private readonly tokenService: TokenizationService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader) {
      this.logger.error('Authorization header is missing');
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      this.logger.error('Token is missing from authorization header');
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const decodedToken = this.tokenService.verifyToken(token);

      // Attach the decoded token information to the request body
      req.body.device = decodedToken;

      next();
    } catch (error) {
      this.logger.error('Invalid token', error.stack);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
