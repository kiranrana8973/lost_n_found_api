import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StudentsService } from './students.service';
import { Student } from './schemas/student.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { BatchesService } from '../batches/batches.service';

describe('StudentsService', () => {
  let service: StudentsService;

  const mockStudentId = '507f1f77bcf86cd799439011';
  const mockStudent = {
    _id: mockStudentId,
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'hashedpassword',
    phoneNumber: '1234567890',
    batchId: '507f1f77bcf86cd799439022',
    profilePicture: 'default-profile.png',
    toObject: jest.fn().mockReturnValue({
      _id: mockStudentId,
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'hashedpassword',
    }),
    getSignedJwtToken: jest.fn().mockReturnValue('mock-jwt-token'),
    matchPassword: jest.fn(),
    save: jest.fn(),
  };

  const mockStudentModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue([mockStudent]) }),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockRefreshTokenModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockBatchesService = {
    findById: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439022', batchName: '2024' }),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(7),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getModelToken(Student.name), useValue: mockStudentModel },
        { provide: getModelToken(RefreshToken.name), useValue: mockRefreshTokenModel },
        { provide: BatchesService, useValue: mockBatchesService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'password123',
      phoneNumber: '1234567890',
      batchId: '507f1f77bcf86cd799439022',
    };

    it('should create a student successfully', async () => {
      mockStudentModel.findOne.mockResolvedValueOnce(null);
      mockStudentModel.findOne.mockReturnValueOnce({
        collation: jest.fn().mockResolvedValue(null),
      });
      mockStudentModel.create.mockResolvedValue(mockStudent);

      const result = await service.create(createDto);
      expect(result.password).toBeUndefined();
      expect(mockBatchesService.findById).toHaveBeenCalledWith(createDto.batchId);
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockStudentModel.findOne.mockResolvedValueOnce(mockStudent);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if username already exists', async () => {
      mockStudentModel.findOne.mockResolvedValueOnce(null);
      mockStudentModel.findOne.mockReturnValueOnce({
        collation: jest.fn().mockResolvedValue(mockStudent),
      });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'john@example.com', password: 'password123' };

    it('should login successfully and return tokens', async () => {
      mockStudent.matchPassword.mockResolvedValue(true);
      mockStudentModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockStudent),
      });

      const result = await service.login(loginDto);
      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.refreshToken).toBeDefined();
      expect(mockRefreshTokenModel.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockStudentModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockStudent.matchPassword.mockResolvedValue(false);
      mockStudentModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockStudent),
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      await service.logout('some-refresh-token');
      expect(mockRefreshTokenModel.deleteOne).toHaveBeenCalled();
    });

    it('should do nothing if no refresh token provided', async () => {
      await service.logout(undefined);
      expect(mockRefreshTokenModel.deleteOne).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all students with populated batch', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockStudent]);
    });
  });

  describe('findById', () => {
    it('should return a student by id', async () => {
      mockStudentModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockStudent),
      });
      const result = await service.findById(mockStudentId);
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if not found', async () => {
      mockStudentModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findById(mockStudentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update student when authorized', async () => {
      const studentDoc = {
        ...mockStudent,
        _id: { toString: () => mockStudentId },
        save: jest.fn().mockResolvedValue(mockStudent),
      };
      mockStudentModel.findById.mockResolvedValue(studentDoc);

      const result = await service.update(
        mockStudentId,
        { name: 'Jane Doe' },
        mockStudentId,
      );
      expect(studentDoc.name).toBe('Jane Doe');
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentModel.findById.mockResolvedValue(null);
      await expect(
        service.update(mockStudentId, { name: 'Jane' }, mockStudentId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not the owner', async () => {
      const studentDoc = {
        ...mockStudent,
        _id: { toString: () => mockStudentId },
      };
      mockStudentModel.findById.mockResolvedValue(studentDoc);

      await expect(
        service.update(mockStudentId, { name: 'Jane' }, 'different-user-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete student when authorized', async () => {
      const studentDoc = {
        ...mockStudent,
        _id: { toString: () => mockStudentId },
        profilePicture: 'default-profile.png',
      };
      mockStudentModel.findById.mockResolvedValue(studentDoc);
      mockStudentModel.findByIdAndDelete.mockResolvedValue(studentDoc);

      await service.delete(mockStudentId, mockStudentId);
      expect(mockStudentModel.findByIdAndDelete).toHaveBeenCalledWith(mockStudentId);
    });

    it('should throw ForbiddenException if not the owner', async () => {
      const studentDoc = {
        ...mockStudent,
        _id: { toString: () => mockStudentId },
      };
      mockStudentModel.findById.mockResolvedValue(studentDoc);

      await expect(
        service.delete(mockStudentId, 'different-user-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentModel.findById.mockResolvedValue(null);
      await expect(service.delete(mockStudentId, mockStudentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh tokens successfully', async () => {
      const storedToken = {
        _id: 'token-id',
        token: 'hashed-token',
        student: mockStudentId,
        expiresAt: new Date(Date.now() + 86400000),
      };
      mockRefreshTokenModel.findOne.mockResolvedValue(storedToken);
      mockRefreshTokenModel.deleteOne.mockResolvedValue({});
      mockStudentModel.findById.mockResolvedValue(mockStudent);

      const result = await service.refreshAccessToken('raw-refresh-token');
      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockRefreshTokenModel.findOne.mockResolvedValue(null);
      await expect(service.refreshAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const expiredToken = {
        _id: 'token-id',
        token: 'hashed-token',
        student: mockStudentId,
        expiresAt: new Date(Date.now() - 86400000),
      };
      mockRefreshTokenModel.findOne.mockResolvedValue(expiredToken);
      mockRefreshTokenModel.deleteOne.mockResolvedValue({});

      await expect(service.refreshAccessToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
