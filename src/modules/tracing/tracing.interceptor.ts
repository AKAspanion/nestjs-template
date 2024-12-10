import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';
import * as api from '@opentelemetry/api';
import { trace } from '@opentelemetry/api';
import { Request, Response } from 'express';
import { stringify } from 'flatted';
import { TRACER_NAME } from 'src/constants/app';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  private readonly tracer = trace.getTracer(TRACER_NAME);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    Logger.debug('TracingInterceptor: intercept()');
    const request: Request = context.switchToHttp().getRequest();

    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    const { method, path } = request;

    return this.tracer.startActiveSpan(
      `HTTP : ${method} ${path}: ${controllerName}.${handlerName}`,
      (span) => {
        span.setAttribute('http.method', method);
        // span.setAttribute('http.url', url);
        span.setAttribute('http.path', path);

        //commenting the body addition in traces
        // if (method === 'POST' || method === 'post') {
        //   const sanitizedRequestBody = this.sanitizeRequestBody(request.body);
        //   span.setAttribute(
        //     'http.request.body',
        //     stringify(sanitizedRequestBody),
        //   );
        // }

        return next.handle().pipe(
          tap({
            next: (val) => {
              Logger.log('TracingInterceptor: next()', val);
              span.setStatus({ code: api.SpanStatusCode.OK });
              span.end();
            },
            error: (err) => {
              Logger.error('TracingInterceptor: error', {
                err: stringify(err),
              });
              const response: Response = context.switchToHttp().getResponse(); // Access the response object
              span.setStatus({
                code: api.SpanStatusCode.ERROR,
                message: err.message,
              });
              Logger.debug('TracingInterceptor: response API', {
                response: stringify(response),
              });

              // Capture the response body
              const responseBody = response.locals?.responseBody || {}; // Assuming you store response body in `locals`
              span.setAttribute('http.response.body', stringify(responseBody));

              // Capture the response headers
              const responseHeaders = response.getHeaders();
              span.setAttribute(
                'http.response.headers',
                stringify(responseHeaders),
              );
              span.recordException(err);
              span.end();
              Logger.log('TracingInterceptor: end');
              throw err;
            },
          }),
        );
      },
    );
  }

  // Sanitize request body to avoid capturing sensitive data
  sanitizeRequestBody(body: any): any {
    // Implement custom logic to remove sensitive fields
    const sanitizedBody = { ...body };
    // For example, if the body contains a "password" field, you can redact it
    if (sanitizedBody.password) {
      sanitizedBody.password = '[REDACTED]';
    }
    return sanitizedBody;
  }
}
