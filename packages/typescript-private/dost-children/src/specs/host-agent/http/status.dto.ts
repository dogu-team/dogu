import { Code } from '@dogu-private/types';
import { IsFilledString } from '@dogu-tech/common';
import { IsBoolean, IsDate, IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

const ConnectionStatus = ['is-token-empty', 'connecting', 'connected', 'disconnected'] as const;
export type ConnectionStatus = (typeof ConnectionStatus)[number];

export class GetConnectionStatusResponse {
  @IsIn(ConnectionStatus)
  status!: ConnectionStatus;

  @IsEnum(Code)
  @IsOptional()
  code?: Code;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDate()
  updatedAt!: Date;
}

export class GetLatestVersionResponse {
  @IsFilledString()
  version!: string;

  @IsFilledString()
  url!: string;

  @IsNumber()
  fileSize!: number;
}

export class UpdateLatestVersionRequest {
  @IsFilledString()
  url!: string;

  @IsNumber()
  fileSize!: number;
}

export class UpdateLatestVersionResponse {
  @IsBoolean()
  isOk!: boolean;

  @IsFilledString()
  reason!: string;
}
