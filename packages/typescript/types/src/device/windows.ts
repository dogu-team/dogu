import { IsFilledString } from '@dogu-tech/common';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeviceWindowInfo {
  @IsNumber()
  id!: number;

  @IsNumber()
  pid!: number;

  @IsFilledString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  width!: number;

  @IsNumber()
  height!: number;
}
