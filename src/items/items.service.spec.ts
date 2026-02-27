import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './schemas/item.schema';

describe('ItemsService', () => {
  let service: ItemsService;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockItem = {
    _id: '507f1f77bcf86cd799439022',
    itemName: 'Lost Wallet',
    description: 'Brown leather wallet',
    type: 'lost',
    category: '507f1f77bcf86cd799439033',
    location: 'Library',
    media: 'item_photos/wallet.jpg',
    mediaType: 'photo',
    reportedBy: mockUserId,
    isClaimed: false,
    status: 'available',
    save: jest.fn(),
  };

  const populateChain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([mockItem]),
  };

  const mockItemModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnValue(populateChain),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: getModelToken(Item.name), useValue: mockItemModel },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    jest.clearAllMocks();

    // Re-set up the chain mocks
    mockItemModel.find.mockReturnValue(populateChain);
    populateChain.populate.mockReturnThis();
    populateChain.sort.mockReturnThis();
    populateChain.skip.mockReturnThis();
    populateChain.limit.mockResolvedValue([mockItem]);
  });

  describe('create', () => {
    it('should create an item', async () => {
      mockItemModel.create.mockResolvedValue(mockItem);
      const dto = {
        itemName: 'Lost Wallet',
        description: 'Brown leather wallet',
        type: 'lost',
        category: '507f1f77bcf86cd799439033',
        location: 'Library',
        media: 'wallet.jpg',
        reportedBy: mockUserId,
      };
      const result = await service.create(dto);
      expect(result).toEqual(mockItem);
    });
  });

  describe('findAll', () => {
    it('should return paginated items', async () => {
      mockItemModel.countDocuments.mockResolvedValue(1);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockItem]);
      expect(result.total).toBe(1);
    });

    it('should filter items by type', async () => {
      mockItemModel.countDocuments.mockResolvedValue(1);
      await service.findAll({ page: 1, limit: 10, type: 'lost' });
      expect(mockItemModel.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'lost' }),
      );
    });

    it('should filter items by status and category', async () => {
      mockItemModel.countDocuments.mockResolvedValue(0);
      populateChain.limit.mockResolvedValue([]);
      await service.findAll({
        page: 1,
        limit: 10,
        status: 'available',
        category: '507f1f77bcf86cd799439033',
      });
      expect(mockItemModel.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'available',
          category: '507f1f77bcf86cd799439033',
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return an item by id', async () => {
      mockItemModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockItem),
          }),
        }),
      });
      const result = await service.findById('507f1f77bcf86cd799439022');
      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundException if not found', async () => {
      mockItemModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
          }),
        }),
      });
      await expect(service.findById('507f1f77bcf86cd799439022')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update item when authorized', async () => {
      const itemDoc = {
        ...mockItem,
        reportedBy: { toString: () => mockUserId },
        save: jest.fn().mockResolvedValue(mockItem),
      };
      mockItemModel.findById.mockResolvedValue(itemDoc);

      const result = await service.update(
        '507f1f77bcf86cd799439022',
        { itemName: 'Found Wallet' },
        mockUserId,
      );
      expect(itemDoc.itemName).toBe('Found Wallet');
    });

    it('should throw ForbiddenException if not the reporter', async () => {
      const itemDoc = {
        ...mockItem,
        reportedBy: { toString: () => mockUserId },
      };
      mockItemModel.findById.mockResolvedValue(itemDoc);

      await expect(
        service.update('507f1f77bcf86cd799439022', { itemName: 'X' }, 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockItemModel.findById.mockResolvedValue(null);
      await expect(
        service.update('507f1f77bcf86cd799439022', { itemName: 'X' }, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete item when authorized', async () => {
      const itemDoc = {
        ...mockItem,
        reportedBy: { toString: () => mockUserId },
        media: 'default.jpg',
      };
      mockItemModel.findById.mockResolvedValue(itemDoc);
      mockItemModel.findByIdAndDelete.mockResolvedValue(itemDoc);

      await service.delete('507f1f77bcf86cd799439022', mockUserId);
      expect(mockItemModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439022');
    });

    it('should throw ForbiddenException if not the reporter', async () => {
      const itemDoc = {
        ...mockItem,
        reportedBy: { toString: () => mockUserId },
      };
      mockItemModel.findById.mockResolvedValue(itemDoc);

      await expect(
        service.delete('507f1f77bcf86cd799439022', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockItemModel.findById.mockResolvedValue(null);
      await expect(
        service.delete('507f1f77bcf86cd799439022', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
