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

/**
 * @note henry: The external tools or libraries can be related to the host machine settings, and is not related to the development flag, run type, so install it in $HOME/.dogu/externals
 */
export const ExternalsPath = HostPaths.externalsPath(HostPaths.doguHomePath);
export const DefaultAndroidHomePath = path.resolve(ExternalsPath, 'android');
export const DefaultJavaHomePath = path.resolve(ExternalsPath, 'java');
export const DefaultAppiumHomePath = path.resolve(ExternalsPath, 'appium');

export const LogsPath = HostPaths.logsPath(WritablePath);
export const HostAgentLogsPath = path.resolve(LogsPath, 'child/host-agent');
export const DeviceServerLogsPath = path.resolve(LogsPath, 'child/device-server');

export const ThirdPartyPathMap = HostPaths.thirdParty.pathMap({
  appIsPackaged: app.isPackaged,
});
