import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { StudentDocument } from '../students/schemas/student.schema';
import { ItemDocument } from '../items/schemas/item.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
export declare class CommentsService {
    private commentModel;
    private studentModel;
    private itemModel;
    constructor(commentModel: Model<CommentDocument>, studentModel: Model<StudentDocument>, itemModel: Model<ItemDocument>);
    private extractMentions;
    create(dto: CreateCommentDto): Promise<import("mongoose").Document<unknown, {}, CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & Comment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getByItem(itemId: string, includeReplies: string, page?: number, limit?: number): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & Comment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getReplies(commentId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & Comment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    update(id: string, dto: UpdateCommentDto, currentUserId: string): Promise<import("mongoose").Document<unknown, {}, CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & Comment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, currentUserId: string): Promise<void>;
    toggleLike(id: string, studentId: string): Promise<{
        success: boolean;
        liked: boolean;
        likeCount: number;
        data: import("mongoose").Document<unknown, {}, CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & Comment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    getByStudent(studentId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & Comment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getMentions(studentId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & Comment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
}
