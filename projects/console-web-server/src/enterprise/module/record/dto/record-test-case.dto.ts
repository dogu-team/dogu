import {
  CreateRecordTestCaseDtoBase,
  FindRecordTestCasesByProjectIdDtoBase,
  LoadRecordTestCaseDtoBase,
  NewSessionDtoBase,
  UpdateRecordTestCaseDtoBase,
} from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsNumber, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
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

  @IsUUID()
  deviceId!: DeviceId;

  @IsNumber()
  activeDeviceScreenSizeX!: number;

  @IsNumber()
  activeDeviceScreenSizeY!: number;
}
export class FindRecordTestCaseByProjectIdDto extends PageDto implements FindRecordTestCasesByProjectIdDtoBase {
  @IsString()
  @IsOptional()
  keyword = '';
}

export class LoadRecordTestCaseDto implements LoadRecordTestCaseDtoBase {
  @IsUUID()
  deviceId!: DeviceId;

  @IsNumber()
  activeDeviceScreenSizeX!: number;

  @IsNumber()
  activeDeviceScreenSizeY!: number;
}

export class UpdateRecordTestCaseDto implements UpdateRecordTestCaseDtoBase {
  @IsFilledString()
  name!: string;
}

export class NewSessionDto implements NewSessionDtoBase {
  @IsString()
  @IsOptional()
  appVersion?: string; //

  @IsString()
  @IsOptional()
  browserName?: string;

  @IsString()
  @IsOptional()
  browserVersion?: string;

  @IsFilledString()
  deviceId!: string;
}
