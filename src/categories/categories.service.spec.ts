import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './schemas/category.schema';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Electronics',
    description: 'Electronic devices',
    status: 'active',
    createdAt: new Date(),
  };

  const mockCategoryModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getModelToken(Category.name), useValue: mockCategoryModel },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category', async () => {
      mockCategoryModel.create.mockResolvedValue(mockCategory);
      const result = await service.create({ name: 'Electronics', description: 'Electronic devices' });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return only active categories', async () => {
      mockCategoryModel.find.mockResolvedValue([mockCategory]);
      const result = await service.findAll();
      expect(result).toEqual([mockCategory]);
      expect(mockCategoryModel.find).toHaveBeenCalledWith({ status: 'active' });
    });
  });

  describe('findById', () => {
    it('should return a category by id', async () => {
      mockCategoryModel.findById.mockResolvedValue(mockCategory);
      const result = await service.findById('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if not found', async () => {
      mockCategoryModel.findById.mockResolvedValue(null);
      await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updated = { ...mockCategory, name: 'Books' };
      mockCategoryModel.findByIdAndUpdate.mockResolvedValue(updated);
      const result = await service.update('507f1f77bcf86cd799439011', { name: 'Books' });
      expect(result.name).toBe('Books');
    });

    it('should throw NotFoundException if not found', async () => {
      mockCategoryModel.findByIdAndUpdate.mockResolvedValue(null);
      await expect(
        service.update('507f1f77bcf86cd799439011', { name: 'Books' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      mockCategoryModel.findByIdAndDelete.mockResolvedValue(mockCategory);
      await expect(service.delete('507f1f77bcf86cd799439011')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if not found', async () => {
      mockCategoryModel.findByIdAndDelete.mockResolvedValue(null);
      await expect(service.delete('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
