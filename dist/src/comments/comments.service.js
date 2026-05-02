"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const comment_schema_1 = require("./schemas/comment.schema");
const student_schema_1 = require("../students/schemas/student.schema");
const item_schema_1 = require("../items/schemas/item.schema");
const pagination_util_1 = require("../common/utils/pagination.util");
let CommentsService = class CommentsService {
    constructor(commentModel, studentModel, itemModel) {
        this.commentModel = commentModel;
        this.studentModel = studentModel;
        this.itemModel = itemModel;
    }
    extractMentions(text) {
        const mentionPattern = /@(\w+)/g;
        const mentions = [];
        let match;
        while ((match = mentionPattern.exec(text)) !== null) {
            mentions.push(match[1]);
        }
        return mentions;
    }
    async create(dto) {
        if (!dto.text || !dto.itemId || !dto.commentedBy) {
            throw new common_1.BadRequestException('Please provide text, itemId, and commentedBy');
        }
        const item = await this.itemModel.findById(dto.itemId);
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        const commenter = await this.studentModel.findById(dto.commentedBy);
        if (!commenter)
            throw new common_1.NotFoundException('Student not found');
        const mentionedUsernames = this.extractMentions(dto.text);
        const mentionedUsers = [];
        if (mentionedUsernames.length > 0) {
            const users = await this.studentModel.find({
                username: { $in: mentionedUsernames },
            });
            mentionedUsers.push(...users.map((user) => user._id));
        }
        let isReply = false;
        if (dto.parentCommentId) {
            const parentComment = await this.commentModel.findById(dto.parentCommentId);
            if (!parentComment)
                throw new common_1.NotFoundException('Parent comment not found');
            isReply = true;
        }
        const comment = await this.commentModel.create({
            text: dto.text,
            item: dto.itemId,
            commentedBy: dto.commentedBy,
            mentionedUsers,
            parentComment: dto.parentCommentId || null,
            isReply,
        });
        await comment.populate([
            { path: 'commentedBy', select: 'name username profilePicture' },
            { path: 'mentionedUsers', select: 'name username' },
        ]);
        return comment;
    }
    async getByItem(itemId, includeReplies, page = 1, limit = 10) {
        const item = await this.itemModel.findById(itemId);
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        const query = { item: itemId };
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
                comment.replyCount = replyCount;
            }
        }
        return (0, pagination_util_1.paginatedResponse)(comments, total, page, limit);
    }
    async getReplies(commentId, page = 1, limit = 10) {
        const parentComment = await this.commentModel.findById(commentId);
        if (!parentComment)
            throw new common_1.NotFoundException('Comment not found');
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
        return (0, pagination_util_1.paginatedResponse)(replies, total, page, limit);
    }
    async update(id, dto, currentUserId) {
        const comment = await this.commentModel.findById(id);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.commentedBy.toString() !== currentUserId) {
            throw new common_1.ForbiddenException('Not authorized to update this comment');
        }
        const mentionedUsernames = this.extractMentions(dto.text);
        const mentionedUsers = [];
        if (mentionedUsernames.length > 0) {
            const users = await this.studentModel.find({
                username: { $in: mentionedUsernames },
            });
            mentionedUsers.push(...users.map((user) => user._id));
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
    async delete(id, currentUserId) {
        const comment = await this.commentModel.findById(id);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.commentedBy.toString() !== currentUserId) {
            throw new common_1.ForbiddenException('Not authorized to delete this comment');
        }
        if (!comment.isReply) {
            await this.commentModel.deleteMany({ parentComment: comment._id });
        }
        await this.commentModel.findByIdAndDelete(id);
    }
    async toggleLike(id, studentId) {
        const comment = await this.commentModel.findById(id);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        const student = await this.studentModel.findById(studentId);
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        const studentObjectId = new mongoose_2.Types.ObjectId(studentId);
        const likeIndex = comment.likes.findIndex((likeId) => likeId.toString() === studentObjectId.toString());
        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        }
        else {
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
    async getByStudent(studentId, page = 1, limit = 10) {
        const student = await this.studentModel.findById(studentId);
        if (!student)
            throw new common_1.NotFoundException('Student not found');
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
        return (0, pagination_util_1.paginatedResponse)(comments, total, page, limit);
    }
    async getMentions(studentId, page = 1, limit = 10) {
        const student = await this.studentModel.findById(studentId);
        if (!student)
            throw new common_1.NotFoundException('Student not found');
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
        return (0, pagination_util_1.paginatedResponse)(comments, total, page, limit);
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __param(1, (0, mongoose_1.InjectModel)(student_schema_1.Student.name)),
    __param(2, (0, mongoose_1.InjectModel)(item_schema_1.Item.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CommentsService);
//# sourceMappingURL=comments.service.js.map