import { Controller, Get, Res, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { APP_NAME } from 'src/constants/app';

@Controller({ version: VERSION_NEUTRAL, path: 'docs' })
export class DocsController {
  @ApiExcludeEndpoint()
  @Get()
  getHello(@Res() res: Response) {
    return res.render('index', { layout: 'docs', message: `${APP_NAME}` });
  }
}
