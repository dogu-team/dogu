interface CommonPathMap {
  androidDeviceAgent: string;
  androidAppiumSettingsApk: string;
  adbJoinWifiApk: string;
  goDeviceController: string;
  desktopCapturer: string;
  git: string;
  gitLibexecGitCore: string;
  node16: string;
  nodeBin: string;
  yarn: string;
  pnpm: string;
  npm: string;
  npx: string;
  ffmpeg: string;
}

interface MacosPathMap {
  iosDeviceAgentProject: string;
  mobiledevice: string;
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
