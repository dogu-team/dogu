import { AddActionDtoBase, CreateRecordTestStepDtoBase, FindRecordTestStepsByProjectIdDtoBase, UpdateRecordTestStepDtoBase } from '@dogu-private/console';
import { RecordTestStepId, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { PageDto } from '../../../../module/common/dto/pagination/page.dto';

export class CreateRecordTestStepDto implements CreateRecordTestStepDtoBase {
  @IsFilledString()
  name!: string;
}
export class FindRecordTestStepsByProjectIdDto extends PageDto implements FindRecordTestStepsByProjectIdDtoBase {
  @IsString()
  @IsOptional()
  keyword = '';
}

export class UpdateRecordTestStepDto implements UpdateRecordTestStepDtoBase {
  @IsString()
  @IsOptional()
  name!: string;
}

export class AddActionDto implements AddActionDtoBase {
  @IsIn(Object.values(RECORD_TEST_STEP_ACTION_TYPE))
  type!: RECORD_TEST_STEP_ACTION_TYPE;

  @IsUUID()
  deviceId!: string;

  @IsUUID()
  recordTestCaseId!: RecordTestStepId;

  @IsNumber()
  @IsOptional()
  screenPositionX!: number;

  @IsNumber()
  @IsOptional()
  screenPositionY!: number;
}
