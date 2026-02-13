import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import type { Request, Response } from 'express';

interface ResponseLogData {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  responseSize?: number;
  ip?: string;
  userAgent?: string;
  error?: string;
}

@Injectable()
export class ResponseLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseLoggerInterceptor.name);
  private readonly enabled: boolean;
  private readonly logLevel: 'debug' | 'log' | 'verbose';
  private readonly excludePaths: string[];

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<string>('ENABLE_RESPONSE_LOGGING', 'true') === 'true';
    this.logLevel = this.configService.get<'debug' | 'log' | 'verbose'>('RESPONSE_LOG_LEVEL', 'log');

    const excludePathsString = this.configService.get<string>('RESPONSE_LOG_EXCLUDE_PATHS', '/health,/events');
    this.excludePaths = excludePathsString.split(',').map(path => path.trim());
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Skip if disabled or excluded
    if (!this.enabled || this.shouldExclude(request.url, response)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logResponse({
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          responseTime: Date.now() - startTime,
          responseSize: this.getResponseSize(response),
          ip: this.getClientIp(request),
          userAgent: request.get('user-agent'),
        });
      }),
      catchError((error) => {
        // Log error response
        this.logResponse({
          method: request.method,
          url: request.url,
          statusCode: error.status || 500,
          responseTime: Date.now() - startTime,
          ip: this.getClientIp(request),
          userAgent: request.get('user-agent'),
          error: error.message || 'Internal server error',
        });
        return throwError(() => error);
      }),
    );
  }

  private shouldExclude(url: string, response: Response): boolean {
    // Check if URL matches any excluded path pattern
    if (this.excludePaths.some(pattern => url.includes(pattern))) {
      return true;
    }

    // Skip SSE endpoints (text/event-stream)
    const contentType = response.get('Content-Type');
    if (contentType && contentType.includes('text/event-stream')) {
      return true;
    }

    return false;
  }

  private getResponseSize(response: Response): number | undefined {
    const contentLength = response.get('Content-Length');
    return contentLength ? parseInt(contentLength, 10) : undefined;
  }

  private getClientIp(request: Request): string | undefined {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket.remoteAddress
    );
  }

  private logResponse(data: ResponseLogData): void {
    const { method, url, statusCode, responseTime, error } = data;
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;

    // Include full metadata in debug mode
    if (this.logLevel === 'debug') {
      this.logger[this.logLevel](`${message} ${JSON.stringify(data)}`);
    } else {
      // Log errors at error level, success at configured level
      if (error) {
        this.logger.error(`${message} [${error}]`);
      } else {
        this.logger[this.logLevel](message);
      }
    }
  }
}
