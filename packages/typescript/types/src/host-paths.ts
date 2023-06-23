interface CommonPathMap {
  androidDeviceAgent: string;
  adbJoinWifiApk: string;
  goDeviceController: string;
  git: string;
  gitLibexecGitCore: string;
  node16: string;
  nodeBin: string;
  yarn: string;
  pnpm: string;
  ffmpeg: string;
}

interface MacosPathMap {
  iosDeviceAgentProject: string;
  mobiledevice: string;
  idevicediagnostics: string;
  libimobiledeviceLibPath: string;
  idevicesyslog: string;
}

interface AndroidPathMap {
  adb: string;
}

export interface ThirdPartyPathMap {
  common: CommonPathMap;
  macos: MacosPathMap;
}

export interface PathMap {
  common: CommonPathMap;
  macos: MacosPathMap;
  android: AndroidPathMap;
}
