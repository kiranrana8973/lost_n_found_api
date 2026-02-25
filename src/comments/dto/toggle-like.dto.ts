import { IsMongoId } from 'class-validator';

export class ToggleLikeDto {
  @IsMongoId()
  studentId: string;
}
