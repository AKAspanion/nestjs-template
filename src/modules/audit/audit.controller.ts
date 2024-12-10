import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditPayload } from './dto/create-audit.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  async handleAudit(data: AuditPayload) {
    return this.auditService.create(data);
  }

  @Post('/')
  async addAudit(@Body() data: AuditPayload, @Req() req: Request) {
    const headers = req.headers;
    data.data = { data: { ...data.data }, headers };
    return this.auditService.create(data);
  }
}
