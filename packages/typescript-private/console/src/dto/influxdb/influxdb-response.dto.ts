import { RuntimeInfo } from '@dogu-private/types';
import { GameRuntimeInfo } from '@dogu-tech/console-gamium';
import { DeviceJobLogInfo } from './type';

export interface RuntimeInfoResponse {
  deviceRuntimeInfos: RuntimeInfo[];
  gameRuntimeInfos: GameRuntimeInfo[];
}

export interface TestLogResponse {
  deviceLogs: DeviceJobLogInfo[];
  hostAgentLogs: DeviceJobLogInfo[];
  userProjectLogs: DeviceJobLogInfo[];
}
