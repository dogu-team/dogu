import {
  FilledRuntimeInfo,
  Platform,
  RuntimeInfoBattery,
  RuntimeInfoCpu,
  RuntimeInfoCpuFreq,
  RuntimeInfoDisplay,
  RuntimeInfoFs,
  RuntimeInfoGpu,
  RuntimeInfoMem,
  RuntimeInfoNet,
  RuntimeProcessInfo,
  RuntimeProcessInfoCpu,
  RuntimeProcessInfoFs,
  RuntimeProcessInfoMem,
  RuntimeProcessInfoNet,
} from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';

export class RuntimeInfoCpuDto implements RuntimeInfoCpu {
  @IsString()
  name!: string;

  @IsNumber()
  currentLoad!: number;

  @IsNumber()
  currentLoadUser!: number;

  @IsNumber()
  currentLoadSystem!: number;

  @IsNumber()
  currentLoadNice!: number;

  @IsNumber()
  currentLoadIdle!: number;

  @IsNumber()
  currentLoadIrq!: number;

  @IsNumber()
  currentLoadCpu!: number;
}

export class RuntimeInfoCpuFreqDto implements RuntimeInfoCpuFreq {
  @IsNumber()
  idx!: number;

  @IsNumber()
  cur!: number;

  @IsNumber()
  min!: number;

  @IsNumber()
  max!: number;
}

export class RuntimeInfoGpuDto implements RuntimeInfoGpu {
  @IsString()
  desc!: string;
}

export class RuntimeInfoMemDto implements RuntimeInfoMem {
  @IsString()
  name!: string;

  @IsNumber()
  total!: number;

  @IsNumber()
  free!: number;

  @IsNumber()
  used!: number;

  @IsNumber()
  active!: number;

  @IsNumber()
  available!: number;

  @IsNumber()
  swaptotal!: number;

  @IsNumber()
  swapused!: number;

  @IsNumber()
  swapfree!: number;

  @IsBoolean()
  isLow!: boolean;
}

export class RuntimeInfoFsDto implements RuntimeInfoFs {
  @IsString()
  name!: string;

  @IsString()
  type!: string;

  @IsString()
  mount!: string;

  @IsNumber()
  size!: number;

  @IsNumber()
  used!: number;

  @IsNumber()
  available!: number;

  @IsNumber()
  use!: number;

  @IsNumber()
  readsCompleted!: number;

  @IsNumber()
  timeSpentReadMs!: number;

  @IsNumber()
  writesCompleted!: number;

  @IsNumber()
  timeSpentWriteMs!: number;
}

export class RuntimeInfoNetDto implements RuntimeInfoNet {
  @IsString()
  name!: string;

  @IsNumber()
  mobileRxbytes!: number;

  @IsNumber()
  mobileTxbytes!: number;

  @IsNumber()
  wifiRxbytes!: number;

  @IsNumber()
  wifiTxbytes!: number;

  @IsNumber()
  totalRxbytes!: number;

  @IsNumber()
  totalTxbytes!: number;
}

export class RuntimeInfoDisplayDto implements RuntimeInfoDisplay {
  @IsString()
  name!: string;

  @IsBoolean()
  isScreenOn!: boolean;
}

export class RuntimeInfoBatteryDto implements RuntimeInfoBattery {
  @IsString()
  name!: string;

  @IsNumber()
  percent!: number;
}

export class RuntimeProcessInfoCpuDto implements RuntimeProcessInfoCpu {
  @IsString()
  name!: string;

  @IsNumber()
  percent!: number;
}

export class RuntimeProcessInfoMemDto implements RuntimeProcessInfoMem {
  @IsString()
  name!: string;

  @IsNumber()
  percent!: number;
}

export class RuntimeProcessInfoFsDto implements RuntimeProcessInfoFs {
  @IsString()
  name!: string;

  @IsNumber()
  writeBytes!: number;

  @IsNumber()
  readBytes!: number;
}

export class RuntimeProcessInfoNetDto implements RuntimeProcessInfoNet {
  @IsString()
  name!: string;

  @IsNumber()
  sendBytes!: number;

  @IsNumber()
  readBytes!: number;
}

export class RuntimeProcessInfoDto implements RuntimeProcessInfo {
  @IsString()
  name!: string;

  @IsNumber()
  pid!: number;

  @IsBoolean()
  isForeground!: boolean;

  @ValidateNested({ each: true })
  @Type(() => RuntimeProcessInfoCpuDto)
  @IsArray()
  cpues!: RuntimeProcessInfoCpuDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeProcessInfoMemDto)
  @IsArray()
  mems!: RuntimeProcessInfoMemDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeProcessInfoFsDto)
  @IsArray()
  fses!: RuntimeProcessInfoFsDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeProcessInfoNetDto)
  @IsArray()
  nets!: RuntimeProcessInfoNetDto[];
}

export class RuntimeInfoDto implements FilledRuntimeInfo {
  @IsEnum(Platform)
  platform!: Platform;

  @ValidateNested({ each: true })
  @Type(() => RuntimeInfoCpuDto)
  @IsArray()
  cpues!: RuntimeInfoCpuDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeInfoCpuFreqDto)
  @IsArray()
  cpufreqs!: RuntimeInfoCpuFreqDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeInfoGpuDto)
  @IsArray()
  gpues!: RuntimeInfoGpuDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeInfoMemDto)
  @IsArray()
  mems!: RuntimeInfoMemDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeInfoFsDto)
  @IsArray()
  fses!: RuntimeInfoFsDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeInfoNetDto)
  @IsArray()
  nets!: RuntimeInfoNetDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeInfoDisplayDto)
  @IsArray()
  displays!: RuntimeInfoDisplayDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeInfoBatteryDto)
  @IsArray()
  batteries!: RuntimeInfoBatteryDto[];

  @ValidateNested({ each: true })
  @Type(() => RuntimeProcessInfoDto)
  @IsArray()
  processes!: RuntimeProcessInfoDto[];

  @IsDate()
  @Type(() => Date)
  localTimeStamp!: Date;
}
