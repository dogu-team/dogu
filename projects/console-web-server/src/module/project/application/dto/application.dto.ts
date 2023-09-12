import { FindProjectApplicationDtoBase, UploadProjectApplicationDtoBase, UploadSampleAppDtoBase } from '@dogu-private/console';
import { TransformBooleanString } from '@dogu-tech/common';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PageDto } from '../../../common/dto/pagination/page.dto';

export class FindProjectApplicationDto extends PageDto implements FindProjectApplicationDtoBase {
  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  @TransformBooleanString()
  latestOnly?: boolean;

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

export class UploadProjectApplicationDto implements UploadProjectApplicationDtoBase {
  @IsOptional()
  @IsBoolean()
  @TransformBooleanString()
  isLatest: boolean = false;
}
