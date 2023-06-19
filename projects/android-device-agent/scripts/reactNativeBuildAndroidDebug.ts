import * as shelljs from 'shelljs';

shelljs.exec('rm -rf packages');
shelljs.exec('cp -r ../../packages/typescript/types packages', { fatal: true });
shelljs.exec(
  'react-native bundle\
    --platform android --dev true\
    --entry-file index.js\
    --bundle-output android/app/src/main/assets/index.android.bundle\
    --assets-dest android/app/src/main/res/',
  { fatal: true },
);
shelljs.cd('android_rn');
shelljs.exec('./gradlew assembleDebug', { fatal: true });
shelljs.cd('..');

shelljs.cp('./android/app/build/outputs/apk/debug/app-debug.apk', '../../third-party/common/android_rndeviceagent.txt');
