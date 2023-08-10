import { IsFilledString, transformAndValidate } from '@dogu-tech/common';
import { RelayResponse, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { RemoteWebDriverBatchRequestExecutor } from './remote-webdriver.batch-request-executor';
import { NullValueResponse, RemoteWebDriverBatchRequestItem } from './remote-webdriver.batch-request-item';

class TakeScreenshotResponse {
  @IsFilledString()
  value!: string;
}

/**
 * @see https://w3c.github.io/webdriver/#take-screenshot
 */
export class W3CTakeScreenshotRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<Buffer> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'GET',
      sessionId: this.sessionId,
      command: '/screenshot',
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<Buffer> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to take screenshot. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(TakeScreenshotResponse, relayResponse.resBody);
    return Buffer.from(validated.value, 'base64');
  }
}

class GetPageSourceResponse {
  @IsFilledString()
  value!: string;
}

/**
 * @see https://w3c.github.io/webdriver/#get-page-source
 */
export class W3CGetPageSourceRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<string> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'GET',
      sessionId: this.sessionId,
      command: '/source',
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<string> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to get page source. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(GetPageSourceResponse, relayResponse.resBody);
    return validated.value;
  }
}

class FindElementResponseValue {
  @IsFilledString()
  ELEMENT!: string;
}

class FindElementResponse {
  @ValidateNested()
  @Type(() => FindElementResponseValue)
  value!: FindElementResponseValue;
}

/**
 * @see https://w3c.github.io/webdriver/#find-element
 */
export class W3CFindElementRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<string> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string, private readonly using: string, private readonly value: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'POST',
      sessionId: this.sessionId,
      command: '/element',
      reqBody: {
        using: this.using,
        value: this.value,
      },
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<string> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to find element. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(FindElementResponse, relayResponse.resBody);
    return validated.value.ELEMENT;
  }
}

/**
 * @see https://w3c.github.io/webdriver/#element-click
 */
export class W3CElementClickRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<void> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string, private readonly elementId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'POST',
      sessionId: this.sessionId,
      command: `/element/${this.elementId}/click`,
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<void> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to click element. status: ${relayResponse.status}`);
    }
    await transformAndValidate(NullValueResponse, relayResponse.resBody);
  }
}

/**
 * @see https://w3c.github.io/webdriver/#element-send-keys
 */
export class W3CElementSendKeysRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<void> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string, private readonly elementId: string, private readonly text: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'POST',
      sessionId: this.sessionId,
      command: `/element/${this.elementId}/value`,
      reqBody: {
        text: this.text,
      },
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<void> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to send keys to element. status: ${relayResponse.status}`);
    }
    await transformAndValidate(NullValueResponse, relayResponse.resBody);
  }
}

/**
 * @see https://w3c.github.io/webdriver/#perform-actions
 */
export class W3CPerformActionsRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<void> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string, private readonly actions: object[]) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'POST',
      sessionId: this.sessionId,
      command: '/actions',
      reqBody: {
        actions: this.actions,
      },
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<void> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to perform actions. status: ${relayResponse.status}`);
    }
    await transformAndValidate(NullValueResponse, relayResponse.resBody);
  }
}

export class GetTimeoutsResponseValue {
  @IsNumber()
  implicit!: number;

  /**
   * @description selenium only
   */
  @IsNumber()
  @IsOptional()
  pageLoad?: number;

  /**
   * @description selenium only
   */
  @IsNumber()
  @IsOptional()
  script?: number;

  /**
   * @description appium only
   */
  @IsNumber()
  @IsOptional()
  command?: number;
}

export class GetTimeoutsResponse {
  @ValidateNested()
  @Type(() => GetTimeoutsResponseValue)
  value!: GetTimeoutsResponseValue;
}

/**
 * @see https://w3c.github.io/webdriver/#get-timeouts
 */
export class W3CGetTimeoutsRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<GetTimeoutsResponse> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'GET',
      sessionId: this.sessionId,
      command: '/timeouts',
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<GetTimeoutsResponse> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to get timeouts. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(GetTimeoutsResponse, relayResponse.resBody);
    return validated;
  }
}

/**
 * @see https://w3c.github.io/webdriver/#dfn-navigate-to
 */
export class W3CNavigateToRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<void> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string, private readonly url: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'POST',
      sessionId: this.sessionId,
      command: '/url',
      reqBody: {
        url: this.url,
      },
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<void> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to navigate to. status: ${relayResponse.status}`);
    }
    await transformAndValidate(NullValueResponse, relayResponse.resBody);
  }
}

export class GetWindowRectResponseValue {
  @IsNumber()
  width!: number;

  @IsNumber()
  height!: number;
}

export class GetWindowRectResponse {
  @ValidateNested()
  @Type(() => GetTimeoutsResponseValue)
  value!: GetWindowRectResponseValue;
}

/**
 * @see https://w3c.github.io/webdriver/#get-window-rect
 */
export class W3CGetWindowRectRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<GetWindowRectResponse> {
  constructor(executor: RemoteWebDriverBatchRequestExecutor, private readonly sessionId: string) {
    super(executor);
  }

  async onEndPointFactory(): Promise<WebDriverEndPoint> {
    return new WebDriverEndPoint({
      type: 'session',
      method: 'GET',
      sessionId: this.sessionId,
      command: '/window/rect',
    });
  }

  async onResponseCalled(relayResponse: RelayResponse): Promise<GetWindowRectResponse> {
    if (relayResponse.status !== 200) {
      throw new Error(`Failed to get window rect. status: ${relayResponse.status}`);
    }
    const validated = await transformAndValidate(GetWindowRectResponse, relayResponse.resBody);
    return validated;
  }
}
