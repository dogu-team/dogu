import { ThirdPartyPathMap } from '@dogu-tech/types';
import fs from 'fs';
import lodash from 'lodash';
import os from 'os';
import path from 'path';

export const HostPaths = {
  doguHomePath: process.env.DOGU_HOME || path.resolve(os.homedir(), '.dogu'),
  workingGeneratedPath: path.resolve(process.cwd(), 'generated'),
  tempPath: path.resolve(os.tmpdir(), 'dogu'),
  doguTempPath: (): string => path.resolve(HostPaths.doguHomePath, 'temp'),

  configsPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'configs'),
  logsPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'logs'),
  recordWorkspacePath: (doguHomePath: string): string => path.resolve(doguHomePath, 'records'),
  recordSerialPath: (recordWorkspacePath: string, serial: string): string => path.resolve(recordWorkspacePath, serial),
  externalsPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'externals'),
  downloadsPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'downloads'),
  organizationWorkspacePath: (doguHomePath: string, organizationId: string): string => path.resolve(doguHomePath, 'organizations', organizationId),
  hostWorkspacePath: (organizationWorkspacePath: string, hostId: string): string => path.resolve(organizationWorkspacePath, 'hosts', hostId),
  hostSharesPath: (hostWorkspacePath: string): string => path.resolve(hostWorkspacePath, 'shares'),
  deviceWorkspacePath: (organizationWorkspacePath: string, deviceId: string): string => path.resolve(organizationWorkspacePath, 'devices', deviceId),
  deviceProjectWorkspacePath: (deviceWorkspacePath: string, projectId: string): string => path.resolve(deviceWorkspacePath, 'projects', projectId),
  deviceProjectGitPath: (deviceProjectWorkspacePath: string): string => path.resolve(deviceProjectWorkspacePath, 'git'),
  deviceActionWorkspacePath: (deviceWorkspacePath: string): string => path.resolve(deviceWorkspacePath, 'actions'),
  deviceActionGitPath: (deviceWorkspacePath: string, actionId: string): string => path.resolve(deviceWorkspacePath, 'actions', actionId.replaceAll('@', '-').replaceAll(':', '-')),
  actionSourcePath: (doguWorkspacePath: string, actionId: string): string => path.resolve(doguWorkspacePath, actionId),
  idaRunspacesPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'ida-runspaces'),

  android: {
    platformToolsPath: (androidHomePath: string): string => path.resolve(androidHomePath, 'platform-tools'),
    adbPath: (androidHomePath: string): string => path.resolve(HostPaths.android.platformToolsPath(androidHomePath), process.platform === 'win32' ? 'adb.exe' : 'adb'),
    cmdlineToolsPath: (androidHomePath: string): string => path.resolve(androidHomePath, 'cmdline-tools', 'latest'),
    sdkmanagerPath: (androidHomePath: string): string =>
      path.resolve(HostPaths.android.cmdlineToolsPath(androidHomePath), 'bin', process.platform === 'win32' ? 'sdkmanager.bat' : 'sdkmanager'),
    buildToolsPath: (androidHomePath: string): string => path.resolve(androidHomePath, 'build-tools'),
    buildToolsVersionPath: (androidHomePath: string, version: string): string => path.resolve(HostPaths.android.buildToolsPath(androidHomePath), version),
  },

  java: {
    javaPath: (javaHomePath: string): string => path.resolve(javaHomePath, 'bin', process.platform === 'win32' ? 'java.exe' : 'java'),
  },

  thirdParty: {
    pathMap: (options?: ThirdPartyPathMapOptions): ThirdPartyPathMap => createThirdPartyPathMap(options),
  },

  external: {
    externalsPath: (): string => path.resolve(HostPaths.doguHomePath, 'externals'),
    defaultAndroidHomePath: (): string => path.resolve(HostPaths.external.externalsPath(), 'android'),
    defaultJavaHomePath: (): string => path.resolve(HostPaths.external.externalsPath(), 'java'),
    defaultAppiumHomePath: (): string => path.resolve(HostPaths.external.externalsPath(), 'appium'),
    nodePackage: {
      nodePackagesPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'node-packages'),
      appiumPath: (): string => path.resolve(HostPaths.external.nodePackage.nodePackagesPath(), 'appium'),
      webdriverManager: {
        prototypePath: (): string => path.resolve(HostPaths.external.nodePackage.nodePackagesPath(), 'webdriver-manager', 'prototype'),
        clonePath: (cloneId: string): string => path.resolve(HostPaths.external.nodePackage.nodePackagesPath(), 'webdriver-manager', 'clones', cloneId),
      },
      puppeteerBrowsersPath: (): string => path.resolve(HostPaths.external.nodePackage.nodePackagesPath(), 'puppeteer-browsers'),
    },
    xcodeProject: {
      wdaProjectDirectoryPath: (): string => path.resolve(HostPaths.external.defaultAppiumHomePath(), 'node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent'),
      wdaDerivedDataPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'web-driver-agent/build'),
      wdaDerivedDataClonePath: (): string => path.resolve(HostPaths.external.externalsPath(), 'web-driver-agent/build-clone'),
      idaProjectDirectoryPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'ios-device-agent/project'),
      idaDerivedDataPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'ios-device-agent/build'),
      idaDerivedDataClonePath: (): string => path.resolve(HostPaths.external.externalsPath(), 'ios-device-agent/build-clone'),
    },
    libimobiledevice: {
      libimobiledeviceLibPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice/lib'),
      idevicediagnostics: (): string => path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice/idevicediagnostics'),
      idevicesyslog: (): string => path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice/idevicesyslog'),
    },
    browser: {
      browsersPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'browsers'),
    },

    /**
     * @note use to avoid appium xcodebuild process cleanup patterns.
     */
    xcodebuildSymlinkPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'xcb'),
  },
};

export function parseEnv_DOGU_PACKAGED_RESOURCES_PATH(): string {
  return process.env.DOGU_PACKAGED_RESOURCES_PATH || '';
}

export function appIsPackaged(): boolean {
  return parseEnv_DOGU_PACKAGED_RESOURCES_PATH() !== '';
}

export interface ThirdPartyPathMapOptions {
  /**
   * depth of search
   * @default 4
   * @description search depth from current working directory to root directory
   */
  depth?: number;

  /**
   * @default process.env.DOGU_PACKAGED_RESOURCES_PATH || ''
   * @description if exists, search from resourcesPath
   * @see https://www.electronjs.org/docs/latest/api/process#processresourcespath-readonly
   */
  resourcesPath?: string;
}

function defaultThirdPartyPathMapOptions(): Required<ThirdPartyPathMapOptions> {
  return {
    depth: 4,
    resourcesPath: parseEnv_DOGU_PACKAGED_RESOURCES_PATH(),
  };
}

function findThirdPartyPath(options?: ThirdPartyPathMapOptions): string {
  const { depth, resourcesPath } = lodash.merge(defaultThirdPartyPathMapOptions(), options);
  if (resourcesPath) {
    return path.resolve(resourcesPath, 'third-party');
  } else {
    let current = process.cwd();
    for (let i = 0; i < depth; i++) {
      const thirdPartyPath = path.resolve(current, 'third-party');
      if (fs.existsSync(thirdPartyPath)) {
        return thirdPartyPath;
      }
      const next = path.resolve(current, '..');
      if (next === current) {
        break;
      }
      current = next;
    }
    throw new Error(`third-party not found in ${process.cwd()} with depth ${depth}`);
  }
}

function createThirdPartyPathMap(options?: ThirdPartyPathMapOptions): ThirdPartyPathMap {
  const thirdPartyPath = findThirdPartyPath(options);
  const platformDir = appIsPackaged() ? '' : process.platform;
  const platformCommonDir = appIsPackaged() ? '' : 'common';
  const archDir = appIsPackaged() ? '' : process.arch;
  const archCommonDir = appIsPackaged() ? '' : 'common';
  const exeExtension = process.platform === 'win32' ? '.exe' : '';
  const cmdExtension = process.platform === 'win32' ? '.cmd' : '';
  const gitBinDir = process.platform === 'win32' ? 'cmd' : 'bin';
  const gitLibexecParentDir = process.platform === 'win32' ? 'mingw64' : '';
  const nodeBinDir = process.platform === 'win32' ? '' : 'bin';
  return {
    common: {
      androidDeviceAgent: path.resolve(thirdPartyPath, platformCommonDir, 'android_deviceagent.txt'),
      adbJoinWifiApk: path.resolve(thirdPartyPath, platformCommonDir, `adb-join-wifi.apk`),
      goDeviceController: path.resolve(thirdPartyPath, platformDir, archDir, `go-device-controller${exeExtension}`),
      git: path.resolve(thirdPartyPath, platformDir, archDir, 'git', gitBinDir, `git${exeExtension}`),
      gitLibexecGitCore: path.resolve(thirdPartyPath, platformDir, archDir, 'git', gitLibexecParentDir, 'libexec', 'git-core'),
      node16: path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `node${exeExtension}`),
      nodeBin: path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir),
      yarn: path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `yarn${cmdExtension}`),
      pnpm: path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `pnpm${cmdExtension}`),
      npm: path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `npm${cmdExtension}`),
      npx: path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `npx${cmdExtension}`),
      ffmpeg: path.resolve(thirdPartyPath, platformDir, archCommonDir, `ffmpeg${exeExtension}`),
    },
    macos: {
      iosDeviceAgentProject: process.platform === 'darwin' ? path.resolve(thirdPartyPath, platformDir, archCommonDir, 'ios-device-agent') : '',
      mobiledevice: process.platform === 'darwin' ? path.resolve(thirdPartyPath, platformDir, archDir, 'mobiledevice') : '',
    },
  };
}
