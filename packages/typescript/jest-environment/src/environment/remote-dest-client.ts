import axios from 'axios';
import { z } from 'zod';

import { createLogger, DefaultRequestTimeout, DestInfo, DestState, DestType } from './common.js';

type RemoteDestInfo = DestInfo;

interface CreateRemoteDestRequestBody {
  remoteDestInfos: RemoteDestInfo[];
}

export interface RemoteDestOptions {
  apiBaseUrl: string;
  projectId: string;
  remoteDeviceJobId: string;
  token: string;
}

const BaseRemoteDestData = z.object({
  remoteDestId: z.string(),
  remoteDeviceJobId: z.string(),
  name: z.string(),
  index: z.number(),
  state: z.nativeEnum(DestState),
  type: z.nativeEnum(DestType),
});

export type RemoteDestData = z.infer<typeof BaseRemoteDestData> & {
  children: RemoteDestData[];
};

const RemoteDestData: z.ZodType<RemoteDestData> = BaseRemoteDestData.extend({
  children: z.lazy(() => RemoteDestData.array()),
});

const CreateRemoteDestResponse = z.object({
  dests: RemoteDestData.array(),
});

interface UpdateRemoteDestStateRequestBody {
  remoteDestState: DestState;
  localTimeStamp: string;
}

export class RemoteDestClient {
  private readonly logger = createLogger('RemoteDestClient');

  constructor(private readonly options: RemoteDestOptions) {}

  async createRemoteDest(remoteDestInfos: RemoteDestInfo[]): Promise<RemoteDestData[]> {
    const { apiBaseUrl, projectId, remoteDeviceJobId } = this.options;
    const url = `${apiBaseUrl}/public/projects/${projectId}/remote-device-jobs/${remoteDeviceJobId}/remote-dests`;
    const headers = this.createHeaders();
    const requestBody: CreateRemoteDestRequestBody = {
      remoteDestInfos,
    };
    const response = await axios.post(url, requestBody, { headers, timeout: DefaultRequestTimeout });
    const responseBody = CreateRemoteDestResponse.parse(response.data);
    return responseBody.dests;
  }

  async updateRemoteDestState(remoteDestId: string, remoteDestState: DestState, localTimeStamp: string): Promise<void> {
    const { apiBaseUrl, projectId, remoteDeviceJobId } = this.options;
    const url = `${apiBaseUrl}/public/projects/${projectId}/remote-device-jobs/${remoteDeviceJobId}/remote-dests/${remoteDestId}/state`;
    const headers = this.createHeaders();
    const requestBody: UpdateRemoteDestStateRequestBody = {
      remoteDestState,
      localTimeStamp,
    };
    await axios.patch(url, requestBody, { headers, timeout: DefaultRequestTimeout });
  }

  private createHeaders(): Record<string, string> {
    const { token } = this.options;
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}
