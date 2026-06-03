import { Document, Types } from 'mongoose';
export type ItemDocument = Item & Document;
export declare class Item {
    itemName: string;
    description: string;
    type: string;
    category: Types.ObjectId;
    location: string;
    media: string;
    mediaType: string;
    claimedBy: Types.ObjectId;
    isClaimed: boolean;
    reportedBy: Types.ObjectId;
    status: string;
}
export declare const ItemSchema: import("mongoose").Schema<Item, import("mongoose").Model<Item, any, any, any, (Document<unknown, any, Item, any, import("mongoose").DefaultSchemaOptions> & Item & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Item, any, import("mongoose").DefaultSchemaOptions> & Item & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Item>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Item, Document<unknown, {}, Item, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    itemName?: import("mongoose").SchemaDefinitionProperty<string, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    media?: import("mongoose").SchemaDefinitionProperty<string, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mediaType?: import("mongoose").SchemaDefinitionProperty<string, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    claimedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isClaimed?: import("mongoose").SchemaDefinitionProperty<boolean, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reportedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, Item, Document<unknown, {}, Item, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Item & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Item>;
