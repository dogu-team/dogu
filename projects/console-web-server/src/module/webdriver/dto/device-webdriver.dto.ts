import { CreateDeviceWebDriverSessionDtoBase, UpdateDeviceWebDriverSessionDtoBase } from '@dogu-private/console';
import { WebDriverSessionId } from '@dogu-private/types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDeviceWebDriverSessionDto implements CreateDeviceWebDriverSessionDtoBase {
  @IsNotEmpty()
  @IsString()
  sessionId!: WebDriverSessionId;
}

export class UpdateDeviceWebDriverSessionDto implements UpdateDeviceWebDriverSessionDtoBase {
  @IsNotEmpty()
  @IsString()
  sessionId!: WebDriverSessionId;
}
