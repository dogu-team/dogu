import { HostPaths } from '@dogu-tech/node';
import { app } from 'electron';
import path from 'path';

export const ReactPublicPath = path.resolve(__dirname, '..');
export const ReactPublicIndexPath = `${ReactPublicPath}/index.html`;
export const ReactPublicLogo192Path = `${ReactPublicPath}/logo192.png`;

export const PreloadScriptPath = path.join(__dirname, 'preload.js');

export const WritablePath = app.isPackaged ? HostPaths.doguHomePath : HostPaths.workingGeneratedPath;
export const ConfigsPath = HostPaths.configsPath(WritablePath);
export const LogsPath = HostPaths.logsPath(WritablePath);

export const ThirdPartyPathMap = HostPaths.thirdParty.pathMap({
  resourcesPath: process.env.DOGU_PACKAGED_RESOURCES_PATH || '',
});
