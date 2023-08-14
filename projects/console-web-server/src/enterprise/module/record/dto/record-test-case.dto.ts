import { CreateRecordTestCaseDtoBase, FindRecordTestCasesByProjectIdDtoBase, NewSessionRecordTestCaseDtoBase, UpdateRecordTestCaseDtoBase } from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { PageDto } from '../../../../module/common/dto/pagination/page.dto';

export class CreateRecordTestCaseDto implements CreateRecordTestCaseDtoBase {
  @IsFilledString()
  name!: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  browserName!: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  packageName!: string | null;
}
export class FindRecordTestCaseByProjectIdDto extends PageDto implements FindRecordTestCasesByProjectIdDtoBase {
  @IsString()
  @IsOptional()
  keyword = '';
}

export class NewSessionRecordTestCaseDto implements NewSessionRecordTestCaseDtoBase {
  @IsUUID()
  deviceId!: DeviceId;
}

export class UpdateRecordTestCaseDto implements UpdateRecordTestCaseDtoBase {
  @IsFilledString()
  name!: string;
}
