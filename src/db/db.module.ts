import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DBService } from './db.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DBService],
  exports: [DBService],
})
export class DBModule {}
