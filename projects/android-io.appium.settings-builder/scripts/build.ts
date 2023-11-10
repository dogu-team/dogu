import { android } from '@dogu-dev-private/build-tools';
import { ConsoleLogger } from '@dogu-tech/common';
import { CheckTimer, download } from '@dogu-tech/node';
import compressing from 'compressing';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { changeFusedLocation, changeLocationInterval } from './change-location-interval';

const Version = '5.2.0';
const Url = `https://github.com/appium/io.appium.settings/archive/refs/tags/v${Version}.zip`;

const buildOutputDir = path.resolve(__dirname, '..', 'build');

const ZipPath = path.resolve(buildOutputDir, `io.appium.settings-${Version}.zip`);
const ZipOutputDir = path.resolve(buildOutputDir, `io.appium.settings-${Version}`);
const ApkOutputPath = path.resolve(ZipOutputDir, `app/build/outputs/apk/debug/settings_apk-debug.apk`);
const ThirdPartyCommonPath = path.resolve(__dirname, '..', '..', '..', 'third-party', 'common');

const logger = new ConsoleLogger();
(async () => {
  const timer = new CheckTimer(logger);
  await timer.check(
    'download',
    download({
      url: Url,
      filePath: ZipPath,
      skip: {
        expectedFileSize: 217_892,
      },
      logger,
    }),
  );

  await timer.check('rm', fs.promises.rm(ZipOutputDir, { recursive: true, force: true }));
  await timer.check('uncompress', compressing.zip.uncompress(ZipPath, path.dirname(ZipOutputDir)));
  await timer.check('changeLocationInterval', changeLocationInterval(ZipOutputDir));
  await timer.check('changeFusedLocation', changeFusedLocation(ZipOutputDir));

  const build = async () => {
    return new Promise<void>((resolve, reject) => {
      if (!android.checkBuildEnv()) {
        reject(new Error('checkBuildEnv failed'));
      }
      const cwd = process.cwd();
      shelljs.cd(ZipOutputDir);

      const gradleCommand = process.platform == 'win32' ? 'gradlew.bat' : './gradlew';
      shelljs.exec(`${gradleCommand} assembleDebug`, { fatal: true });

      shelljs.cd(cwd);

      shelljs.mkdir('-p', ThirdPartyCommonPath);
      if (shelljs.cp(ApkOutputPath, `${ThirdPartyCommonPath}/io.appium.settings.apk`).code != 0) {
        reject(new Error('Failed to copy the apk file'));
      }
      resolve();
    });
  };

  await timer.check('build', build());
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
