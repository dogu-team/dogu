import { IsFilledString } from '@dogu-tech/common';
import { DEST_STATE, DEST_TYPE } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';

export class CreateRemoteDestRequestBody {
  @ValidateNested({ each: true })
  @Type(() => DestInfo)
  @IsArray()
  remoteDestInfos!: DestInfo[];
}

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

export class UpdateRemoteDestStateRequestBody {
  @IsNotEmpty()
  @IsEnum(DEST_STATE)
  remoteDestState!: DEST_STATE;

  @IsDate()
  @Type(() => Date)
  localTimeStamp!: Date;
}
