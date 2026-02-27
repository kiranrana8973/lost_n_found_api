import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Electronics',
    description: 'Electronic devices',
    status: 'active',
  };

  const mockCategoriesService = {
    create: jest.fn().mockResolvedValue(mockCategory),
    findAll: jest.fn().mockResolvedValue([mockCategory]),
    findById: jest.fn().mockResolvedValue(mockCategory),
    update: jest.fn().mockResolvedValue({ ...mockCategory, name: 'Books' }),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockCategoriesService }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const result = await controller.create({ name: 'Electronics', description: 'Electronic devices' });
      expect(result).toEqual({ success: true, data: mockCategory });
    });
  });

  describe('findAll', () => {
    it('should return all categories with count', async () => {
      const result = await controller.findAll();
      expect(result).toEqual({ success: true, count: 1, data: [mockCategory] });
    });
  });

  describe('findOne', () => {
    it('should return a single category', async () => {
      const result = await controller.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual({ success: true, data: mockCategory });
    });
  });

  describe('update', () => {
    it('should update and return the category', async () => {
      const result = await controller.update('507f1f77bcf86cd799439011', { name: 'Books' });
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('should delete and return success message', async () => {
      const result = await controller.remove('507f1f77bcf86cd799439011');
      expect(result).toEqual({ success: true, message: 'Category deleted successfully' });
      expect(service.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
