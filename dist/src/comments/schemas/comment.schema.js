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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentSchema = exports.Comment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Comment = class Comment {
};
exports.Comment = Comment;
__decorate([
    (0, mongoose_1.Prop)({ required: [true, 'Comment text is required'], trim: true }),
    __metadata("design:type", String)
], Comment.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Item',
        required: [true, 'Item reference is required'],
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Comment.prototype, "item", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Commenter reference is required'],
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Comment.prototype, "commentedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: mongoose_2.Types.ObjectId, ref: 'Student' }]),
    __metadata("design:type", Array)
], Comment.prototype, "mentionedUsers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Comment', default: null }),
    __metadata("design:type", Object)
], Comment.prototype, "parentComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Comment.prototype, "isReply", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: mongoose_2.Types.ObjectId, ref: 'Student' }]),
    __metadata("design:type", Array)
], Comment.prototype, "likes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Comment.prototype, "isEdited", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Comment.prototype, "editedAt", void 0);
exports.Comment = Comment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Comment);
exports.CommentSchema = mongoose_1.SchemaFactory.createForClass(Comment);
exports.CommentSchema.virtual('replyCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment',
    count: true,
});
exports.CommentSchema.set('toJSON', { virtuals: true });
exports.CommentSchema.set('toObject', { virtuals: true });
exports.CommentSchema.index({ item: 1, createdAt: -1 });
exports.CommentSchema.index({ parentComment: 1 });
exports.CommentSchema.index({ commentedBy: 1 });
//# sourceMappingURL=comment.schema.js.map