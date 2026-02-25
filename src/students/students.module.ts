import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './schemas/student.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { BatchesModule } from '../batches/batches.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    BatchesModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService, MongooseModule],
})
export class StudentsModule {}
