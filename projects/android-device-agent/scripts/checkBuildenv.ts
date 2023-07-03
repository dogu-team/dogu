import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

function checkAndroidEnv(): boolean {
  console.info(`Checking Android environment...`);
  if (process.env.ANDROID_HOME) {
    console.info(`ANDROID_HOME checked.`);
    return true;
  }
  if (process.env.ANDROID_SDK_ROOT) {
    console.info(`ANDROID_SDK_ROOT checked.`);
    return true;
  }
  console.error(`ANDROID_HOME or ANDROID_SDK_ROOT is not set. try default path.`);
  const homePath = process.env.HOME ?? process.env.USERPROFILE ?? '';
  const androidHomes = [path.resolve(homePath, 'Android/Sdk'), path.resolve(homePath, 'Library/Android/sdk'), path.resolve(homePath, 'AppData/Local/Android/Sdk')];
  let androidHome = '';
  for (const home of androidHomes) {
    if (fs.existsSync(home)) {
      androidHome = home;
      process.env.ANDROID_HOME = androidHome;
      break;
    }
  }
  if ('' === androidHome) {
    throw Error(`Build failed. error: ANDROID_HOME or ANDROID_SDK_ROOT is not set.`);
  }
  return true;
}

function checkJdk(): boolean {
  console.info(`Checking JDK...`);
  return shelljs.exec(`java -version`, { silent: true }).code === 0;
}

export function checkBuildEnv(): boolean {
  return checkAndroidEnv() && checkJdk();
}
