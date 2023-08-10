import { ErrorResultError } from '@dogu-private/types';
import { RelayResponse, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { Equals } from 'class-validator';
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

export class NullValueResponse {
  @Equals(null)
  value!: null;
}
