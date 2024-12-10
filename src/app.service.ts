import { Injectable } from '@nestjs/common';
import { APP_NAME } from './constants/app';

@Injectable()
export class AppService {
  async getHello() {
    return `Hello from ${APP_NAME}!!`;
  }
}
