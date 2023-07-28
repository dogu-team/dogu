import axios from 'axios';

import { createLogger } from '../common-utils.js';
import { DestState } from './common.js';
import { CreateRemoteDestRequestBody, CreateRemoteDestResponse, RemoteDestInfo, RemoteDestOptions, RemoteJestData, UpdateRemoteDestStateRequestBody } from './remote-dest.types.js';

export class RemoteDestClient {
  private readonly logger = createLogger('RemoteDestClient');

  constructor(private readonly options: RemoteDestOptions) {}

  async createRemoteDest(remoteDestInfos: RemoteDestInfo[]): Promise<RemoteJestData[]> {
    const { apiBaseUrl, projectId, remoteDeviceJobId } = this.options;
    const url = `${apiBaseUrl}/public/projects/${projectId}/remote-device-jobs/${remoteDeviceJobId}/remote-dests`;
    const headers = this.createHeaders();
    const requestBody: CreateRemoteDestRequestBody = {
      remoteDestInfos,
    };
    const response = await axios.post(url, requestBody, { headers });
    const responseBody = CreateRemoteDestResponse.parse(response.data);
    this.logger.info(`create dest`, {
      dests: responseBody.dests,
    });
    return responseBody.dests;
  }

  async updateRemoteDestState(remoteDestId: string, remoteDestState: DestState, localTimeStamp: string): Promise<void> {
    this.logger.info(`update dest`, {
      remoteDestId,
      remoteDestState,
      localTimeStamp,
    });
    const { apiBaseUrl, projectId, remoteDeviceJobId } = this.options;
    const url = `${apiBaseUrl}/public/projects/${projectId}/remote-device-jobs/${remoteDeviceJobId}/remote-dests/${remoteDestId}/state`;
    const headers = this.createHeaders();
    const requestBody: UpdateRemoteDestStateRequestBody = {
      remoteDestState,
      localTimeStamp,
    };
    await axios.patch(url, requestBody, { headers });
  }

  private createHeaders(): Record<string, string> {
    const { token } = this.options;
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}
