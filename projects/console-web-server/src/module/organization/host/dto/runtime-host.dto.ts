import { GetRuntimeHostInfoDtoBase, GetRuntimeHostLastInfoDtoBase, GetRuntimeHostListDtoBase, GetRuntimeHostTotalInfoDtoBase } from '@dogu-private/console';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class GetRuntimeHostInfoDto implements GetRuntimeHostInfoDtoBase {
  @IsNotEmpty()
  @IsString()
  timeStart!: string;

  @IsNotEmpty()
  @IsString()
  timeEnd!: string;

  @IsNotEmpty()
  @IsString()
  measure!: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string }) => {
    return value.trim().split(',');
  })
  fields!: string[];
}

export class GetRuntimeHostLastInfoDto implements GetRuntimeHostLastInfoDtoBase {
  @IsNotEmpty()
  @IsString()
  timeStart!: string;

  @IsNotEmpty()
  @IsString()
  timeEnd!: string;
}

export class GetRuntimeHostListDto implements GetRuntimeHostListDtoBase {
  @IsNotEmpty()
  @IsString()
  timeStart!: string;

  @IsNotEmpty()
  @IsString()
  timeEnd!: string;
}

export class GetRuntimeHostTotalInfoDto implements GetRuntimeHostTotalInfoDtoBase {
  @IsNotEmpty()
  @IsString()
  timeStart!: string;

  @IsNotEmpty()
  @IsString()
  timeEnd!: string;
}
