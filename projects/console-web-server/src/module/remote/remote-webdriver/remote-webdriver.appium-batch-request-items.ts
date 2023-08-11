import { transformAndValidate } from '@dogu-tech/common';
import { RelayResponse, SystemBar, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import { RemoteWebDriverBatchRequestExecutor } from './remote-webdriver.batch-request-executor';
import { NullValueResponse, RemoteWebDriverBatchRequestItem } from './remote-webdriver.batch-request-item';

/**
 * @see https://github.com/appium/appium/blob/master/packages/base-driver/docs/mjsonwp/protocol-methods.md
 */
class AppiumIsKeyboardShownResponse {
  @IsBoolean()
  value!: boolean;
}

export class AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<boolean> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'GET',
      sessionId: this.sessionId,
      command: '/appium/device/is_keyboard_shown',
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<boolean> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to get keyboard status. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(AppiumIsKeyboardShownResponse, relayResponse.resBody);
    return validated.value;
  }
}

class AppiumGetContextResponse {
  @IsString()
  value!: string;
}

export class AppiumGetContextRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<string> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'GET',
      sessionId: this.sessionId,
      command: '/context',
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<string> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to get context. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(AppiumGetContextResponse, relayResponse.resBody);
    return validated.value;
  }
}

class AppiumGetContextsResponse {
  @IsString({ each: true })
  value!: string[];
}

export class AppiumGetContextsRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<string[]> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'GET',
      sessionId: this.sessionId,
      command: '/contexts',
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<string[]> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to get contexts. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(AppiumGetContextsResponse, relayResponse.resBody);
    return validated.value;
  }
}

export class AppiumSetContextRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<void> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string, private readonly context: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'POST',
      sessionId: this.sessionId,
      command: '/context',
      reqBody: { name: this.context },
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<void> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to set context. status: ${relayResponse.status}`);
    }

    await transformAndValidate(NullValueResponse, relayResponse.resBody);
  }
}

class AppiumGetSystemBarsResponseValue {
  @ValidateNested()
  @Type(() => SystemBar)
  statusBar!: SystemBar;

  @ValidateNested()
  @Type(() => SystemBar)
  navigationBar!: SystemBar;
}

class AppiumGetSystemBarsResponse {
  @ValidateNested()
  @Type(() => AppiumGetSystemBarsResponseValue)
  value!: AppiumGetSystemBarsResponseValue;
}

export class AppiumGetSystemBarsRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<AppiumGetSystemBarsResponseValue> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'GET',
      sessionId: this.sessionId,
      command: '/appium/device/system_bars',
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<AppiumGetSystemBarsResponseValue> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to get system bars. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(AppiumGetSystemBarsResponse, relayResponse.resBody);
    return validated.value;
  }
}

class AppiumGetDisplayDensityResponse {
  @IsNumber()
  value!: number;
}

export class AppiumGetDisplayDensityRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<number> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'GET',
      sessionId: this.sessionId,
      command: '/appium/device/display_density',
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<number> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to get display density. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(AppiumGetDisplayDensityResponse, relayResponse.resBody);
    return validated.value;
  }
}
