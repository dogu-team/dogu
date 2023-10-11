import { FindCloudDevicesDtoBase } from '@dogu-private/console';
import { IsString } from 'class-validator';
import { PageDto } from '../common/dto/pagination/page.dto';

export class FindCloudDevicesDto extends PageDto implements FindCloudDevicesDtoBase {
  @IsString()
  keyword = '';
}
