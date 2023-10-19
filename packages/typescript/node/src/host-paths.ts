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
  dotenvConfigPath: (configsPath: string, runType: string): string => path.resolve(configsPath, `${runType === 'production' ? '' : runType}.env`),
  resignProvisoningProfilePath: (configsPath: string): string => path.resolve(configsPath, 'resign.mobileprovision'),

  logsPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'logs'),
  deviceServerLogsPath: (logsPath: string): string => path.resolve(logsPath, 'child/device-server'),
  hostAgentLogsPath: (logsPath: string): string => path.resolve(logsPath, 'child/host-agent'),

  recordWorkspacePath: (doguHomePath: string): string => path.resolve(doguHomePath, 'records'),
  recordDeviceRunnerPath: (recordWorkspacePath: string, deviceRunnerId: string): string => path.resolve(recordWorkspacePath, deviceRunnerId),
  externalsPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'externals'),
  downloadsPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'downloads'),
  organizationWorkspacePath: (doguHomePath: string, organizationId: string): string => path.resolve(doguHomePath, 'organizations', organizationId),
  routinesPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'routines'),
  hostWorkspacePath: (organizationWorkspacePath: string, hostId: string): string => path.resolve(organizationWorkspacePath, 'hosts', hostId),
  hostSharesPath: (hostWorkspacePath: string): string => path.resolve(hostWorkspacePath, 'shares'),
  deviceWorkspacePath: (organizationWorkspacePath: string, deviceId: string): string => path.resolve(organizationWorkspacePath, 'devices', deviceId),
  deviceActionWorkspacePath: (deviceWorkspacePath: string): string => path.resolve(deviceWorkspacePath, 'actions'),
  deviceActionGitPath: (workspacePath: string, actionId: string): string => path.resolve(workspacePath, 'actions', actionId.replaceAll('@', '-').replaceAll(':', '-')),
  actionSourcePath: (doguWorkspacePath: string, actionId: string): string => path.resolve(doguWorkspacePath, actionId),
  idaRunspacesPath: (doguHomePath: string): string => path.resolve(doguHomePath, 'ida-runspaces'),
  deviceRunnerWorkspacePath: (doguHomePath: string, deviceRunnerId: string): string => path.resolve(doguHomePath, 'device-runners', deviceRunnerId),

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
    binPath: (javaHomePath: string): string => path.resolve(javaHomePath, 'bin'),
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
    },
    xcodeProject: {
      wdaProjectDirectoryPath: (): string => path.resolve(HostPaths.external.defaultAppiumHomePath(), 'node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent'),
      wdaDerivedDataPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'web-driver-agent/build'),
      wdaDerivedDataClonePath: (): string => path.resolve(HostPaths.external.externalsPath(), 'web-driver-agent/build-clone'),
      idaRootDirectoryPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'ios-device-agent'),
      idaProjectDirectoryPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'ios-device-agent/project'),
      idaDerivedDataPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'ios-device-agent/build'),
      idaDerivedDataClonePath: (): string => path.resolve(HostPaths.external.externalsPath(), 'ios-device-agent/build-clone'),
    },
    libimobiledevice: {
      libimobiledeviceLibPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice/lib'),
      idevicediagnostics: (): string => path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice/idevicediagnostics'),
      idevicesyslog: (): string => path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice/idevicesyslog'),
      ideviceinstaller: (): string => path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice/ideviceinstaller'),
      version: (): string => path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice/version'),
    },
    browser: {
      browsersPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'browsers'),
      safariBrowserPath: (): string => path.resolve('/Applications/Safari.app/Contents/MacOS/Safari'),
      safaridriverPath: (): string => (process.platform === 'darwin' ? path.resolve('/usr/bin/safaridriver') : ''),
    },
    selenium: {
      seleniumServerPath: (): string => path.resolve(HostPaths.external.externalsPath(), 'selenium/selenium-server.jar'),
    },

    preInstall: {
      gboard: {
        apk: (): string => path.resolve(HostPaths.external.externalsPath(), 'preinstall/Gboard.apk'),
      },
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
      desktopCapturer: path.resolve(thirdPartyPath, platformDir, archDir, `desktop-capturer${exeExtension}`),
      git: process.platform === 'linux' ? '/usr/bin/git' : path.resolve(thirdPartyPath, platformDir, archDir, 'git', gitBinDir, `git${exeExtension}`),
      gitLibexecGitCore: process.platform === 'linux' ? '' : path.resolve(thirdPartyPath, platformDir, archDir, 'git', gitLibexecParentDir, 'libexec', 'git-core'),
      node16: process.platform === 'linux' ? 'node' : path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `node${exeExtension}`),
      nodeBin: process.platform === 'linux' ? '' : path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir),
      yarn: process.platform === 'linux' ? 'yarn' : path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `yarn${cmdExtension}`),
      pnpm: process.platform === 'linux' ? 'pnpm' : path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `pnpm${cmdExtension}`),
      npm: process.platform === 'linux' ? 'npm' : path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `npm${cmdExtension}`),
      npx: process.platform === 'linux' ? 'npx' : path.resolve(thirdPartyPath, platformDir, archDir, 'node', 'v16.20.0', nodeBinDir, `npx${cmdExtension}`),
      ffmpeg: path.resolve(thirdPartyPath, platformDir, process.platform === 'linux' ? archDir : archCommonDir, `ffmpeg${exeExtension}`),
    },
    macos: {
      iosDeviceAgentProject: process.platform === 'darwin' ? path.resolve(thirdPartyPath, platformDir, archCommonDir, 'ios-device-agent') : '',
      mobiledevice: process.platform === 'darwin' ? path.resolve(thirdPartyPath, platformDir, archDir, 'mobiledevice') : '',
    },
  };
}
