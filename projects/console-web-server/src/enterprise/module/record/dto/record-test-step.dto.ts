import { CreateRecordTestStepDtoBase, FindRecordTestStepsByProjectIdDtoBase, UpdateRecordTestStepDtoBase } from '@dogu-private/console';
import { IsFilledString } from '@dogu-tech/common';
import { IsOptional, IsString } from 'class-validator';
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
