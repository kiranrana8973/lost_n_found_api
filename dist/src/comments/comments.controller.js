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
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const comments_service_1 = require("./comments.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const update_comment_dto_1 = require("./dto/update-comment.dto");
const toggle_like_dto_1 = require("./dto/toggle-like.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../common/decorators/public.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const parse_object_id_pipe_1 = require("../common/pipes/parse-object-id.pipe");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
let CommentsController = class CommentsController {
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async create(dto) {
        const comment = await this.commentsService.create(dto);
        return { success: true, data: comment };
    }
    async getByItem(itemId, includeReplies, query) {
        return this.commentsService.getByItem(itemId, includeReplies, query.page, query.limit);
    }
    async getByStudent(studentId, query) {
        return this.commentsService.getByStudent(studentId, query.page, query.limit);
    }
    async getMentions(studentId, query) {
        return this.commentsService.getMentions(studentId, query.page, query.limit);
    }
    async getReplies(commentId, query) {
        return this.commentsService.getReplies(commentId, query.page, query.limit);
    }
    async update(id, dto, user) {
        const comment = await this.commentsService.update(id, dto, user._id.toString());
        return { success: true, data: comment };
    }
    async remove(id, user) {
        await this.commentsService.delete(id, user._id.toString());
        return { success: true, message: 'Comment deleted successfully' };
    }
    async toggleLike(id, dto) {
        return this.commentsService.toggleLike(id, dto.studentId);
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('item/:itemId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('itemId', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __param(1, (0, common_1.Query)('includeReplies')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getByItem", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('studentId', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getByStudent", null);
__decorate([
    (0, common_1.Get)('mentions/:studentId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('studentId', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getMentions", null);
__decorate([
    (0, common_1.Get)(':commentId/replies'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('commentId', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getReplies", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_comment_dto_1.UpdateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, toggle_like_dto_1.ToggleLikeDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "toggleLike", null);
exports.CommentsController = CommentsController = __decorate([
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map