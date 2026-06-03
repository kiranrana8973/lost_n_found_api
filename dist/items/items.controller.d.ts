import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { QueryItemsDto } from './dto/query-items.dto';
export declare class ItemsController {
    private readonly itemsService;
    constructor(itemsService: ItemsService);
    uploadPhoto(file: Express.Multer.File): Promise<{
        success: boolean;
        data: string;
        message: string;
    }>;
    uploadVideo(file: Express.Multer.File): Promise<{
        success: boolean;
        data: string;
        message: string;
    }>;
    create(dto: CreateItemDto): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/item.schema").ItemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/item.schema").Item & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    findAll(query: QueryItemsDto): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/item.schema").ItemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/item.schema").Item & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/item.schema").ItemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/item.schema").Item & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    update(id: string, dto: UpdateItemDto, user: any): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/item.schema").ItemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/item.schema").Item & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    remove(id: string, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
