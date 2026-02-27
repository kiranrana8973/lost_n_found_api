import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    };
  });

  it('should handle HttpException', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not Found',
    });
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException(
      { message: ['field is required', 'email is invalid'] },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'field is required, email is invalid',
    });
  });

  it('should handle MongoDB duplicate key error (code 11000)', () => {
    const error: any = new Error('Duplicate key');
    error.code = 11000;
    error.keyValue = { email: 'test@test.com' };
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'email already exists',
    });
  });

  it('should handle Mongoose ValidationError', () => {
    const error: any = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = {
      name: { message: 'Name is required' },
      email: { message: 'Email is invalid' },
    };
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Name is required, Email is invalid',
    });
  });

  it('should handle CastError', () => {
    const error: any = new Error('Cast error');
    error.name = 'CastError';
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Resource not found',
    });
  });

  it('should handle JsonWebTokenError', () => {
    const error: any = new Error('jwt malformed');
    error.name = 'JsonWebTokenError';
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token',
    });
  });

  it('should handle TokenExpiredError', () => {
    const error: any = new Error('jwt expired');
    error.name = 'TokenExpiredError';
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token expired',
    });
  });

  it('should handle unknown errors', () => {
    filter.catch('unknown error', mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal Server Error',
    });
  });
});
