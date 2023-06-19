import { Code } from '@dogu-private/types';
import { IsDate, IsEnum, IsIn, IsOptional } from 'class-validator';

const ConnectionStatus = ['is-not-active', 'connecting', 'connected', 'disconnected'] as const;
export type ConnectionStatus = (typeof ConnectionStatus)[number];

export class GetConnectionStatusResponse {
  @IsIn(ConnectionStatus)
  status!: ConnectionStatus;

  @IsEnum(Code)
  @IsOptional()
  code?: Code;

  @IsDate()
  updatedAt!: Date;
}
