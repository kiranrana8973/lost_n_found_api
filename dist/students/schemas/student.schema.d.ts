import { Document, Types } from 'mongoose';
export type StudentDocument = Student & Document;
export declare class Student {
    name: string;
    email: string;
    username: string;
    password: string;
    phoneNumber: string;
    batchId: Types.ObjectId;
    profilePicture: string;
    role: string;
    createdAt: Date;
}
export declare const StudentSchema: import("mongoose").Schema<Student, import("mongoose").Model<Student, any, any, any, (Document<unknown, any, Student, any, import("mongoose").DefaultSchemaOptions> & Student & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Student, any, import("mongoose").DefaultSchemaOptions> & Student & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Student>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Student, Document<unknown, {}, Student, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    username?: import("mongoose").SchemaDefinitionProperty<string, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    password?: import("mongoose").SchemaDefinitionProperty<string, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phoneNumber?: import("mongoose").SchemaDefinitionProperty<string, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    batchId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    profilePicture?: import("mongoose").SchemaDefinitionProperty<string, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    role?: import("mongoose").SchemaDefinitionProperty<string, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Student>;
