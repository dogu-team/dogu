import { DeviceId, ErrorResultDto, OrganizationId, ProjectId } from '@dogu-private/types';
import { HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, RelayResponse } from '@dogu-tech/device-client-common';
import { RemoteWebDriverBatchRequestItem } from './remote-webdriver.batch-request-items';
import { RemoteWebDriverRequestCommonOptions, RemoteWebDriverService } from './remote-webdriver.service';

export interface RemoteWebDriverBatchRequestExecutorOptions {
  organizationId: OrganizationId;
  projectId: ProjectId;
  deviceId: DeviceId;
  deviceSerial: string;
  headers: HeaderRecord;
  parallel: boolean;
}

export type RemoteWebDriverBatchRequestOptions = RemoteWebDriverRequestCommonOptions & {
  parallel: boolean;
  requests: RelayRequest[];
};

export interface RemoteWebDriverBatchResponseItem {
  error?: ErrorResultDto;
  response?: RelayResponse;
}

export type RemoteWebDriverBatchResponse = RemoteWebDriverBatchResponseItem[];

export class RemoteWebDriverBatchRequestExecutor {
  constructor(private readonly remoteWebDriverService: RemoteWebDriverService, private readonly options: RemoteWebDriverBatchRequestExecutorOptions) {}

  private requestItems: RemoteWebDriverBatchRequestItem[] = [];
  private responseItems: RemoteWebDriverBatchResponseItem[] = [];

  add(item: RemoteWebDriverBatchRequestItem): this {
    const size = this.requestItems.push(item);
    const index = size - 1;
    item.onAdded(() => {
      const responseItem = this.responseItems[index];
      if (!responseItem) {
        throw new Error('Not yet executed');
      }
      return responseItem;
    });
    return this;
  }

  async execute(): Promise<void> {
    const { organizationId, projectId, deviceId, deviceSerial, headers, parallel } = this.options;
    const endpoints = await Promise.all(this.requestItems.map((item) => item.onEndPointFactory()));
    const relayRequests = endpoints.map((endpoint) => endpoint.toRelayRequest());
    const batchResponse = await this.remoteWebDriverService.sendBatchRequest({
      organizationId,
      projectId,
      deviceId,
      deviceSerial,
      headers,
      parallel,
      requests: relayRequests,
    });
    this.responseItems = batchResponse;
  }
}
