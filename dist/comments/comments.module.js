"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const comment_schema_1 = require("./schemas/comment.schema");
const comments_controller_1 = require("./comments.controller");
const comments_service_1 = require("./comments.service");
const student_schema_1 = require("../students/schemas/student.schema");
const item_schema_1 = require("../items/schemas/item.schema");
let CommentsModule = class CommentsModule {
};
exports.CommentsModule = CommentsModule;
exports.CommentsModule = CommentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: comment_schema_1.Comment.name, schema: comment_schema_1.CommentSchema },
                { name: student_schema_1.Student.name, schema: student_schema_1.StudentSchema },
                { name: item_schema_1.Item.name, schema: item_schema_1.ItemSchema },
            ]),
        ],
        controllers: [comments_controller_1.CommentsController],
        providers: [comments_service_1.CommentsService],
        exports: [comments_service_1.CommentsService],
    })
], CommentsModule);
//# sourceMappingURL=comments.module.js.map