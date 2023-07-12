import { CreateRemoteWebDriverInfoSessionDtoBase, UpdateRemoteWebDriverInfoSessionDtoBase } from '@dogu-private/console';
import { WebDriverSessionId } from '@dogu-private/types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRemoteWebDriverInfoSessionDto implements CreateRemoteWebDriverInfoSessionDtoBase {
  @IsNotEmpty()
  @IsString()
  sessionId!: WebDriverSessionId;
}

export class UpdateRemoteWebDriverInfoSessionDto implements UpdateRemoteWebDriverInfoSessionDtoBase {
  @IsNotEmpty()
  @IsString()
  sessionId!: WebDriverSessionId;
}
