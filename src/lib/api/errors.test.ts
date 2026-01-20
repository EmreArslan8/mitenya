import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  ApiErrors,
  createErrorResponse,
  createSuccessResponse,
  isApiError,
  ok,
  err,
} from './errors';

describe('ErrorCode', () => {
  it('should have all required error codes', () => {
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
    expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    expect(ErrorCode.BAD_REQUEST).toBe('BAD_REQUEST');
    expect(ErrorCode.RATE_LIMITED).toBe('RATE_LIMITED');
  });
});

describe('createErrorResponse', () => {
  it('should create error response with correct structure', async () => {
    const response = createErrorResponse(
      ErrorCode.NOT_FOUND,
      'Product not found',
      404
    );

    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBe('Product not found');
    expect(response.status).toBe(404);
  });

  it('should include details when provided', async () => {
    const details = { field: 'email', issue: 'invalid format' };
    const response = createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      400,
      details
    );

    const body = await response.json();

    expect(body.error.details).toEqual(details);
  });

  it('should not include details when not provided', async () => {
    const response = createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Server error',
      500
    );

    const body = await response.json();

    expect(body.error.details).toBeUndefined();
  });
});

describe('createSuccessResponse', () => {
  it('should create success response with data', async () => {
    const data = { id: '123', name: 'Test Product' };
    const response = createSuccessResponse(data);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toEqual(data);
    expect(response.status).toBe(200);
  });

  it('should allow custom status code', async () => {
    const response = createSuccessResponse({ created: true }, 201);

    expect(response.status).toBe(201);
  });
});

describe('ApiErrors', () => {
  describe('validationError', () => {
    it('should return 400 status', async () => {
      const response = ApiErrors.validationError();
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should include validation details', async () => {
      const details = [{ path: 'email', message: 'Invalid email' }];
      const response = ApiErrors.validationError(details);

      const body = await response.json();
      expect(body.error.details).toEqual(details);
    });
  });

  describe('notFound', () => {
    it('should return 404 status', async () => {
      const response = ApiErrors.notFound();
      expect(response.status).toBe(404);
    });

    it('should include resource name in message', async () => {
      const response = ApiErrors.notFound('Product');

      const body = await response.json();
      expect(body.error.message).toBe('Product not found');
    });

    it('should use default resource name', async () => {
      const response = ApiErrors.notFound();

      const body = await response.json();
      expect(body.error.message).toBe('Resource not found');
    });
  });

  describe('unauthorized', () => {
    it('should return 401 status', async () => {
      const response = ApiErrors.unauthorized();
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('forbidden', () => {
    it('should return 403 status', async () => {
      const response = ApiErrors.forbidden();
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('internalError', () => {
    it('should return 500 status', async () => {
      const response = ApiErrors.internalError();
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe('INTERNAL_ERROR');
    });

    it('should allow custom message', async () => {
      const response = ApiErrors.internalError('Database connection failed');

      const body = await response.json();
      expect(body.error.message).toBe('Database connection failed');
    });
  });

  describe('badRequest', () => {
    it('should return 400 status with custom message', async () => {
      const response = ApiErrors.badRequest('Invalid product ID');
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('BAD_REQUEST');
      expect(body.error.message).toBe('Invalid product ID');
    });
  });

  describe('rateLimited', () => {
    it('should return 429 status', async () => {
      const response = ApiErrors.rateLimited();
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body.error.code).toBe('RATE_LIMITED');
    });
  });
});

describe('isApiError', () => {
  it('should return true for error response', () => {
    const errorResponse = {
      success: false as const,
      error: {
        code: ErrorCode.NOT_FOUND,
        message: 'Not found',
      },
    };

    expect(isApiError(errorResponse)).toBe(true);
  });

  it('should return false for success response', () => {
    const successResponse = {
      success: true as const,
      data: { id: '123' },
    };

    expect(isApiError(successResponse)).toBe(false);
  });
});

describe('Result type helpers', () => {
  describe('ok', () => {
    it('should create success result', () => {
      const result = ok('test value');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('test value');
      }
    });
  });

  describe('err', () => {
    it('should create error result', () => {
      const error = new Error('Something went wrong');
      const result = err(error);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }
    });
  });
});
