import { Model } from 'mongoose';
import { Batch, BatchDocument } from './schemas/batch.schema';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
export declare class BatchesService {
    private batchModel;
    constructor(batchModel: Model<BatchDocument>);
    create(dto: CreateBatchDto): Promise<import("mongoose").Document<unknown, {}, BatchDocument, {}, import("mongoose").DefaultSchemaOptions> & Batch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, BatchDocument, {}, import("mongoose").DefaultSchemaOptions> & Batch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, BatchDocument, {}, import("mongoose").DefaultSchemaOptions> & Batch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateBatchDto): Promise<import("mongoose").Document<unknown, {}, BatchDocument, {}, import("mongoose").DefaultSchemaOptions> & Batch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
