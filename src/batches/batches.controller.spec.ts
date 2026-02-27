import { Test, TestingModule } from '@nestjs/testing';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';

describe('BatchesController', () => {
  let controller: BatchesController;
  let service: BatchesService;

  const mockBatch = {
    _id: '507f1f77bcf86cd799439011',
    batchName: '2024',
    status: 'active',
  };

  const mockBatchesService = {
    create: jest.fn().mockResolvedValue(mockBatch),
    findAll: jest.fn().mockResolvedValue([mockBatch]),
    findById: jest.fn().mockResolvedValue(mockBatch),
    update: jest.fn().mockResolvedValue({ ...mockBatch, batchName: '2025' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchesController],
      providers: [{ provide: BatchesService, useValue: mockBatchesService }],
    }).compile();

    controller = module.get<BatchesController>(BatchesController);
    service = module.get<BatchesService>(BatchesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a batch and return success', async () => {
      const result = await controller.create({ batchName: '2024' });
      expect(result).toEqual({ success: true, data: mockBatch });
      expect(service.create).toHaveBeenCalledWith({ batchName: '2024' });
    });
  });

  describe('findAll', () => {
    it('should return all batches with count', async () => {
      const result = await controller.findAll();
      expect(result).toEqual({ success: true, count: 1, data: [mockBatch] });
    });
  });

  describe('findOne', () => {
    it('should return a single batch', async () => {
      const result = await controller.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual({ success: true, data: mockBatch });
    });
  });

  describe('update', () => {
    it('should update and return the batch', async () => {
      const result = await controller.update('507f1f77bcf86cd799439011', {
        batchName: '2025',
      });
      expect(result.success).toBe(true);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
        batchName: '2025',
      });
    });
  });
});
