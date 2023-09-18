import path from 'path';
import { HostPaths } from '@dogu-tech/node';

export const DeviceServerMainScriptPath = path.join(__dirname, 'child', 'mains', 'device-server.js');
export const HostAgentMainScriptPath = path.join(__dirname, 'child', 'mains', 'host-agent.js');

export const WritablePath = HostPaths.doguHomePath;
export const ConfigsPath = HostPaths.configsPath(WritablePath);

export const dotEnvConfigPath = (runType: string): string => path.resolve(ConfigsPath, `${runType === 'production' ? '' : runType}.env`);

export const LogsPath = HostPaths.logsPath(WritablePath);
export const HostAgentLogsPath = path.resolve(LogsPath, 'child/host-agent');
export const DeviceServerLogsPath = path.resolve(LogsPath, 'child/device-server');

export const ThirdPartyPathMap = HostPaths.thirdParty.pathMap({
  resourcesPath: process.env.DOGU_PACKAGED_RESOURCES_PATH || '',
});
