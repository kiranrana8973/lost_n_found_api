import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentsService } from './comments.service';
import { Comment } from './schemas/comment.schema';
import { Student } from '../students/schemas/student.schema';
import { Item } from '../items/schemas/item.schema';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockStudentId = '507f1f77bcf86cd799439011';
  const mockItemId = '507f1f77bcf86cd799439022';
  const mockCommentId = '507f1f77bcf86cd799439033';

  const mockComment = {
    _id: mockCommentId,
    text: 'This is a comment',
    item: mockItemId,
    commentedBy: mockStudentId,
    mentionedUsers: [],
    parentComment: null,
    isReply: false,
    likes: [],
    isEdited: false,
    editedAt: null,
    save: jest.fn(),
    populate: jest.fn().mockResolvedValue(undefined),
  };

  const populateChain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([mockComment]),
  };

  const mockCommentModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnValue(populateChain),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockStudentModel = {
    findById: jest.fn(),
    find: jest.fn(),
  };

  const mockItemModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getModelToken(Comment.name), useValue: mockCommentModel },
        { provide: getModelToken(Student.name), useValue: mockStudentModel },
        { provide: getModelToken(Item.name), useValue: mockItemModel },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();

    mockCommentModel.find.mockReturnValue(populateChain);
    populateChain.populate.mockReturnThis();
    populateChain.sort.mockReturnThis();
    populateChain.skip.mockReturnThis();
    populateChain.limit.mockResolvedValue([mockComment]);
  });

  describe('create', () => {
    const createDto = {
      text: 'Great find!',
      itemId: mockItemId,
      commentedBy: mockStudentId,
    };

    it('should create a comment', async () => {
      mockItemModel.findById.mockResolvedValue({ _id: mockItemId });
      mockStudentModel.findById.mockResolvedValue({ _id: mockStudentId });
      const createdComment = { ...mockComment, populate: jest.fn().mockResolvedValue(undefined) };
      mockCommentModel.create.mockResolvedValue(createdComment);

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(mockCommentModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when missing required fields', async () => {
      await expect(
        service.create({ text: '', itemId: mockItemId, commentedBy: mockStudentId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when item not found', async () => {
      mockItemModel.findById.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when student not found', async () => {
      mockItemModel.findById.mockResolvedValue({ _id: mockItemId });
      mockStudentModel.findById.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should extract mentions from text', async () => {
      mockItemModel.findById.mockResolvedValue({ _id: mockItemId });
      mockStudentModel.findById.mockResolvedValue({ _id: mockStudentId });
      mockStudentModel.find.mockResolvedValue([
        { _id: new Types.ObjectId(), username: 'alice' },
      ]);
      const createdComment = { ...mockComment, populate: jest.fn().mockResolvedValue(undefined) };
      mockCommentModel.create.mockResolvedValue(createdComment);

      await service.create({
        ...createDto,
        text: 'Hey @alice check this out!',
      });
      expect(mockStudentModel.find).toHaveBeenCalledWith({
        username: { $in: ['alice'] },
      });
    });

    it('should handle reply to a parent comment', async () => {
      mockItemModel.findById.mockResolvedValue({ _id: mockItemId });
      mockStudentModel.findById.mockResolvedValue({ _id: mockStudentId });
      mockCommentModel.findById.mockResolvedValue({ _id: mockCommentId });
      const createdComment = { ...mockComment, populate: jest.fn().mockResolvedValue(undefined) };
      mockCommentModel.create.mockResolvedValue(createdComment);

      await service.create({ ...createDto, parentCommentId: mockCommentId });
      expect(mockCommentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ isReply: true, parentComment: mockCommentId }),
      );
    });

    it('should throw NotFoundException for invalid parent comment', async () => {
      mockItemModel.findById.mockResolvedValue({ _id: mockItemId });
      mockStudentModel.findById.mockResolvedValue({ _id: mockStudentId });
      mockCommentModel.findById.mockResolvedValue(null);

      await expect(
        service.create({ ...createDto, parentCommentId: 'invalid-id' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByItem', () => {
    it('should return paginated comments for an item', async () => {
      mockItemModel.findById.mockResolvedValue({ _id: mockItemId });
      mockCommentModel.countDocuments.mockResolvedValue(1);

      const result = await service.getByItem(mockItemId, 'false', 1, 10);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw NotFoundException if item not found', async () => {
      mockItemModel.findById.mockResolvedValue(null);
      await expect(service.getByItem(mockItemId, 'false', 1, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getReplies', () => {
    it('should return replies for a comment', async () => {
      mockCommentModel.findById.mockResolvedValue({ _id: mockCommentId });
      mockCommentModel.countDocuments.mockResolvedValue(2);

      const result = await service.getReplies(mockCommentId, 1, 10);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if parent comment not found', async () => {
      mockCommentModel.findById.mockResolvedValue(null);
      await expect(service.getReplies(mockCommentId, 1, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a comment when authorized', async () => {
      const commentDoc = {
        ...mockComment,
        commentedBy: { toString: () => mockStudentId },
        save: jest.fn().mockResolvedValue(undefined),
        populate: jest.fn().mockResolvedValue(undefined),
      };
      mockCommentModel.findById.mockResolvedValue(commentDoc);

      const result = await service.update(
        mockCommentId,
        { text: 'Updated text' },
        mockStudentId,
      );
      expect(commentDoc.text).toBe('Updated text');
      expect(commentDoc.isEdited).toBe(true);
    });

    it('should throw ForbiddenException if not the author', async () => {
      const commentDoc = {
        ...mockComment,
        commentedBy: { toString: () => mockStudentId },
      };
      mockCommentModel.findById.mockResolvedValue(commentDoc);

      await expect(
        service.update(mockCommentId, { text: 'X' }, 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentModel.findById.mockResolvedValue(null);
      await expect(
        service.update(mockCommentId, { text: 'X' }, mockStudentId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a comment and its replies when it is a top-level comment', async () => {
      const commentDoc = {
        ...mockComment,
        _id: mockCommentId,
        commentedBy: { toString: () => mockStudentId },
        isReply: false,
      };
      mockCommentModel.findById.mockResolvedValue(commentDoc);
      mockCommentModel.deleteMany.mockResolvedValue({});
      mockCommentModel.findByIdAndDelete.mockResolvedValue(commentDoc);

      await service.delete(mockCommentId, mockStudentId);
      expect(mockCommentModel.deleteMany).toHaveBeenCalledWith({
        parentComment: mockCommentId,
      });
      expect(mockCommentModel.findByIdAndDelete).toHaveBeenCalledWith(mockCommentId);
    });

    it('should delete only the reply if it is a reply', async () => {
      const commentDoc = {
        ...mockComment,
        commentedBy: { toString: () => mockStudentId },
        isReply: true,
      };
      mockCommentModel.findById.mockResolvedValue(commentDoc);
      mockCommentModel.findByIdAndDelete.mockResolvedValue(commentDoc);

      await service.delete(mockCommentId, mockStudentId);
      expect(mockCommentModel.deleteMany).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not the author', async () => {
      const commentDoc = {
        ...mockComment,
        commentedBy: { toString: () => mockStudentId },
      };
      mockCommentModel.findById.mockResolvedValue(commentDoc);

      await expect(service.delete(mockCommentId, 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('toggleLike', () => {
    it('should add a like', async () => {
      const commentDoc = {
        ...mockComment,
        likes: [],
        save: jest.fn().mockResolvedValue(undefined),
        populate: jest.fn().mockResolvedValue(undefined),
      };
      mockCommentModel.findById.mockResolvedValue(commentDoc);
      mockStudentModel.findById.mockResolvedValue({ _id: mockStudentId });

      const result = await service.toggleLike(mockCommentId, mockStudentId);
      expect(result.liked).toBe(true);
      expect(result.likeCount).toBe(1);
    });

    it('should remove a like if already liked', async () => {
      const objectId = new Types.ObjectId(mockStudentId);
      const commentDoc = {
        ...mockComment,
        likes: [objectId],
        save: jest.fn().mockResolvedValue(undefined),
        populate: jest.fn().mockResolvedValue(undefined),
      };
      mockCommentModel.findById.mockResolvedValue(commentDoc);
      mockStudentModel.findById.mockResolvedValue({ _id: mockStudentId });

      const result = await service.toggleLike(mockCommentId, mockStudentId);
      expect(result.liked).toBe(false);
      expect(result.likeCount).toBe(0);
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentModel.findById.mockResolvedValue(null);
      await expect(service.toggleLike(mockCommentId, mockStudentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if student not found', async () => {
      mockCommentModel.findById.mockResolvedValue(mockComment);
      mockStudentModel.findById.mockResolvedValue(null);
      await expect(service.toggleLike(mockCommentId, mockStudentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getByStudent', () => {
    it('should return comments by a student', async () => {
      mockStudentModel.findById.mockResolvedValue({ _id: mockStudentId });
      mockCommentModel.countDocuments.mockResolvedValue(1);

      const result = await service.getByStudent(mockStudentId, 1, 10);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentModel.findById.mockResolvedValue(null);
      await expect(service.getByStudent(mockStudentId, 1, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMentions', () => {
    it('should return mentions for a student', async () => {
      mockStudentModel.findById.mockResolvedValue({ _id: mockStudentId });
      mockCommentModel.countDocuments.mockResolvedValue(0);
      populateChain.limit.mockResolvedValue([]);

      const result = await service.getMentions(mockStudentId, 1, 10);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentModel.findById.mockResolvedValue(null);
      await expect(service.getMentions(mockStudentId, 1, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
