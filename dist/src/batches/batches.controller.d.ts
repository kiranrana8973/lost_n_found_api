import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
export declare class BatchesController {
    private readonly batchesService;
    constructor(batchesService: BatchesService);
    create(dto: CreateBatchDto): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/batch.schema").BatchDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/batch.schema").Batch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    findAll(): Promise<{
        success: boolean;
        count: number;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/batch.schema").BatchDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/batch.schema").Batch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/batch.schema").BatchDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/batch.schema").Batch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    update(id: string, dto: UpdateBatchDto): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/batch.schema").BatchDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/batch.schema").Batch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
