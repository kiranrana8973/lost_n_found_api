import { IsString, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';

export class UpdateBatchDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  batchName?: string;

  @IsOptional()
  @IsIn(['active', 'completed', 'cancelled'])
  status?: string;
}
