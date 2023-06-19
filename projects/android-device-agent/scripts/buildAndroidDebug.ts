import * as shelljs from 'shelljs';

shelljs.cd('android');
const gradleCommand = process.platform == 'win32' ? 'gradlew.bat' : './gradlew';
shelljs.exec(`${gradleCommand} assembleDebug`, { fatal: true });
shelljs.cd('..');

if (shelljs.cp('./android/app/build/outputs/apk/debug/app-debug.apk', '../../third-party/common/android_deviceagent.txt').code != 0) {
  throw new Error('Failed to copy the apk file');
}
