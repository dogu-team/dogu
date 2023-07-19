import axios from 'axios';
import { plainToInstance, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, ValidateNested, validateOrReject } from 'class-validator';
import { DefaultRequestTimeout, DestState, DestType } from './protocols.js';

export interface RoutineDestInfo {
  name: string;
  type: DestType;
  children: RoutineDestInfo[];
}

interface UpdateRoutineDestStateRequestBody {
  destStatus: DestState;
  localTimeStamp: string;
}

interface CreateRoutineDestRequestBody {
  stepId: number;
  destInfos: RoutineDestInfo[];
}

export class RoutineDestData {
  @IsNumber()
  @Type(() => Number)
  destId!: number;

  @IsNumber()
  @Type(() => Number)
  routineStepId!: number;

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
  @Type(() => RoutineDestData)
  @IsArray()
  children!: RoutineDestData[];
}

export class CreateRoutineDestResponse {
  @ValidateNested({ each: true })
  @Type(() => RoutineDestData)
  @IsArray()
  dests!: RoutineDestData[];
}

export interface RoutineDestOptions {
  apiBaseUrl: string;
  organizationId: string;
  deviceId: string;
  stepId: string;
  hostToken: string;
}

export class RoutineDestClient {
  constructor(readonly options: RoutineDestOptions) {}

  async createDest(destInfos: RoutineDestInfo[]): Promise<RoutineDestData[]> {
    const { apiBaseUrl, organizationId, deviceId, stepId } = this.options;
    const url = `${apiBaseUrl}/public/organizations/${organizationId}/devices/${deviceId}/dests`;
    const headers = this.createHeaders();
    const requestBody: CreateRoutineDestRequestBody = {
      stepId: Number(stepId),
      destInfos,
    };
    const response = await axios.post(url, requestBody, { headers, timeout: DefaultRequestTimeout });
    const responseBody = plainToInstance(CreateRoutineDestResponse, response.data, {
      enableCircularCheck: true,
    });
    await validateOrReject(responseBody);
    return responseBody.dests;
  }

  async updateDestStatus(destId: number, destStatus: DestState, localTimeStamp: string): Promise<void> {
    const { apiBaseUrl, organizationId, deviceId } = this.options;
    const url = `${apiBaseUrl}/public/organizations/${organizationId}/devices/${deviceId}/dests/${destId}/status`;
    const headers = this.createHeaders();
    const requestBody: UpdateRoutineDestStateRequestBody = {
      destStatus,
      localTimeStamp,
    };
    await axios.patch(url, requestBody, { headers, timeout: DefaultRequestTimeout });
  }

  private createHeaders(): Record<string, string> {
    const { hostToken } = this.options;
    return {
      Authorization: `Bearer ${hostToken}`,
    };
  }
}
