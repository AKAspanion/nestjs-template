import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AppException } from 'src/exception/http-exception.filter';

export interface Pagination {
  page: number;
  limit: number;
  size: number;
  offset: number;
}

export const PaginationParams = createParamDecorator(
  (data, ctx: ExecutionContext): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest();
    const queryPage = (req.query.page || '1') as string;
    const querySize = (req.query.size || '20') as string;
    const page = parseInt(queryPage);
    const size = parseInt(querySize);

    if (isNaN(page) || page <= 0 || isNaN(size) || size <= 0) {
      throw new AppException('GEN0002');
    }
    if (size > 100) {
      throw new AppException('GEN0003');
    }

    const limit = size;
    const offset = (page - 1) * limit;
    return { page, limit, size, offset };
  },
);
