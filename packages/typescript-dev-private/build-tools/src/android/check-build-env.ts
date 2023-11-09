import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

export function checkAndroidEnv(): boolean {
  console.info(`> Checking Android environment...`);
  if (process.env.ANDROID_HOME) {
    console.info(`- ANDROID_HOME checked. : ${process.env.ANDROID_HOME}}`);
    return true;
  }
  if (process.env.ANDROID_SDK_ROOT) {
    console.info(`- ANDROID_SDK_ROOT checked. : ${process.env.ANDROID_SDK_ROOT}}`);
    return true;
  }
  console.error(`- ANDROID_HOME or ANDROID_SDK_ROOT is not set. try default path.`);
  const homePath = process.env.HOME ?? process.env.USERPROFILE ?? '';
  const androidHomes = [path.resolve(homePath, 'Android/Sdk'), path.resolve(homePath, 'Library/Android/sdk'), path.resolve(homePath, 'AppData/Local/Android/Sdk')];
  let androidHome = '';
  for (const home of androidHomes) {
    if (fs.existsSync(home)) {
      androidHome = home;
      process.env.ANDROID_HOME = androidHome;
      console.info(`- ANDROID_HOME set. : ${androidHome}}`);
      break;
    }
  }
  if ('' === androidHome) {
    throw Error(`Build failed. error: ANDROID_HOME or ANDROID_SDK_ROOT is not set.`);
  }
  return true;
}

export function checkJdk(): boolean {
  console.info(`> Checking JDK...`);
  const out = shelljs.exec(`java -version`, { silent: true });
  const allout = out.stdout + out.stderr;
  console.info(`- java version: ${allout}`);
  if (!allout.includes('openjdk 11') && !allout.includes('build 11')) {
    throw Error(`Build failed. error: JDK 11 is required.`);
    return false;
  }
  return true;
}

export function checkBuildEnv(): boolean {
  return checkAndroidEnv() && checkJdk();
}
