import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  const mockStudent = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
  };

  const mockStudentsService = {
    create: jest.fn().mockResolvedValue(mockStudent),
    login: jest.fn().mockResolvedValue({
      success: true,
      token: 'jwt-token',
      refreshToken: 'refresh-token',
      data: mockStudent,
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    findAll: jest.fn().mockResolvedValue([mockStudent]),
    findById: jest.fn().mockResolvedValue(mockStudent),
    update: jest.fn().mockResolvedValue({ ...mockStudent, name: 'Jane' }),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(1),
  };

  const mockResponse = {
    cookie: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should register a student', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        phoneNumber: '1234567890',
        batchId: '507f1f77bcf86cd799439022',
      };
      const result = await controller.create(dto);
      expect(result).toEqual({ success: true, data: mockStudent });
    });
  });

  describe('login', () => {
    it('should login and set cookie', async () => {
      const dto = { email: 'john@example.com', password: 'password123' };
      const result = await controller.login(dto, mockResponse);
      expect(result.success).toBe(true);
      expect(result.token).toBe('jwt-token');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        'jwt-token',
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe('logout', () => {
    it('should logout and clear cookie', async () => {
      const result = await controller.logout('refresh-token', mockResponse);
      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        'none',
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe('uploadProfilePicture', () => {
    it('should return filename on upload', async () => {
      const file = { filename: 'pro-pic-123.jpg' } as Express.Multer.File;
      const result = await controller.uploadProfilePicture(file);
      expect(result).toEqual({ success: true, data: 'pro-pic-123.jpg' });
    });

    it('should throw BadRequestException if no file', async () => {
      await expect(
        controller.uploadProfilePicture(undefined as any),
      ).rejects.toThrow();
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const user = { _id: { toString: () => '507f1f77bcf86cd799439011' } };
      const result = await controller.getMe(user);
      expect(result).toEqual({ success: true, data: mockStudent });
    });
  });

  describe('findAll', () => {
    it('should return all students', async () => {
      const result = await controller.findAll();
      expect(result).toEqual({ success: true, count: 1, data: [mockStudent] });
    });
  });

  describe('findOne', () => {
    it('should return a student by id', async () => {
      const result = await controller.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual({ success: true, data: mockStudent });
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      const user = { _id: { toString: () => '507f1f77bcf86cd799439011' } };
      const result = await controller.update(
        '507f1f77bcf86cd799439011',
        { name: 'Jane' },
        user,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('should delete a student', async () => {
      const user = { _id: { toString: () => '507f1f77bcf86cd799439011' } };
      const result = await controller.remove('507f1f77bcf86cd799439011', user);
      expect(result).toEqual({ success: true, message: 'Student deleted successfully' });
    });
  });
});
