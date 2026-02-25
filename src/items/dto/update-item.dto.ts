import { IsString, IsOptional, IsIn, IsMongoId, MaxLength, IsBoolean } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['lost', 'found'])
  type?: string;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  media?: string;

  @IsOptional()
  @IsMongoId()
  claimedBy?: string;

  @IsOptional()
  @IsBoolean()
  isClaimed?: boolean;

  @IsOptional()
  @IsIn(['available', 'claimed', 'resolved'])
  status?: string;
}
