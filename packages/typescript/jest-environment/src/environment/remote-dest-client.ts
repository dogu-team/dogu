import axios from 'axios';
import { plainToInstance, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, IsUUID, ValidateNested, validateOrReject } from 'class-validator';
import { DefaultRequestTimeout, DestInfo, DestState, DestType } from './common.js';

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

export class RemoteDestData {
  @IsUUID(4)
  remoteDestId!: string;

  @IsUUID(4)
  remoteDeviceJobId!: string;

  @IsString()
  name!: string;

  @IsNumber()
  @Type(() => Number)
  index!: number;

  @IsEnum(DestState)
  state!: DestState;

  @IsEnum(DestType)
  type!: DestType;

  @ValidateNested({ each: true })
  @Type(() => RemoteDestData)
  @IsArray()
  children!: RemoteDestData[];
}

class CreateRemoteDestResponse {
  @ValidateNested({ each: true })
  @Type(() => RemoteDestData)
  @IsArray()
  dests!: RemoteDestData[];
}

interface UpdateRemoteDestStateRequestBody {
  remoteDestState: DestState;
  localTimeStamp: string;
}

export class RemoteDestClient {
  constructor(private readonly options: RemoteDestOptions) {}

  async createRemoteDest(remoteDestInfos: RemoteDestInfo[]): Promise<RemoteDestData[]> {
    const { apiBaseUrl, projectId, remoteDeviceJobId } = this.options;
    const url = `${apiBaseUrl}/projects/${projectId}/remote-device-jobs/${remoteDeviceJobId}/remote-dest`;
    const headers = this.createHeaders();
    const requestBody: CreateRemoteDestRequestBody = {
      remoteDestInfos,
    };
    const response = await axios.post(url, requestBody, { headers, timeout: DefaultRequestTimeout });
    const responseBody = plainToInstance(CreateRemoteDestResponse, response.data, {
      enableCircularCheck: true,
    });
    await validateOrReject(responseBody);
    return responseBody.dests;
  }

  async updateRemoteDestState(remoteDestId: string, remoteDestState: DestState, localTimeStamp: string): Promise<void> {
    const { apiBaseUrl, projectId, remoteDeviceJobId } = this.options;
    const url = `${apiBaseUrl}/projects/${projectId}/remote-device-jobs/${remoteDeviceJobId}/remote-dest/${remoteDestId}/state`;
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
