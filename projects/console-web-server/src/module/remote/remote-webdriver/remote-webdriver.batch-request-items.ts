import { ErrorResultError } from '@dogu-private/types';
import { IsFilledString, transformAndValidate } from '@dogu-tech/common';
import { RelayResponse, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { IsBoolean } from 'class-validator';
import { RemoteWebDriverBatchResponseItem } from './remote-webdriver.batch-request-executor';

type GetResponseItem = () => RemoteWebDriverBatchResponseItem;

export abstract class RemoteWebDriverBatchRequestItem<R = any> {
  private getResponseItem?: GetResponseItem;

  onAdded(getResponseItem: GetResponseItem): void {
    if (this.getResponseItem) {
      throw new Error('Item is already added to batch executor');
    }
    this.getResponseItem = getResponseItem;
  }

  response: () => Promise<R> = () => {
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
  };

  abstract onEndPointFactory(): Promise<WebDriverEndPoint>;
  abstract onResponseCalled(relayResponse: RelayResponse): Promise<R>;
}

class TakeScreenshotResponse {
  @IsFilledString()
  value!: string;
}

export class TakeScreenshotRemoteWebDriverBatchRequestItem extends RemoteWebDriverBatchRequestItem<Buffer> {
  constructor(private readonly sessionId: string) {
    super();
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
  constructor(private readonly sessionId: string) {
    super();
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
  constructor(private readonly sessionId: string) {
    super();
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
