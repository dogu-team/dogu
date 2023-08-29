import {
  AddRecordTestCaseToRecordTestScenarioDtoBase,
  CreateRecordTestScenarioDtoBase,
  FindRecordTestScenariosByProjectIdDtoBase,
  UpdateRecordTestScenarioDtoBase,
} from '@dogu-private/console';
import { RecordTestCaseId } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { PageDto } from '../../../../module/common/dto/pagination/page.dto';

export class CreateRecordTestScenarioDto implements CreateRecordTestScenarioDtoBase {
  @IsFilledString()
  name!: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  recordTestCaseIds!: RecordTestCaseId[];
}

export class FindRecordTestScenariosByProjectIdDto extends PageDto implements FindRecordTestScenariosByProjectIdDtoBase {
  @IsString()
  @IsOptional()
  keyword = '';
}

export class UpdateRecordTestScenarioDto implements UpdateRecordTestScenarioDtoBase {
  @IsFilledString()
  name!: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  recordTestCaseIds!: RecordTestCaseId[];
}

export class AddRecordTestCaseToRecordTestScenarioDto implements AddRecordTestCaseToRecordTestScenarioDtoBase {
  @IsFilledString()
  recordTestCaseId!: RecordTestCaseId;

  @IsOptional()
  prevRecordTestCaseId!: RecordTestCaseId | null;
}
