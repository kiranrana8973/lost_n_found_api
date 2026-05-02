import { Model } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { QueryItemsDto } from './dto/query-items.dto';
export declare class ItemsService {
    private itemModel;
    constructor(itemModel: Model<ItemDocument>);
    create(dto: CreateItemDto): Promise<import("mongoose").Document<unknown, {}, ItemDocument, {}, import("mongoose").DefaultSchemaOptions> & Item & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(query: QueryItemsDto): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, ItemDocument, {}, import("mongoose").DefaultSchemaOptions> & Item & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, ItemDocument, {}, import("mongoose").DefaultSchemaOptions> & Item & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateItemDto, currentUserId: string): Promise<import("mongoose").Document<unknown, {}, ItemDocument, {}, import("mongoose").DefaultSchemaOptions> & Item & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, currentUserId: string): Promise<void>;
}
