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
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const batch_schema_1 = require("../../batches/schemas/batch.schema");
const category_schema_1 = require("../../categories/schemas/category.schema");
const student_schema_1 = require("../../students/schemas/student.schema");
const item_schema_1 = require("../../items/schemas/item.schema");
const comment_schema_1 = require("../../comments/schemas/comment.schema");
const batches_data_1 = require("./data/batches.data");
const categories_data_1 = require("./data/categories.data");
const students_data_1 = require("./data/students.data");
const items_data_1 = require("./data/items.data");
const comments_data_1 = require("./data/comments.data");
let SeedService = class SeedService {
    constructor(batchModel, categoryModel, studentModel, itemModel, commentModel) {
        this.batchModel = batchModel;
        this.categoryModel = categoryModel;
        this.studentModel = studentModel;
        this.itemModel = itemModel;
        this.commentModel = commentModel;
    }
    async importData() {
        await this.batchModel.deleteMany();
        await this.categoryModel.deleteMany();
        await this.studentModel.deleteMany();
        await this.itemModel.deleteMany();
        await this.commentModel.deleteMany();
        console.log('Data Destroyed...');
        const createdBatches = await this.batchModel.insertMany(batches_data_1.batchesData);
        console.log(`${createdBatches.length} Batches created`);
        const createdCategories = await this.categoryModel.insertMany(categories_data_1.categoriesData);
        console.log(`${createdCategories.length} Categories created`);
        const createdStudents = [];
        for (let i = 0; i < students_data_1.studentsData.length; i++) {
            const studentData = {
                ...students_data_1.studentsData[i],
                batchId: createdBatches[i % createdBatches.length]._id,
            };
            const student = await this.studentModel.create(studentData);
            createdStudents.push(student);
        }
        console.log(`${createdStudents.length} Students created`);
        const itemsWithRefs = items_data_1.itemsData.map((item, index) => ({
            ...item,
            reportedBy: createdStudents[index % createdStudents.length]._id,
            category: createdCategories[items_data_1.itemCategoryMap[index]]._id,
            ...(item.status === 'claimed' || item.status === 'resolved'
                ? {
                    claimedBy: createdStudents[(index + 1) % createdStudents.length]._id,
                    isClaimed: true,
                }
                : {}),
        }));
        const createdItems = await this.itemModel.insertMany(itemsWithRefs);
        console.log(`${createdItems.length} Items created`);
        const commentsWithRefs = comments_data_1.commentsData.map((comment, index) => ({
            ...comment,
            item: createdItems[index % createdItems.length]._id,
            commentedBy: createdStudents[(index + 2) % createdStudents.length]._id,
        }));
        const createdComments = await this.commentModel.insertMany(commentsWithRefs);
        console.log(`${createdComments.length} Comments created`);
        console.log('\nAll data imported successfully!');
        console.log(`\nSummary:`);
        console.log(`   Batches: ${createdBatches.length}`);
        console.log(`   Categories: ${createdCategories.length}`);
        console.log(`   Students: ${createdStudents.length}`);
        console.log(`   Items: ${createdItems.length}`);
        console.log(`   Comments: ${createdComments.length}`);
        console.log('\nLogin Credentials (All passwords: password123):');
        createdStudents.slice(0, 5).forEach((student) => {
            console.log(`   Email: ${student.email} | Username: ${student.username}`);
        });
    }
    async destroyData() {
        await this.batchModel.deleteMany();
        await this.categoryModel.deleteMany();
        await this.studentModel.deleteMany();
        await this.itemModel.deleteMany();
        await this.commentModel.deleteMany();
        console.log('Data Destroyed...');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(batch_schema_1.Batch.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(2, (0, mongoose_1.InjectModel)(student_schema_1.Student.name)),
    __param(3, (0, mongoose_1.InjectModel)(item_schema_1.Item.name)),
    __param(4, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SeedService);
//# sourceMappingURL=seed.service.js.map