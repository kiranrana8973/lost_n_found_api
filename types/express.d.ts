import { IStudent } from '../models/student_model';

declare global {
  namespace Express {
    interface Request {
      user?: IStudent;
      file?: Express.Multer.File;
    }
  }
}

export {};
