// token.service.ts

import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AppException } from 'src/exception/http-exception.filter';

@Injectable()
export class TokenizationService {
  private readonly jwt_secret: string;
  constructor(private readonly configService: ConfigService) {
    this.jwt_secret = this.configService.get<string>('JWT_SECRET');
  }

  // Method to generate JWT token
  generateToken(payload: any, expiresIn: string = '1d'): string {
    try {
      return jwt.sign(payload, this.jwt_secret, { expiresIn });
    } catch (error) {
      throw new AppException('GEN1001', error);
    }
  }

  // Method to verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwt_secret);
    } catch (error) {
      throw new AppException('GEN1002', error);
    }
  }
}
