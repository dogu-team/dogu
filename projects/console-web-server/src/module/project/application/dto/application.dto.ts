import { FindProjectApplicationDtoBase } from '@dogu-private/console';
import { IsOptional, IsString } from 'class-validator';
import { PageDto } from '../../../common/dto/pagination/page.dto';

export class FindProjectApplicationDto extends PageDto implements FindProjectApplicationDtoBase {
  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  extension?: string;
}
