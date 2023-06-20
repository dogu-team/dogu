import { app } from 'electron';
import path from 'path';
import { HostPaths } from '@dogu-tech/node';

export const ReactPublicPath = path.resolve(__dirname, '..');
export const ReactPublicIndexPath = `${ReactPublicPath}/index.html`;
export const ReactPublicLogo192Path = `${ReactPublicPath}/logo192.png`;

export const PreloadScriptPath = path.join(__dirname, 'preload.js');

export const DeviceServerMainScriptPath = path.join(__dirname, 'child', 'mains', 'device-server.js');
export const HostAgentMainScriptPath = path.join(__dirname, 'child', 'mains', 'host-agent.js');

export const WritablePath = app.isPackaged ? HostPaths.doguHomePath : HostPaths.workingGeneratedPath;
export const ConfigsPath = HostPaths.configsPath(WritablePath);

export const dotEnvConfigPath = (runType: string): string => path.resolve(ConfigsPath, `${runType === 'production' ? '' : runType}.env`);

export const LogsPath = HostPaths.logsPath(WritablePath);
export const HostAgentLogsPath = path.resolve(LogsPath, 'child/host-agent');
export const DeviceServerLogsPath = path.resolve(LogsPath, 'child/device-server');

export const ThirdPartyPathMap = HostPaths.thirdParty.pathMap({
  appIsPackaged: app.isPackaged,
});
