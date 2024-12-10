import { IsString, IsOptional, IsObject } from 'class-validator';

export class AuditPayload {
  @IsString()
  action: string;

  @IsString()
  message: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsObject()
  activityBy?: Record<string, any>;

  @IsString()
  identity: string;

  @IsString()
  tenantId: string;
}
