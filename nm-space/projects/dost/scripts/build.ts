import { build, CliOptions } from 'electron-builder';
import fs from 'fs';
import path from 'path';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { checkIdentity, deleteKeyFile, findDarwinDistfile, generateKeyFile, notarizeDarwin } from './deployDarwin';
import { findWindowsDistfile } from './deployWindows';
import { deviceServerEnv, dostEnv, env } from './env';
import { Arch, ExtraResource, prepare } from './prepare';
import { upload } from './upload';

const distPath = path.join(__dirname, '../dist');
const argv = yargs(hideBin(process.argv)).option('notarize', { type: 'boolean' }).option('upload', { type: 'boolean' }).option('publish', { type: 'boolean' }).parseSync();
const packagejsonPath = path.resolve(__dirname, '..', 'package.json');

function getName(): string {
  if (!fs.existsSync(packagejsonPath)) {
    throw new Error('package.json not found');
  }
  let contents = fs.readFileSync(packagejsonPath, 'utf8');
  const match = contents.match(/"name":\s*"(?<name>[^"]*)"/);
  if (!match?.groups?.name) {
    throw new Error('package.json name not found');
  }
  return match?.groups?.name;
}

(async () => {
  const { platform } = process;
  const { archs, extraResources } = await prepare(platform, deviceServerEnv.DOGU_RUN_TYPE);
  await checkIdentity();
  await generateKeyFile();
  process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
  await build(getOptions(archs, extraResources));
  await deleteKeyFile();
})();
function getArtifactPrefix(): string {
  if (deviceServerEnv.DOGU_RUN_TYPE === 'production') {
    return 'dost';
  }
  return `dost-${deviceServerEnv.DOGU_RUN_TYPE}`;
}

function getOptions(archs: Arch[], extraRess: ExtraResource[]): CliOptions {
  const artifactPrefix = getArtifactPrefix();
  let options: CliOptions = {
    config: {
      appId: `com.dogu.${getName()}`,
      artifactName: artifactPrefix + '-${os}-${arch}-${version}.${ext}',
      extends: null,
      files: ['build/**/*', '!**/*d.ts', '!**/*d.ts.map', '!**/*.js.map', '!**/tsconfig.tsbuildinfo'],
      directories: {
        buildResources: 'build/buildResources',
      },
      extraResources: [
        {
          from: '.',
          to: 'dotenv',
          filter: ['.env.device-server', '.env.host-agent', '.env.dost'],
        },
        ...extraRess,
      ],
      electronVersion: '23.1.0',
      win: {
        target: 'nsis',
      },
      mac: {
        target: 'default', // caution. for auto update. both dmg and zip are required. https://www.electron.build/configuration/mac
        // identity: 'Dogu Technologies Inc. (THJJSQ3S6P)',
      },
      artifactBuildCompleted: async (ctx) => {
        console.log('ctx', ctx);
        const files = await fs.promises.readdir(distPath);
        console.log('dist files', files);
        let filePath = '';
        if (process.platform === 'darwin') {
          filePath = await findDarwinDistfile(ctx);
          if (0 < filePath.length && argv.notarize) {
            await notarizeDarwin(filePath);
          }
        }
        if (process.platform === 'win32') {
          filePath = await findWindowsDistfile(ctx);
        }
        if (argv.upload && 0 < filePath.length) {
          await upload(filePath);
        }
      },
      publish: {
        provider: dostEnv.DOGU_APPUPDATE_PROVIDER as 's3',
        bucket: dostEnv.DOGU_APPUPDATE_URL,
        acl: null,
        path: dostEnv.DOGU_APPUPDATE_SUBPATH,
        region: dostEnv.DOGU_APPUPDATE_REGION,
      },
    },
  };
  if (argv.publish) {
    if (!env.AWS_ACCESS_KEY_ID) {
      throw new Error('AWS_ACCESS_KEY_ID is not set');
    }
    if (!env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS_SECRET_ACCESS_KEY is not set');
    }
    options.publish = 'always';
  }
  archs.forEach((arch) => {
    options[arch] = true;
  });
  return options;
}
