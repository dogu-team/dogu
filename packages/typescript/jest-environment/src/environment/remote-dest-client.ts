import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { DestType } from './protocols.js';

interface RemoteDestInfo {
  name: string;
  type: DestType;
}

interface CreateRemoteDestRequestBody {
  remoteDestInfos: RemoteDestInfo[];
}

interface RemoteDestOptions {
  apiBaseUrl: string;
  projectId: string;
  remoteDeviceJobId: string;
  token: string;
}

class CreateRemoteDestResponse {}

export class RemoteDestClient {
  constructor(private readonly options: RemoteDestOptions) {}

  async createRemoteDest(remoteDestInfos: RemoteDestInfo[]): Promie<RemoteDestData[]> {
    const { apiBaseUrl, projectId, remoteDeviceJobId, token } = this.options;
    const url = `${apiBaseUrl}/projects/${projectId}/remote-device-jobs/${remoteDeviceJobId}/remote-dest`;
    const headers = this.createHeaders();
    const requestBody: CreateRemoteDestRequestBody = {
      remoteDestInfos,
    };
    const response = await axios.post(url, requestBody, { headers, timeout: DefaultTimeout });
    const responseBody = plainToInstance(CreateRemoteDestResponse, response.data, {
      enableCircularCheck: true,
    });
    await validateOrReject(responseBody);
    return responseBody.dests;
  }

  private createHeaders(): Record<string, string> {
    const { token } = this.options;
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}
