import { IsString, IsNotEmpty, IsIn, IsMongoId, MaxLength, IsOptional } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsIn(['lost', 'found'])
  type: string;

  @IsMongoId()
  category: string;

  @IsString()
  @MaxLength(200)
  location: string;

  @IsString()
  @IsNotEmpty()
  media: string;

  @IsOptional()
  @IsIn(['photo', 'video'])
  mediaType?: string;

  @IsMongoId()
  reportedBy: string;
}
