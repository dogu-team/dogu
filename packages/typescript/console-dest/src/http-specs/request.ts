import { IsFilledString } from '@dogu-tech/common';
import { DEST_STATE, DEST_TYPE, RoutineStepId } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class DestInfo {
  @IsFilledString()
  name!: string;

  @IsNotEmpty()
  @IsEnum(DEST_TYPE)
  type!: DEST_TYPE;

  @ValidateNested({ each: true })
  @Type(() => DestInfo)
  @IsArray()
  children!: DestInfo[];
}

export class UpdateDestStatusRequestBody {
  @IsNotEmpty()
  @IsEnum(DEST_STATE)
  destStatus!: DEST_STATE;

  @IsDate()
  @Type(() => Date)
  localTimeStamp!: Date;
}

export class CreateDestRequestBody {
  @IsNumber()
  @Type(() => Number)
  stepId!: RoutineStepId;

  @ValidateNested({ each: true })
  @Type(() => DestInfo)
  @IsArray()
  destInfos!: DestInfo[];
}
