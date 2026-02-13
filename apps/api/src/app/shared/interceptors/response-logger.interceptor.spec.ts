import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ResponseLoggerInterceptor } from './response-logger.interceptor';
import type { Request, Response } from 'express';

describe('ResponseLoggerInterceptor', () => {
  let interceptor: ResponseLoggerInterceptor;
  let configService: ConfigService;
  let mockLogger: jest.SpyInstance;

  const createMockExecutionContext = (
    method: string,
    url: string,
    statusCode: number,
    contentType?: string
  ): ExecutionContext => {
    const mockGetFunction = jest.fn((header: string) => {
      if (header === 'user-agent') return 'test-agent';
      if (header === 'set-cookie') return [];
      return undefined;
    }) as unknown as Request['get'];

    const mockRequest: Partial<Request> = {
      method,
      url,
      get: mockGetFunction,
      headers: {},
      socket: { remoteAddress: '127.0.0.1' } as never,
    };

    const mockResponse: Partial<Response> = {
      statusCode,
      get: jest.fn((header: string) => {
        if (header === 'Content-Type') return contentType;
        if (header === 'Content-Length') return '1024';
        return undefined;
      }),
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest as Request,
        getResponse: () => mockResponse as Response,
        getNext: jest.fn(),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;
  };

  const createMockCallHandler = (data?: unknown): CallHandler => ({
    handle: () => (data ? of(data) : of(undefined)),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponseLoggerInterceptor,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                'ENABLE_RESPONSE_LOGGING': 'true',
                'RESPONSE_LOG_LEVEL': 'log',
                'RESPONSE_LOG_EXCLUDE_PATHS': '/health,/events',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    interceptor = module.get<ResponseLoggerInterceptor>(ResponseLoggerInterceptor);
    configService = module.get<ConfigService>(ConfigService);

    // Spy on logger methods
    mockLogger = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('successful requests', () => {
    it('should log GET request with 200 status', (done) => {
      const context = createMockExecutionContext('GET', '/api/projects', 200);
      const handler = createMockCallHandler({ data: 'test' });

      interceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).toHaveBeenCalledWith(
          expect.stringContaining('GET /api/projects 200')
        );
        expect(mockLogger).toHaveBeenCalledWith(
          expect.stringContaining('ms')
        );
        done();
      });
    });

    it('should log POST request with 201 status', (done) => {
      const context = createMockExecutionContext('POST', '/api/agent-jobs', 201);
      const handler = createMockCallHandler({ id: 1 });

      interceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).toHaveBeenCalledWith(
          expect.stringContaining('POST /api/agent-jobs 201')
        );
        done();
      });
    });

    it('should log PUT request with 200 status', (done) => {
      const context = createMockExecutionContext('PUT', '/api/projects/1', 200);
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).toHaveBeenCalledWith(
          expect.stringContaining('PUT /api/projects/1 200')
        );
        done();
      });
    });

    it('should log DELETE request with 204 status', (done) => {
      const context = createMockExecutionContext('DELETE', '/api/agent-jobs/1', 204);
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).toHaveBeenCalledWith(
          expect.stringContaining('DELETE /api/agent-jobs/1 204')
        );
        done();
      });
    });
  });

  describe('error handling', () => {
    it('should log 404 errors', (done) => {
      const context = createMockExecutionContext('GET', '/api/nonexistent', 404);
      const errorHandler: CallHandler = {
        handle: () => throwError(() => ({ status: 404, message: 'Not Found' })),
      };
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      interceptor.intercept(context, errorHandler).subscribe({
        error: () => {
          expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('GET /api/nonexistent 404')
          );
          expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Not Found')
          );
          done();
        },
      });
    });

    it('should log 400 validation errors', (done) => {
      const context = createMockExecutionContext('POST', '/api/agent-jobs', 400);
      const errorHandler: CallHandler = {
        handle: () => throwError(() => ({ status: 400, message: 'Validation failed' })),
      };
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      interceptor.intercept(context, errorHandler).subscribe({
        error: () => {
          expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('POST /api/agent-jobs 400')
          );
          expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Validation failed')
          );
          done();
        },
      });
    });

    it('should log 500 internal server errors', (done) => {
      const context = createMockExecutionContext('GET', '/api/error', 500);
      const errorHandler: CallHandler = {
        handle: () => throwError(() => ({ status: 500, message: 'Internal error' })),
      };
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      interceptor.intercept(context, errorHandler).subscribe({
        error: () => {
          expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('GET /api/error 500')
          );
          done();
        },
      });
    });

    it('should default to 500 for errors without status', (done) => {
      const context = createMockExecutionContext('GET', '/api/error', 500);
      const errorHandler: CallHandler = {
        handle: () => throwError(() => new Error('Unexpected error')),
      };
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      interceptor.intercept(context, errorHandler).subscribe({
        error: () => {
          expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('500')
          );
          done();
        },
      });
    });
  });

  describe('exclusion logic', () => {
    it('should skip SSE endpoints with /events in URL', (done) => {
      const context = createMockExecutionContext('GET', '/api/agent-jobs/1/events', 200);
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).not.toHaveBeenCalled();
        done();
      });
    });

    it('should skip SSE endpoints with text/event-stream Content-Type', (done) => {
      const context = createMockExecutionContext(
        'GET',
        '/api/stream',
        200,
        'text/event-stream'
      );
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).not.toHaveBeenCalled();
        done();
      });
    });

    it('should skip health check endpoints', (done) => {
      const context = createMockExecutionContext('GET', '/api/health', 200);
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).not.toHaveBeenCalled();
        done();
      });
    });

    it('should skip paths matching exclude patterns', (done) => {
      const context = createMockExecutionContext('GET', '/api/health/status', 200);
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('configuration', () => {
    it('should respect ENABLE_RESPONSE_LOGGING=false', (done) => {
      jest.spyOn(configService, 'get').mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'ENABLE_RESPONSE_LOGGING') return 'false';
        return defaultValue;
      });

      // Create new instance with updated config
      const disabledInterceptor = new ResponseLoggerInterceptor(configService);
      const context = createMockExecutionContext('GET', '/api/projects', 200);
      const handler = createMockCallHandler();

      disabledInterceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).not.toHaveBeenCalled();
        done();
      });
    });

    it('should use debug log level when configured', (done) => {
      jest.spyOn(configService, 'get').mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'RESPONSE_LOG_LEVEL') return 'debug';
        if (key === 'ENABLE_RESPONSE_LOGGING') return 'true';
        if (key === 'RESPONSE_LOG_EXCLUDE_PATHS') return '/health,/events';
        return defaultValue;
      });

      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      const debugInterceptor = new ResponseLoggerInterceptor(configService);
      const context = createMockExecutionContext('GET', '/api/projects', 200);
      const handler = createMockCallHandler();

      debugInterceptor.intercept(context, handler).subscribe(() => {
        expect(debugSpy).toHaveBeenCalled();
        expect(debugSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET /api/projects 200')
        );
        // Debug mode includes JSON metadata
        expect(debugSpy).toHaveBeenCalledWith(
          expect.stringContaining('"method"')
        );
        done();
      });
    });

    it('should use verbose log level when configured', (done) => {
      jest.spyOn(configService, 'get').mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'RESPONSE_LOG_LEVEL') return 'verbose';
        if (key === 'ENABLE_RESPONSE_LOGGING') return 'true';
        if (key === 'RESPONSE_LOG_EXCLUDE_PATHS') return '/health,/events';
        return defaultValue;
      });

      const verboseSpy = jest.spyOn(Logger.prototype, 'verbose');
      const verboseInterceptor = new ResponseLoggerInterceptor(configService);
      const context = createMockExecutionContext('GET', '/api/projects', 200);
      const handler = createMockCallHandler();

      verboseInterceptor.intercept(context, handler).subscribe(() => {
        expect(verboseSpy).toHaveBeenCalled();
        expect(verboseSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET /api/projects 200')
        );
        done();
      });
    });
  });

  describe('response metadata', () => {
    it('should measure response time accurately', (done) => {
      const context = createMockExecutionContext('GET', '/api/projects', 200);
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        const logCall = mockLogger.mock.calls[0][0];
        expect(logCall).toMatch(/\d+ms/);
        done();
      });
    });

    it('should handle missing headers gracefully', (done) => {
      const mockGetFunction = jest.fn((header: string) => {
        if (header === 'set-cookie') return [];
        return undefined;
      }) as unknown as Request['get'];

      const mockRequest: Partial<Request> = {
        method: 'GET',
        url: '/api/test',
        get: mockGetFunction,
        headers: {},
        socket: {} as never,
      };

      const mockResponse: Partial<Response> = {
        statusCode: 200,
        get: jest.fn(() => undefined),
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest as Request,
          getResponse: () => mockResponse as Response,
          getNext: jest.fn(),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      } as ExecutionContext;

      const handler = createMockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(mockLogger).toHaveBeenCalled();
        done();
      });
    });
  });
});
