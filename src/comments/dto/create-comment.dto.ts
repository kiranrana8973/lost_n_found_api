import { IsString, IsNotEmpty, IsMongoId, IsOptional, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @IsMongoId()
  itemId: string;

  @IsMongoId()
  commentedBy: string;

  @IsOptional()
  @IsMongoId()
  parentCommentId?: string;
}
