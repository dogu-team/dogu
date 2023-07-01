import fs from 'fs';
import path from 'path';
import { signThirdParties } from './deployDarwin';

export type Arch = 'ia32' | 'x64' | 'arm64';
export const ThirdPartyPath = path.resolve(__dirname, '../../../../third-party');

export interface ExtraResource {
  from: string;
  to: string;
}

async function access(path: string, mode: number): Promise<boolean> {
  try {
    fs.promises.access(path, mode);
    return true;
  } catch (error) {
    return false;
  }
}

function getArchs(platform: NodeJS.Platform): Arch[] {
  switch (platform) {
    case 'win32':
      return ['x64'];
    case 'darwin':
      return ['arm64', 'x64'];
    // return ['arm64'];
    default:
      throw new Error(`Unsupported platform ${platform}`);
  }
}

async function validateResourceEnvs(): Promise<void> {
  try {
    await Promise.all([fs.promises.access('.env.device-server', fs.constants.R_OK), fs.promises.access('.env.host-agent', fs.constants.R_OK)]);
  } catch (error) {
    console.error('Environment file not found', error);
    process.exit(1);
  }
}

async function copyThirdParty(platform: NodeJS.Platform, archs: NodeJS.Architecture[]): Promise<ExtraResource[]> {
  const srcRoot = ThirdPartyPath;
  if (!(await access(srcRoot, fs.constants.R_OK))) {
    console.error('Third party path not found', { srcRoot });
    process.exit(1);
  }

  const srcs = archs.reduce(
    (acc, arch) => {
      acc.push(path.resolve(srcRoot, platform, arch));
      return acc;
    },
    [path.resolve(srcRoot, 'common'), path.resolve(srcRoot, platform, 'common')],
  );
  const exists = await Promise.all(srcs.map((src) => access(src, fs.constants.R_OK)));
  if (!exists.every((e) => e)) {
    console.error('Third party path not found', { srcs });
    process.exit(1);
  }

  // eslint-disable-next-line no-template-curly-in-string
  const fileMaps = [
    { from: path.resolve(srcRoot, 'README.md'), to: 'third-party/README.md' },
    { from: path.resolve(srcRoot, 'common'), to: 'third-party' },
    { from: path.resolve(srcRoot, '${platform}', 'common'), to: 'third-party' },
    { from: path.resolve(srcRoot, '${platform}', '${arch}'), to: 'third-party' },
  ];
  return fileMaps.map((fileMap) => {
    return {
      from: fileMap.from,
      to: fileMap.to,
    };
  });
}

async function copyFeatureConfig(runType: string): Promise<ExtraResource> {
  const featureConfigPath = path.resolve(process.cwd(), 'features', `${runType}.feature.config.json`);
  if (!(await access(featureConfigPath, fs.constants.R_OK))) {
    console.error('Feature config not found', { featureConfigPath });
    process.exit(1);
  }
  return {
    from: featureConfigPath,
    to: 'feature.config.json',
  };
}

export async function prepare(platform: NodeJS.Platform, runType: string): Promise<{ archs: Arch[]; extraResources: ExtraResource[] }> {
  await validateResourceEnvs();
  const archs = getArchs(platform);
  if (process.platform === 'darwin') {
    await signThirdParties();
  }
  const extraResources = await copyThirdParty(platform, archs);
  const featureConfig = await copyFeatureConfig(runType);
  extraResources.push(featureConfig);
  return {
    archs,
    extraResources,
  };
}
