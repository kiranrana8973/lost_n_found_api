import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockComment = {
    _id: '507f1f77bcf86cd799439011',
    text: 'Test comment',
    item: '507f1f77bcf86cd799439022',
    commentedBy: '507f1f77bcf86cd799439033',
  };

  const mockPaginatedResponse = {
    success: true,
    count: 1,
    total: 1,
    page: 1,
    pages: 1,
    data: [mockComment],
  };

  const mockCommentsService = {
    create: jest.fn().mockResolvedValue(mockComment),
    getByItem: jest.fn().mockResolvedValue(mockPaginatedResponse),
    getByStudent: jest.fn().mockResolvedValue(mockPaginatedResponse),
    getMentions: jest.fn().mockResolvedValue(mockPaginatedResponse),
    getReplies: jest.fn().mockResolvedValue(mockPaginatedResponse),
    update: jest.fn().mockResolvedValue({ ...mockComment, text: 'Updated' }),
    delete: jest.fn().mockResolvedValue(undefined),
    toggleLike: jest.fn().mockResolvedValue({
      success: true,
      liked: true,
      likeCount: 1,
      data: mockComment,
    }),
  };

  const mockUser = { _id: { toString: () => '507f1f77bcf86cd799439033' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockCommentsService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const dto = {
        text: 'Test comment',
        itemId: '507f1f77bcf86cd799439022',
        commentedBy: '507f1f77bcf86cd799439033',
      };
      const result = await controller.create(dto);
      expect(result).toEqual({ success: true, data: mockComment });
    });
  });

  describe('getByItem', () => {
    it('should return comments for an item', async () => {
      const result = await controller.getByItem(
        '507f1f77bcf86cd799439022',
        'false',
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(mockPaginatedResponse);
      expect(service.getByItem).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439022',
        'false',
        1,
        10,
      );
    });
  });

  describe('getByStudent', () => {
    it('should return comments by a student', async () => {
      const result = await controller.getByStudent('507f1f77bcf86cd799439033', {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('getMentions', () => {
    it('should return mentions for a student', async () => {
      const result = await controller.getMentions('507f1f77bcf86cd799439033', {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('getReplies', () => {
    it('should return replies for a comment', async () => {
      const result = await controller.getReplies('507f1f77bcf86cd799439011', {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const result = await controller.update(
        '507f1f77bcf86cd799439011',
        { text: 'Updated' },
        mockUser,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      const result = await controller.remove('507f1f77bcf86cd799439011', mockUser);
      expect(result).toEqual({ success: true, message: 'Comment deleted successfully' });
    });
  });

  describe('toggleLike', () => {
    it('should toggle like on a comment', async () => {
      const result = await controller.toggleLike('507f1f77bcf86cd799439011', {
        studentId: '507f1f77bcf86cd799439033',
      });
      expect(result.liked).toBe(true);
      expect(result.likeCount).toBe(1);
    });
  });
});
