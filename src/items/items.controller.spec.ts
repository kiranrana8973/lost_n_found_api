import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  const mockItem = {
    _id: '507f1f77bcf86cd799439011',
    itemName: 'Lost Wallet',
    type: 'lost',
    status: 'available',
  };

  const mockItemsService = {
    create: jest.fn().mockResolvedValue(mockItem),
    findAll: jest.fn().mockResolvedValue({
      success: true,
      count: 1,
      total: 1,
      page: 1,
      pages: 1,
      data: [mockItem],
    }),
    findById: jest.fn().mockResolvedValue(mockItem),
    update: jest.fn().mockResolvedValue({ ...mockItem, itemName: 'Found Wallet' }),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  const mockUser = { _id: { toString: () => '507f1f77bcf86cd799439022' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: mockItemsService }],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);
    jest.clearAllMocks();
  });

  describe('uploadPhoto', () => {
    it('should return file path on upload', async () => {
      const file = { filename: 'itm-pic-123.jpg' } as Express.Multer.File;
      const result = await controller.uploadPhoto(file);
      expect(result).toEqual({
        success: true,
        data: 'item_photos/itm-pic-123.jpg',
        message: 'Item photo uploaded successfully',
      });
    });

    it('should throw BadRequestException if no file', async () => {
      await expect(controller.uploadPhoto(undefined as any)).rejects.toThrow();
    });
  });

  describe('uploadVideo', () => {
    it('should return file path on upload', async () => {
      const file = { filename: 'item-vid-123.mp4' } as Express.Multer.File;
      const result = await controller.uploadVideo(file);
      expect(result).toEqual({
        success: true,
        data: 'item_videos/item-vid-123.mp4',
        message: 'Item video uploaded successfully',
      });
    });

    it('should throw BadRequestException if no file', async () => {
      await expect(controller.uploadVideo(undefined as any)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create an item', async () => {
      const dto = {
        itemName: 'Lost Wallet',
        description: 'Brown wallet',
        type: 'lost',
        category: '507f1f77bcf86cd799439033',
        location: 'Library',
        media: 'wallet.jpg',
        reportedBy: '507f1f77bcf86cd799439022',
      };
      const result = await controller.create(dto);
      expect(result).toEqual({ success: true, data: mockItem });
    });
  });

  describe('findAll', () => {
    it('should return paginated items', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockItem]);
    });
  });

  describe('findOne', () => {
    it('should return a single item', async () => {
      const result = await controller.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual({ success: true, data: mockItem });
    });
  });

  describe('update', () => {
    it('should update an item', async () => {
      const result = await controller.update(
        '507f1f77bcf86cd799439011',
        { itemName: 'Found Wallet' },
        mockUser,
      );
      expect(result.success).toBe(true);
      expect(service.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { itemName: 'Found Wallet' },
        '507f1f77bcf86cd799439022',
      );
    });
  });

  describe('remove', () => {
    it('should delete an item', async () => {
      const result = await controller.remove('507f1f77bcf86cd799439011', mockUser);
      expect(result).toEqual({ success: true, message: 'Item deleted successfully' });
    });
  });
});
