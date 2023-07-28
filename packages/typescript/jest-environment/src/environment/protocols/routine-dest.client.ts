import axios from 'axios';

import { DestState } from './common.js';
import {
  CreateRoutineDestRequestBody,
  CreateRoutineDestResponse,
  RoutineDestData,
  RoutineDestInfo,
  RoutineDestOptions,
  UpdateRoutineDestStateRequestBody,
} from './routine-dest.types.js';

export class RoutineDestClient {
  constructor(readonly options: RoutineDestOptions) {
    if (Number.isNaN(Number(options.stepId))) {
      throw new Error(`stepId must be a number string, got ${options.stepId}`);
    }
  }

  async createRoutineDest(destInfos: RoutineDestInfo[]): Promise<RoutineDestData[]> {
    const { apiBaseUrl, organizationId, deviceId, stepId } = this.options;
    const url = `${apiBaseUrl}/public/organizations/${organizationId}/devices/${deviceId}/dests`;
    const headers = this.createHeaders();
    const requestBody: CreateRoutineDestRequestBody = {
      stepId: Number(stepId),
      destInfos,
    };
    const response = await axios.post(url, requestBody, { headers });
    const responseBody = CreateRoutineDestResponse.parse(response.data);
    return responseBody.dests;
  }

  async updateRoutineDestState(routineDestId: number, routineDestState: DestState, localTimeStamp: string): Promise<void> {
    const { apiBaseUrl, organizationId, deviceId } = this.options;
    const url = `${apiBaseUrl}/public/organizations/${organizationId}/devices/${deviceId}/dests/${routineDestId}/status`;
    const headers = this.createHeaders();
    const requestBody: UpdateRoutineDestStateRequestBody = {
      destStatus: routineDestState,
      localTimeStamp,
    };
    await axios.patch(url, requestBody, { headers });
  }

  private createHeaders(): Record<string, string> {
    const { hostToken } = this.options;
    return {
      Authorization: `Bearer ${hostToken}`,
    };
  }
}
