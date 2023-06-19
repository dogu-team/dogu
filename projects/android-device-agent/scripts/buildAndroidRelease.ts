import * as shelljs from 'shelljs';

export function buildAndroidRelease(): void {
  shelljs.cd('android');
  const gradleCommand = process.platform == 'win32' ? 'gradlew.bat' : './gradlew';
  if (shelljs.exec(`${gradleCommand} assembleRelease`, { fatal: true }).code !== 0) {
    throw new Error('Failed to build the release apk');
  }
  shelljs.cd('..');

  const sourceCommonDir = `../../third-party/common`;
  shelljs.mkdir('-p', sourceCommonDir);
  if (shelljs.cp('./android/app/build/outputs/apk/release/app-release-unsigned.apk', `${sourceCommonDir}/android_deviceagent.txt`).code != 0) {
    throw new Error('Failed to copy the apk file');
  }
}
