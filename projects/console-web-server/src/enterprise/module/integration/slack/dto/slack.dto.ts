import { ConnectSlackDtoBase } from '@dogu-private/console';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectSlackDto implements ConnectSlackDtoBase {
  @IsNotEmpty()
  @IsString()
  organizationId!: string;

  @IsNotEmpty()
  @IsString()
  authedUserId!: string;

  @IsNotEmpty()
  @IsString()
  scope!: string;

  @IsNotEmpty()
  @IsString()
  accessToken!: string;

  @IsNotEmpty()
  @IsString()
  botUserId!: string;

  @IsNotEmpty()
  @IsString()
  teamId!: string;

  @IsNotEmpty()
  @IsString()
  teamName!: string;
}
