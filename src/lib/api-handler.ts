// API response wrapper with error handling
import { logger } from './logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Handler = (req: Request) => Promise<Response>;

/**
 * Wraps an API handler with error handling and logging
 */
export function withErrorHandler(handler: Handler): Handler {
  return async (req: Request) => {
    const startTime = Date.now();
    const method = req.method;
    const path = new URL(req.url).pathname;

    try {
      logger.debug(`API Request: ${method} ${path}`);
      const response = await handler(req);
      const duration = Date.now() - startTime;
      
      logger.info(`API Response: ${method} ${path}`, {
        status: response.status,
        duration: `${duration}ms`,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof ApiError) {
        logger.warn(`API Error: ${method} ${path}`, {
          status: error.statusCode,
          code: error.code,
          duration: `${duration}ms`,
          error: error.message,
        });

        return Response.json(
          {
            success: false,
            error: {
              message: error.message,
              code: error.code,
            },
          } as ApiResponse,
          { status: error.statusCode },
        );
      }

      // Unexpected error
      logger.error(`Unexpected API Error: ${method} ${path}`, error, {
        duration: `${duration}ms`,
      });

      return Response.json(
        {
          success: false,
          error: {
            message: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
          },
        } as ApiResponse,
        { status: 500 },
      );
    }
  };
}

/**
 * Creates a successful API response
 */
export function successResponse<T>(data: T, statusCode = 200): Response {
  return Response.json(
    {
      success: true,
      data,
    } as ApiResponse<T>,
    { status: statusCode },
  );
}

/**
 * Creates an error API response
 */
export function errorResponse(
  message: string,
  statusCode = 400,
  code?: string,
): Response {
  return Response.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    } as ApiResponse,
    { status: statusCode },
  );
}
