import { Document, Types } from 'mongoose';
export type RefreshTokenDocument = RefreshToken & Document;
export declare class RefreshToken {
    token: string;
    student: Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
}
export declare const RefreshTokenSchema: import("mongoose").Schema<RefreshToken, import("mongoose").Model<RefreshToken, any, any, any, (Document<unknown, any, RefreshToken, any, import("mongoose").DefaultSchemaOptions> & RefreshToken & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, RefreshToken, any, import("mongoose").DefaultSchemaOptions> & RefreshToken & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, RefreshToken>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RefreshToken, Document<unknown, {}, RefreshToken, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<RefreshToken & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    token?: import("mongoose").SchemaDefinitionProperty<string, RefreshToken, Document<unknown, {}, RefreshToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RefreshToken & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    student?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, RefreshToken, Document<unknown, {}, RefreshToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RefreshToken & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, RefreshToken, Document<unknown, {}, RefreshToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RefreshToken & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, RefreshToken, Document<unknown, {}, RefreshToken, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RefreshToken & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, RefreshToken>;
