import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Batch, BatchDocument } from '../../batches/schemas/batch.schema';
import { Category, CategoryDocument } from '../../categories/schemas/category.schema';
import { Student, StudentDocument } from '../../students/schemas/student.schema';
import { Item, ItemDocument } from '../../items/schemas/item.schema';
import { Comment, CommentDocument } from '../../comments/schemas/comment.schema';
import { batchesData } from './data/batches.data';
import { categoriesData } from './data/categories.data';
import { studentsData } from './data/students.data';
import { itemsData, itemCategoryMap } from './data/items.data';
import { commentsData } from './data/comments.data';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Batch.name) private batchModel: Model<BatchDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async importData() {
    await this.batchModel.deleteMany();
    await this.categoryModel.deleteMany();
    await this.studentModel.deleteMany();
    await this.itemModel.deleteMany();
    await this.commentModel.deleteMany();
    console.log('Data Destroyed...');

    const createdBatches = await this.batchModel.insertMany(batchesData);
    console.log(`${createdBatches.length} Batches created`);

    const createdCategories = await this.categoryModel.insertMany(categoriesData);
    console.log(`${createdCategories.length} Categories created`);

    const createdStudents: StudentDocument[] = [];
    for (let i = 0; i < studentsData.length; i++) {
      const studentData = {
        ...studentsData[i],
        batchId: createdBatches[i % createdBatches.length]._id as Types.ObjectId,
      };
      const student = await this.studentModel.create(studentData);
      createdStudents.push(student);
    }
    console.log(`${createdStudents.length} Students created`);

    const itemsWithRefs = itemsData.map((item, index) => ({
      ...item,
      reportedBy: createdStudents[index % createdStudents.length]._id,
      category: createdCategories[itemCategoryMap[index]]._id as Types.ObjectId,
      ...(item.status === 'claimed' || item.status === 'resolved'
        ? {
            claimedBy: createdStudents[(index + 1) % createdStudents.length]._id,
            isClaimed: true,
          }
        : {}),
    }));

    const createdItems = await this.itemModel.insertMany(itemsWithRefs);
    console.log(`${createdItems.length} Items created`);

    const commentsWithRefs = commentsData.map((comment, index) => ({
      ...comment,
      item: createdItems[index % createdItems.length]._id as Types.ObjectId,
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
}
