import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return the user when valid', () => {
      const user = { _id: '123', name: 'John' };
      expect(guard.handleRequest(null, user)).toEqual(user);
    });

    it('should throw UnauthorizedException when no user', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
    });

    it('should throw the original error if provided', () => {
      const error = new Error('Token expired');
      expect(() => guard.handleRequest(error, null)).toThrow(error);
    });
  });
});
