import { FindProjectApplicationDtoBase, UploadSampleAppDtoBase } from '@dogu-private/console';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PageDto } from '../../../common/dto/pagination/page.dto';

export class FindProjectApplicationDto extends PageDto implements FindProjectApplicationDtoBase {
  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  extension?: string;
}

export class UploadSampleAppDto implements UploadSampleAppDtoBase {
  @IsNotEmpty()
  @IsIn(['mobile', 'game'])
  category!: 'mobile' | 'game';

  @IsNotEmpty()
  @IsIn(['apk'])
  extension!: 'apk';
}
