import { IsBoolean } from 'class-validator';

export interface DeviceFoldStatus {
  isFoldable: boolean;
  isFolded: boolean;
}

export class DeviceFoldRequestDto {
  @IsBoolean()
  fold!: boolean;
}
