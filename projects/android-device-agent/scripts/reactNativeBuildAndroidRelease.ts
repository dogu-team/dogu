import * as shelljs from 'shelljs';

shelljs.exec('rm -rf packages');
shelljs.exec('cp -r ../../packages/typescript/types packages', { fatal: true });
shelljs.exec(
  'react-native bundle\
   --platform android\
   --dev false\
   --reset-cache\
   --entry-file index.js\
   --bundle-output android/app/src/main/assets/index.android.bundle\
   --assets-dest android/app/build/intermediates/res/merged/release/',
  { fatal: true },
);
shelljs.exec('rm -rf android/app/src/main/res/drawable-*');
shelljs.exec('rm -rf android/app/src/main/res/raw/* ;');
shelljs.cd('android_rn');
shelljs.exec('./gradlew assembleRelease', { fatal: true });
shelljs.cd('..');

shelljs.cp('./android/app/build/outputs/apk/release/app-release.apk', '../../third-party/common/android_rndeviceagent.txt');
