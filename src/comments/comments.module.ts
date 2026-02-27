import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./schemas/comment.schema";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { StudentsModule } from "../students/students.module";
import { ItemsModule } from "../items/items.module";
import { Student, StudentSchema } from "../students/schemas/student.schema";
import { Item, ItemSchema } from "../items/schemas/item.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
