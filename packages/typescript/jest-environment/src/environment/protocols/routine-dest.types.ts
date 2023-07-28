import { z } from 'zod';
import { DestInfo, DestState, DestType } from './common.js';

export type RoutineDestInfo = DestInfo;

export interface UpdateRoutineDestStateRequestBody {
  destStatus: DestState;
  localTimeStamp: string;
}

export interface CreateRoutineDestRequestBody {
  stepId: number;
  destInfos: RoutineDestInfo[];
}

export const BaseRoutineDestData = z.object({
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

export const RoutineDestData: z.ZodType<RoutineDestData> = BaseRoutineDestData.extend({
  children: z.lazy(() => RoutineDestData.array()),
});

export const CreateRoutineDestResponse = z.object({
  dests: RoutineDestData.array(),
});

export interface RoutineDestOptions {
  apiBaseUrl: string;
  organizationId: string;
  deviceId: string;
  stepId: string;
  hostToken: string;
}
