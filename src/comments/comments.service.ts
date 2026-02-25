import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import { Item, ItemDocument } from '../items/schemas/item.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { paginatedResponse } from '../common/utils/pagination.util';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  private extractMentions(text: string): string[] {
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = mentionPattern.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }

  async create(dto: CreateCommentDto) {
    if (!dto.text || !dto.itemId || !dto.commentedBy) {
      throw new BadRequestException(
        'Please provide text, itemId, and commentedBy',
      );
    }

    const item = await this.itemModel.findById(dto.itemId);
    if (!item) throw new NotFoundException('Item not found');

    const commenter = await this.studentModel.findById(dto.commentedBy);
    if (!commenter) throw new NotFoundException('Student not found');

    const mentionedUsernames = this.extractMentions(dto.text);
    const mentionedUsers: Types.ObjectId[] = [];
    if (mentionedUsernames.length > 0) {
      const users = await this.studentModel.find({
        username: { $in: mentionedUsernames },
      });
      mentionedUsers.push(...users.map((user) => user._id as Types.ObjectId));
    }

    let isReply = false;
    if (dto.parentCommentId) {
      const parentComment = await this.commentModel.findById(
        dto.parentCommentId,
      );
      if (!parentComment) throw new NotFoundException('Parent comment not found');
      isReply = true;
    }

    const comment = await this.commentModel.create({
      text: dto.text,
      item: dto.itemId,
      commentedBy: dto.commentedBy,
      mentionedUsers,
      parentComment: dto.parentCommentId || null,
      isReply,
    } as any);

    await comment.populate([
      { path: 'commentedBy', select: 'name username profilePicture' },
      { path: 'mentionedUsers', select: 'name username' },
    ]);

    return comment;
  }

  async getByItem(
    itemId: string,
    includeReplies: string,
    page = 1,
    limit = 10,
  ) {
    const item = await this.itemModel.findById(itemId);
    if (!item) throw new NotFoundException('Item not found');

    const query: Record<string, unknown> = { item: itemId };
    if (includeReplies !== 'true') {
      query.isReply = false;
    }

    const skip = (page - 1) * limit;
    const total = await this.commentModel.countDocuments(query);

    const comments = await this.commentModel
      .find(query)
      .populate('commentedBy', 'name username profilePicture')
      .populate('mentionedUsers', 'name username')
      .populate('likes', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (includeReplies !== 'true') {
      for (const comment of comments) {
        const replyCount = await this.commentModel.countDocuments({
          parentComment: comment._id,
        });
        (comment as any).replyCount = replyCount;
      }
    }

    return paginatedResponse(comments, total, page, limit);
  }

  async getReplies(commentId: string, page = 1, limit = 10) {
    const parentComment = await this.commentModel.findById(commentId);
    if (!parentComment) throw new NotFoundException('Comment not found');

    const skip = (page - 1) * limit;
    const total = await this.commentModel.countDocuments({
      parentComment: commentId,
    });

    const replies = await this.commentModel
      .find({ parentComment: commentId })
      .populate('commentedBy', 'name username profilePicture')
      .populate('mentionedUsers', 'name username')
      .populate('likes', 'name username')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    return paginatedResponse(replies, total, page, limit);
  }

  async update(id: string, dto: UpdateCommentDto, currentUserId: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.commentedBy.toString() !== currentUserId) {
      throw new ForbiddenException('Not authorized to update this comment');
    }

    const mentionedUsernames = this.extractMentions(dto.text);
    const mentionedUsers: Types.ObjectId[] = [];
    if (mentionedUsernames.length > 0) {
      const users = await this.studentModel.find({
        username: { $in: mentionedUsernames },
      });
      mentionedUsers.push(...users.map((user) => user._id as Types.ObjectId));
    }

    comment.text = dto.text;
    comment.mentionedUsers = mentionedUsers;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

    await comment.populate([
      { path: 'commentedBy', select: 'name username profilePicture' },
      { path: 'mentionedUsers', select: 'name username' },
    ]);

    return comment;
  }

  async delete(id: string, currentUserId: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.commentedBy.toString() !== currentUserId) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    if (!comment.isReply) {
      await this.commentModel.deleteMany({ parentComment: comment._id });
    }

    await this.commentModel.findByIdAndDelete(id);
  }

  async toggleLike(id: string, studentId: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');

    const student = await this.studentModel.findById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    const studentObjectId = new Types.ObjectId(studentId);
    const likeIndex = comment.likes.findIndex(
      (likeId) => likeId.toString() === studentObjectId.toString(),
    );

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(studentObjectId);
    }

    await comment.save();
    await comment.populate('likes', 'name username');

    return {
      success: true,
      liked: likeIndex === -1,
      likeCount: comment.likes.length,
      data: comment,
    };
  }

  async getByStudent(studentId: string, page = 1, limit = 10) {
    const student = await this.studentModel.findById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    const skip = (page - 1) * limit;
    const total = await this.commentModel.countDocuments({
      commentedBy: studentId,
    });

    const comments = await this.commentModel
      .find({ commentedBy: studentId })
      .populate('item', 'itemName type')
      .populate('commentedBy', 'name username profilePicture')
      .populate('mentionedUsers', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return paginatedResponse(comments, total, page, limit);
  }

  async getMentions(studentId: string, page = 1, limit = 10) {
    const student = await this.studentModel.findById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    const skip = (page - 1) * limit;
    const total = await this.commentModel.countDocuments({
      mentionedUsers: studentId,
    });

    const comments = await this.commentModel
      .find({ mentionedUsers: studentId })
      .populate('item', 'itemName type')
      .populate('commentedBy', 'name username profilePicture')
      .populate('mentionedUsers', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return paginatedResponse(comments, total, page, limit);
  }
}
