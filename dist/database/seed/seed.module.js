"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const seed_service_1 = require("./seed.service");
const batch_schema_1 = require("../../batches/schemas/batch.schema");
const category_schema_1 = require("../../categories/schemas/category.schema");
const student_schema_1 = require("../../students/schemas/student.schema");
const item_schema_1 = require("../../items/schemas/item.schema");
const comment_schema_1 = require("../../comments/schemas/comment.schema");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ envFilePath: './config/config.env' }),
            mongoose_1.MongooseModule.forRoot(process.env.LOCAL_DATABASE_URI || 'mongodb://127.0.0.1:27017/lost_n_found'),
            mongoose_1.MongooseModule.forFeature([
                { name: batch_schema_1.Batch.name, schema: batch_schema_1.BatchSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: student_schema_1.Student.name, schema: student_schema_1.StudentSchema },
                { name: item_schema_1.Item.name, schema: item_schema_1.ItemSchema },
                { name: comment_schema_1.Comment.name, schema: comment_schema_1.CommentSchema },
            ]),
        ],
        providers: [seed_service_1.SeedService],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map