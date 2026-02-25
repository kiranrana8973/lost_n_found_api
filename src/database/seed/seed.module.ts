import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { Batch, BatchSchema } from '../../batches/schemas/batch.schema';
import { Category, CategorySchema } from '../../categories/schemas/category.schema';
import { Student, StudentSchema } from '../../students/schemas/student.schema';
import { Item, ItemSchema } from '../../items/schemas/item.schema';
import { Comment, CommentSchema } from '../../comments/schemas/comment.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: './config/config.env' }),
    MongooseModule.forRoot(process.env.LOCAL_DATABASE_URI || 'mongodb://127.0.0.1:27017/lost_n_found'),
    MongooseModule.forFeature([
      { name: Batch.name, schema: BatchSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Student.name, schema: StudentSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
