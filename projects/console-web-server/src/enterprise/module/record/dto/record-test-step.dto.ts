import { CreateRecordTestStepDtoBase } from '@dogu-private/console';
import { RecordTestStepId, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { IsIn, IsNumber, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class CreateRecordTestStepDto implements CreateRecordTestStepDtoBase {
  @IsUUID()
  @ValidateIf((object, value) => value !== null)
  prevRecordTestStepId!: RecordTestStepId | null;

  @IsIn(Object.values(RECORD_TEST_STEP_ACTION_TYPE))
  type!: RECORD_TEST_STEP_ACTION_TYPE;

  @IsUUID()
  deviceId!: string;

  @IsNumber()
  @IsOptional()
  screenPositionX!: number;

  @IsNumber()
  @IsOptional()
  screenPositionY!: number;

  @IsNumber()
  @IsOptional()
  screenSizeX!: number;

  @IsNumber()
  @IsOptional()
  screenSizeY!: number;
}

// export class UpdateRecordTestStepDto implements UpdateRecordTestStepDtoBase {
//   @IsString()
//   @IsOptional()
//   name!: string;
// }

// export class AddActionDto implements AddActionDtoBase {
//   @IsIn(Object.values(RECORD_TEST_STEP_ACTION_TYPE))
//   type!: RECORD_TEST_STEP_ACTION_TYPE;

//   @IsUUID()
//   deviceId!: string;

//   @IsUUID()
//   recordTestCaseId!: RecordTestStepId;

//   @IsNumber()
//   @IsOptional()
//   screenPositionX!: number;

//   @IsNumber()
//   @IsOptional()
//   screenPositionY!: number;
// }
