import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsMongoId()
  itemId: string;

  @IsMongoId()
  commentedBy: string;

  @IsOptional()
  @IsMongoId()
  parentCommentId?: string;
}
