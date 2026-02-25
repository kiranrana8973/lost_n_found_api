import { IsOptional, IsIn, IsMongoId } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryItemsDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['lost', 'found'])
  type?: string;

  @IsOptional()
  @IsIn(['available', 'claimed', 'resolved'])
  status?: string;

  @IsOptional()
  @IsMongoId()
  category?: string;
}
