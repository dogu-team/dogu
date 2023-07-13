import { Platform, Serial } from '@dogu-private/types';
import { RelayRequest, RelayResponse, SessionDeletedParam } from '@dogu-tech/device-client-common';
import { DeviceWebDriverHandler } from './device-webdriver-handler.types';
import { SeleniumDeviceWebDriverHandlerService } from './selenium-device-webdriver-handler.service';

export class SeleniumDeviceWebDriverHandler implements DeviceWebDriverHandler {
  constructor(private readonly service: SeleniumDeviceWebDriverHandlerService, private readonly platform: Platform, private readonly serial: Serial) {}

  onRelayHttp(request: RelayRequest): Promise<RelayResponse> {
    throw new Error('Method not implemented.');
  }

  onSessionDeleted(param: SessionDeletedParam): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
