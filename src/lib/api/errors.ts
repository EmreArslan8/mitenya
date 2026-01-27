import { NextResponse } from 'next/server';

// Error codes
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// Standard API error response
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCodeType;
    message: string;
    details?: unknown;
  };
}

// Standard API success response
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper functions to create responses
export function createErrorResponse(
  code: ErrorCodeType,
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

export function createSuccessResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

// Pre-built error responses
export const ApiErrors = {
  validationError: (details?: unknown) =>
    createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Invalid request parameters', 400, details),

  notFound: (resource = 'Resource') =>
    createErrorResponse(ErrorCode.NOT_FOUND, `${resource} not found`, 404),

  unauthorized: () =>
    createErrorResponse(ErrorCode.UNAUTHORIZED, 'Authentication required', 401),

  forbidden: () =>
    createErrorResponse(ErrorCode.FORBIDDEN, 'Access denied', 403),

  internalError: (message = 'An unexpected error occurred') =>
    createErrorResponse(ErrorCode.INTERNAL_ERROR, message, 500),

  badRequest: (message: string) =>
    createErrorResponse(ErrorCode.BAD_REQUEST, message, 400),

  rateLimited: () =>
    createErrorResponse(ErrorCode.RATE_LIMITED, 'Too many requests', 429),
};

// Type guard for checking API errors
export function isApiError(response: ApiResponse<unknown>): response is ApiErrorResponse {
  return !response.success;
}

// Result type for internal use (similar to Rust's Result)
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
