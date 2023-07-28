import { z } from 'zod';

import { DestInfo, DestState, DestType } from './common.js';

export type RemoteDestInfo = DestInfo;

export interface CreateRemoteDestRequestBody {
  remoteDestInfos: RemoteDestInfo[];
}

export interface RemoteDestOptions {
  apiBaseUrl: string;
  projectId: string;
  remoteDeviceJobId: string;
  token: string;
}

export const BaseRemoteJestData = z.object({
  remoteDestId: z.string(),
  remoteDeviceJobId: z.string(),
  name: z.string(),
  index: z.number(),
  state: z.nativeEnum(DestState),
  type: z.nativeEnum(DestType),
});

export type RemoteJestData = z.infer<typeof BaseRemoteJestData> & {
  children: RemoteJestData[];
};

export const RemoteJestData: z.ZodType<RemoteJestData> = BaseRemoteJestData.extend({
  children: z.lazy(() => RemoteJestData.array()),
});

export const CreateRemoteDestResponse = z.object({
  dests: RemoteJestData.array(),
});

export interface UpdateRemoteDestStateRequestBody {
  remoteDestState: DestState;
  localTimeStamp: string;
}
