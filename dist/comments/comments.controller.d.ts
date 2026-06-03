import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ToggleLikeDto } from './dto/toggle-like.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(dto: CreateCommentDto): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/comment.schema").CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/comment.schema").Comment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    getByItem(itemId: string, includeReplies: string, query: PaginationQueryDto): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/comment.schema").CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/comment.schema").Comment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getByStudent(studentId: string, query: PaginationQueryDto): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/comment.schema").CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/comment.schema").Comment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getMentions(studentId: string, query: PaginationQueryDto): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/comment.schema").CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/comment.schema").Comment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getReplies(commentId: string, query: PaginationQueryDto): Promise<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/comment.schema").CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/comment.schema").Comment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    update(id: string, dto: UpdateCommentDto, user: any): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/comment.schema").CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/comment.schema").Comment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    toggleLike(id: string, dto: ToggleLikeDto): Promise<{
        success: boolean;
        liked: boolean;
        likeCount: number;
        data: import("mongoose").Document<unknown, {}, import("./schemas/comment.schema").CommentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/comment.schema").Comment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
