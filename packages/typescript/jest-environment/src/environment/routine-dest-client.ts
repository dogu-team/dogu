import axios from 'axios';
import { z } from 'zod';

import { DefaultRequestTimeout, DestInfo, DestState, DestType } from './common.js';

export type RoutineDestInfo = DestInfo;

interface UpdateRoutineDestStateRequestBody {
  destStatus: DestState;
  localTimeStamp: string;
}

interface CreateRoutineDestRequestBody {
  stepId: number;
  destInfos: RoutineDestInfo[];
}

const BaseRoutineDestData = z.object({
  destId: z.number(),
  routineStepId: z.number(),
  name: z.string(),
  index: z.number(),
  state: z.nativeEnum(DestState),
  type: z.nativeEnum(DestType),
});

export type RoutineDestData = z.infer<typeof BaseRoutineDestData> & {
  children: RoutineDestData[];
};

const RoutineDestData: z.ZodType<RoutineDestData> = BaseRoutineDestData.extend({
  children: z.lazy(() => RoutineDestData.array()),
});

const CreateRoutineDestResponse = z.object({
  dests: RoutineDestData.array(),
});

export interface RoutineDestOptions {
  apiBaseUrl: string;
  organizationId: string;
  deviceId: string;
  stepId: string;
  hostToken: string;
}

export class RoutineDestClient {
  constructor(readonly options: RoutineDestOptions) {}

  async createRoutineDest(destInfos: RoutineDestInfo[]): Promise<RoutineDestData[]> {
    const { apiBaseUrl, organizationId, deviceId, stepId } = this.options;
    const url = `${apiBaseUrl}/public/organizations/${organizationId}/devices/${deviceId}/dests`;
    const headers = this.createHeaders();
    const requestBody: CreateRoutineDestRequestBody = {
      stepId: Number(stepId),
      destInfos,
    };
    const response = await axios.post(url, requestBody, { headers, timeout: DefaultRequestTimeout });
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
    await axios.patch(url, requestBody, { headers, timeout: DefaultRequestTimeout });
  }

  private createHeaders(): Record<string, string> {
    const { hostToken } = this.options;
    return {
      Authorization: `Bearer ${hostToken}`,
    };
  }
}
