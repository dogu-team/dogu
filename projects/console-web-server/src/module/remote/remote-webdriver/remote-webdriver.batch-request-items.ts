import { ErrorResultError } from '@dogu-private/types';
import { IsFilledString, transformAndValidate } from '@dogu-tech/common';
import { RelayResponse, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { Type } from 'class-transformer';
import { Equals, IsBoolean, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { RemoteWebDriverBatchRequestExecutor, RemoteWebDriverBatchResponseItem } from './remote-webdriver.batch-request-executor';

type GetResponseItem = () => RemoteWebDriverBatchResponseItem;

export abstract class RemoteWebDriverBatchRequestItem<R = any> {
  private getResponseItem?: GetResponseItem;

  constructor(executor: RemoteWebDriverBatchRequestExecutor) {
    executor.add(this);
  }

  onAdded(getResponseItem: GetResponseItem): void {
    if (this.getResponseItem) {
      throw new Error('Item is already added to batch executor');
    }
    this.getResponseItem = getResponseItem;
  }

  async response(): Promise<R> {
    if (!this.getResponseItem) {
      throw new Error('Item is not added to batch executor');
    }
    const responseItem = this.getResponseItem();
    if (responseItem.error) {
      const { error } = responseItem;
      const { code, message, details } = error;
      throw new ErrorResultError(code, message, details);
    } else if (responseItem.response) {
      return this.onResponseCalled(responseItem.response);
    } else {
      throw new Error('Response item must have error or response');
    }
  }

  abstract onEndPointFactory(): Promise<WebDriverEndPoint>;
  abstract onResponseCalled(relayResponse: RelayResponse): Promise<R>;
}

class NullValueResponse {
  @Equals(null)
  value!: null;
}

class TakeScreenshotResponse {
  @IsFilledString()
  value!: string;
}

export class TakeScreenshotRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<Buffer> {
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

export class GetPageSourceRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<string> {
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

class FindElementResponseValue {
  @IsFilledString()
  ELEMENT!: string;
}

class FindElementResponse {
  @ValidateNested()
  @Type(() => FindElementResponseValue)
  value!: FindElementResponseValue;
}

export class FindElementRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<string> {
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

export class ElementClickRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<void> {
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

export class ElementSendKeysRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<void> {
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

export class PerformActionsRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<void> {
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

export class GetTimeoutsRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<GetTimeoutsResponse> {
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
