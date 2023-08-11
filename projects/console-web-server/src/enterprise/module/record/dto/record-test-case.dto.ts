import {
  AddRecordTestStepToRecordTestCaseDtoBase,
  CreateRecordTestCaseDtoBase,
  FindRecordTestCasesByProjectIdDtoBase,
  NewSessionDtoBase,
  UpdateRecordTestCaseDtoBase,
} from '@dogu-private/console';
import { RecordTestStepId } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsOptional, IsString } from 'class-validator';
import { PageDto } from '../../../../module/common/dto/pagination/page.dto';

export class CreateRecordTestCaseDto implements CreateRecordTestCaseDtoBase {
  @IsFilledString()
  name!: string;
}
export class FindRecordTestCaseByProjectIdDto extends PageDto implements FindRecordTestCasesByProjectIdDtoBase {
  @IsString()
  @IsOptional()
  keyword = '';
}

export class UpdateRecordTestCaseDto implements UpdateRecordTestCaseDtoBase {
  @IsString()
  @IsOptional()
  name!: string;
}

export class AddRecordTestStepToRecordTestCaseDto implements AddRecordTestStepToRecordTestCaseDtoBase {
  @IsFilledString()
  recordTestStepId!: RecordTestStepId;

  @IsOptional()
  prevRecordTestStepId!: RecordTestStepId | null;
}

export class NewSessionDto implements NewSessionDtoBase {
  @IsString()
  @IsOptional()
  appVersion?: string;

  @IsString()
  @IsOptional()
  browserName?: string;

  @IsString()
  @IsOptional()
  browserVersion?: string;

  @IsFilledString()
  deviceId!: string;
}
