import { IsFilledString } from '@dogu-tech/common';

export class HostAppDto {
  @IsFilledString()
  url!: string;
}
