import { android } from '@dogu-dev-private/build-tools';
import { ConsoleLogger } from '@dogu-tech/common';
import { CheckTimer, download } from '@dogu-tech/node';
import compressing from 'compressing';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

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

  const build = async () => {
    if (!android.checkBuildEnv()) {
      throw new Error('checkBuildEnv failed');
    }
    const cwd = process.cwd();
    shelljs.cd(ZipOutputDir);

    const gradleCommand = process.platform == 'win32' ? 'gradlew.bat' : './gradlew';
    shelljs.exec(`${gradleCommand} assembleDebug`, { fatal: true });

    shelljs.cd(cwd);

    shelljs.mkdir('-p', ThirdPartyCommonPath);
    if (shelljs.cp(ApkOutputPath, `${ThirdPartyCommonPath}/settings_apk-debug.apk`).code != 0) {
      throw new Error('Failed to copy the apk file');
    }
    return Promise.resolve();
  };

  await timer.check('build', build());
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
