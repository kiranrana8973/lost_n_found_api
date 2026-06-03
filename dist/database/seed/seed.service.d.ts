import { Model } from 'mongoose';
import { BatchDocument } from '../../batches/schemas/batch.schema';
import { CategoryDocument } from '../../categories/schemas/category.schema';
import { StudentDocument } from '../../students/schemas/student.schema';
import { ItemDocument } from '../../items/schemas/item.schema';
import { CommentDocument } from '../../comments/schemas/comment.schema';
export declare class SeedService {
    private batchModel;
    private categoryModel;
    private studentModel;
    private itemModel;
    private commentModel;
    constructor(batchModel: Model<BatchDocument>, categoryModel: Model<CategoryDocument>, studentModel: Model<StudentDocument>, itemModel: Model<ItemDocument>, commentModel: Model<CommentDocument>);
    importData(): Promise<void>;
    destroyData(): Promise<void>;
}
