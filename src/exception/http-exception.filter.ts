/**
 * Exception filter to handle HTTP exceptions.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SpanStatusCode } from '@opentelemetry/api';
import { Response } from 'express';
import { TraceService } from 'nestjs-otel';
import { ErrorKeys, Errors } from 'src/exception/errors.codes';
import { AuditService } from 'src/modules/audit/audit.service';

/**
 * Custom exception filter to handle HTTP exceptions.
 * This filter catches any HTTP exception thrown during the request handling process
 * and provides a standardized response format for error handling.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly auditService: AuditService,
    private readonly traceService: TraceService = new TraceService(),
  ) {}

  /**
   * Method to catch and handle HTTP exceptions.
   * @param exception The caught HTTP exception.
   * @param host The execution context.
   */
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionStatusCode = exception.getStatus();

    console.log('HTTP Exception', exception);

    // Start tracing and set span attributes
    const currentSpan = this.traceService.getSpan();
    currentSpan.setAttribute('http.method', request.method);
    currentSpan.setAttribute('http.url', request.url);
    currentSpan.setAttribute('http.request.body', JSON.stringify(request.body));
    currentSpan.setAttribute('http.headers', JSON.stringify(request.headers));

    currentSpan.setStatus({
      code: SpanStatusCode.ERROR,
      message: (exception as Error).message,
    });

    const errorData = exception.getResponse() as object;

    const code = errorData['code'];
    let message = '';
    let statusCode = 500;

    if (code) {
      const errorMetadata = Errors.get(code);

      message = errorMetadata.message || errorData['message'];
      statusCode = errorMetadata.statusCode || exceptionStatusCode;
    } else {
      message = errorData['message'] || '';
      statusCode = errorData['statusCode'];
    }

    const responseData = {
      status: 'Failure',
      errorCode: code || statusCode,
      error: { message },
      timestamp: new Date().toISOString(),
    };

    const auditLogEvent = {
      tenantId: '',
      identity: '',
      message: 'errorHandling',
      status: 'failure',
      action: 'SystemError',
      activityBy: {
        source: 'SYSTEM',
        identifier: '',
        metadata: {},
      },
      data: { responseData },
    };
    this.auditService.sendToQueue('auditQueue', auditLogEvent);
    return response.status(statusCode).send(responseData);
  }
}

export class AppException extends HttpException {
  constructor(code: ErrorKeys, error: any = {}) {
    super({ code, error }, HttpStatus.BAD_REQUEST);
  }
}
