import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  batchName: string;

  @IsOptional()
  @IsIn(['active', 'completed', 'cancelled'])
  status?: string;
}
