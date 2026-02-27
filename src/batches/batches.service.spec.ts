import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { Batch } from './schemas/batch.schema';

describe('BatchesService', () => {
  let service: BatchesService;

  const mockBatch = {
    _id: '507f1f77bcf86cd799439011',
    batchName: '2024',
    status: 'active',
    createdAt: new Date(),
  };

  const mockBatchModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchesService,
        { provide: getModelToken(Batch.name), useValue: mockBatchModel },
      ],
    }).compile();

    service = module.get<BatchesService>(BatchesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a batch', async () => {
      mockBatchModel.create.mockResolvedValue(mockBatch);
      const result = await service.create({ batchName: '2024' });
      expect(result).toEqual(mockBatch);
      expect(mockBatchModel.create).toHaveBeenCalledWith({ batchName: '2024' });
    });
  });

  describe('findAll', () => {
    it('should return all batches', async () => {
      mockBatchModel.find.mockResolvedValue([mockBatch]);
      const result = await service.findAll();
      expect(result).toEqual([mockBatch]);
    });
  });

  describe('findById', () => {
    it('should return a batch by id', async () => {
      mockBatchModel.findById.mockResolvedValue(mockBatch);
      const result = await service.findById('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockBatch);
    });

    it('should throw NotFoundException if batch not found', async () => {
      mockBatchModel.findById.mockResolvedValue(null);
      await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a batch', async () => {
      const updated = { ...mockBatch, batchName: '2025' };
      mockBatchModel.findByIdAndUpdate.mockResolvedValue(updated);
      const result = await service.update('507f1f77bcf86cd799439011', {
        batchName: '2025',
      });
      expect(result).toEqual(updated);
      expect(mockBatchModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { batchName: '2025' },
        { new: true, runValidators: true },
      );
    });

    it('should throw NotFoundException if batch not found', async () => {
      mockBatchModel.findByIdAndUpdate.mockResolvedValue(null);
      await expect(
        service.update('507f1f77bcf86cd799439011', { batchName: '2025' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
