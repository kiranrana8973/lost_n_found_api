import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { StudentsService } from '../students/students.service';

describe('AuthController', () => {
  let controller: AuthController;
  let studentsService: StudentsService;

  const mockRefreshResult = {
    success: true,
    token: 'new-jwt-token',
    refreshToken: 'new-refresh-token',
    data: { _id: '507f1f77bcf86cd799439011', name: 'John' },
  };

  const mockStudentsService = {
    refreshAccessToken: jest.fn().mockResolvedValue(mockRefreshResult),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: StudentsService, useValue: mockStudentsService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    studentsService = module.get<StudentsService>(StudentsService);
    jest.clearAllMocks();
  });

  describe('refreshToken', () => {
    it('should refresh token from body', async () => {
      const result = await controller.refreshToken(
        { refreshToken: 'my-refresh-token' },
        undefined,
      );
      expect(result).toEqual(mockRefreshResult);
      expect(studentsService.refreshAccessToken).toHaveBeenCalledWith('my-refresh-token');
    });

    it('should refresh token from authorization header', async () => {
      const result = await controller.refreshToken(
        { refreshToken: '' },
        'Bearer my-header-token',
      );
      expect(result).toEqual(mockRefreshResult);
      expect(studentsService.refreshAccessToken).toHaveBeenCalledWith('my-header-token');
    });

    it('should throw BadRequestException when no token provided', async () => {
      await expect(
        controller.refreshToken({ refreshToken: '' }, undefined),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
