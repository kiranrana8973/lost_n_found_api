import { Document } from 'mongoose';
export type BatchDocument = Batch & Document;
export declare class Batch {
    batchName: string;
    status: string;
    createdAt: Date;
}
export declare const BatchSchema: import("mongoose").Schema<Batch, import("mongoose").Model<Batch, any, any, any, (Document<unknown, any, Batch, any, import("mongoose").DefaultSchemaOptions> & Batch & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Batch, any, import("mongoose").DefaultSchemaOptions> & Batch & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Batch>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Batch, Document<unknown, {}, Batch, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Batch & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    batchName?: import("mongoose").SchemaDefinitionProperty<string, Batch, Document<unknown, {}, Batch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Batch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, Batch, Document<unknown, {}, Batch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Batch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Batch, Document<unknown, {}, Batch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Batch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Batch>;
