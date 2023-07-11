import { Code } from '@dogu-private/types';
import { IsDate, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

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
