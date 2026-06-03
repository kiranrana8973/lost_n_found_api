import { Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Student, StudentDocument } from '../../students/schemas/student.schema';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private studentModel;
    constructor(studentModel: Model<StudentDocument>, configService: ConfigService);
    validate(payload: {
        id: string;
    }): Promise<import("mongoose").Document<unknown, {}, StudentDocument, {}, import("mongoose").DefaultSchemaOptions> & Student & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export {};
