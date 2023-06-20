import { delay } from '@dogu-tech/common';
import child_process from 'child_process';
import { Arch, ArtifactCreated } from 'electron-builder';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { env } from './env';
import { ThirdPartyPath } from './prepare';

const DoguIdentityUrls = [
  'https://drive.google.com/drive/folders/1-ISuTEI1j_WNKNmzyGOm02ODZq8XkVwY',
  'https://developer.apple.com/account/resources/certificates/download/6AXGSW283P',
];
const DoguIdentity = `649965BEF665859D3D52B5DC2DF89EF852E58610 "Developer ID Application: Dogu Technologies Inc. (THJJSQ3S6P)"`;
const KeyStr = env.DOGU_APPLE_API_PRIVATEKEY.replaceAll('\\n', '\n');
const KeyFilePath = path.resolve(os.homedir(), '.dogu_secret', 'apple_api_privatekey.p8');
const KeyId = env.DOGU_APPLE_API_KEY_ID;
const IssuerId = env.DOGU_APPLE_API_ISSUER_ID;

function spawnAndOutputs(command: string, args: string[], options: child_process.SpawnOptions): Promise<{ stdout: string; stderr: string }> {
  console.log(`Running command: ${command} ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const child = child_process.spawn(command, args, options);
    child.stdout?.on('data', (data) => {
      process.stdout.write(data);
      stdout.push(data.toString());
    });
    child.stderr?.on('data', (data) => {
      process.stderr.write(data);
      stderr.push(data.toString());
    });
    child.on('exit', (code) => {
      if (0 === code) {
        resolve({ stdout: stdout.join(''), stderr: stderr.join('') });
      } else {
        reject(new Error(`Exit code: ${code}`));
      }
    });
  });
}

export async function checkIdentity(): Promise<void> {
  if (process.platform !== 'darwin') {
    console.info('Not on darwin. Skipping identity check.');
    return;
  }
  const { stdout, stderr } = await spawnAndOutputs('security', ['find-identity'], {});
  if (!stdout.includes(DoguIdentity)) {
    console.error('Please install the Dogu identity from ', DoguIdentityUrls);
    throw new Error(stderr.toString());
  }
}

async function sign(filePath: string): Promise<void> {
  const { stdout, stderr } = await spawnAndOutputs(
    'codesign',
    ['--options=runtime', '--force', '--verify', '--verbose', '--timestamp', '--sign', 'Developer ID Application: Dogu Technologies Inc. (THJJSQ3S6P)', filePath],
    {},
  );
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
}

export async function generateKeyFile(): Promise<void> {
  if (process.platform !== 'darwin') {
    console.info('Not on darwin. Skipping key file generation.');
    return;
  }
  if (fs.existsSync(KeyFilePath)) {
    await fs.promises.rm(KeyFilePath);
  }
  if (!fs.existsSync(path.dirname(KeyFilePath))) {
    await fs.promises.mkdir(path.dirname(KeyFilePath), { recursive: true });
  }
  await fs.promises.writeFile(KeyFilePath, KeyStr);
}

export async function deleteKeyFile(): Promise<void> {
  if (process.platform !== 'darwin') {
    console.info('Not on darwin. Skipping key file deletion.');
    return;
  }
  if (fs.existsSync(KeyFilePath)) {
    await fs.promises.rm(KeyFilePath);
  }
}

async function notaryDmg(dmgFilePath: string): Promise<string> {
  const { stdout, stderr } = await spawnAndOutputs('xcrun', ['notarytool', 'submit', dmgFilePath, '--key', KeyFilePath, '--key-id', KeyId, '--issuer', IssuerId], {});
  if (stderr) {
    throw new Error(stderr);
  }
  const submissionId = stdout
    .toString()
    .match(/id: (.*)/)?.[0]
    .replace('id: ', '');
  return submissionId!;
}

export async function signThirdParties(): Promise<void> {
  const { stdout, stderr } = await spawnAndOutputs('dot_clean', [ThirdPartyPath], {});
  const darwinPath = path.resolve(ThirdPartyPath, 'darwin');
  const files = [
    path.resolve(darwinPath, 'arm64/lib/libimobiledevice/libcrypto.1.1.dylib'),
    path.resolve(darwinPath, 'arm64/lib/libimobiledevice/libimobiledevice-1.0.6.dylib'),
    path.resolve(darwinPath, 'arm64/lib/libimobiledevice/libplist-2.0.3.dylib'),
    path.resolve(darwinPath, 'arm64/lib/libimobiledevice/libssl.1.1.dylib'),
    path.resolve(darwinPath, 'arm64/lib/libimobiledevice/libusbmuxd-2.0.6.dylib'),
    path.resolve(darwinPath, 'x64/lib/libimobiledevice/libcrypto.1.1.dylib'),
    path.resolve(darwinPath, 'x64/lib/libimobiledevice/libimobiledevice-1.0.6.dylib'),
    path.resolve(darwinPath, 'x64/lib/libimobiledevice/libplist-2.0.3.dylib'),
    path.resolve(darwinPath, 'x64/lib/libimobiledevice/libssl.1.1.dylib'),
    path.resolve(darwinPath, 'x64/lib/libimobiledevice/libusbmuxd-2.0.6.dylib'),
  ];
  for (const file of files) {
    await sign(file);
  }
}

async function waitUntilProgressDone(submissionId: string): Promise<void> {
  for (let index = 0; index < 1000; index++) {
    console.log('Waiting for notarytool to finish...');
    const { stdout, stderr } = await spawnAndOutputs('xcrun', ['notarytool', 'info', submissionId, '--key', KeyFilePath, '--key-id', KeyId, '--issuer', IssuerId], {});
    // find id from stdout
    if (stderr) {
      throw new Error(stderr);
    }
    if (stdout.includes('status: In Progress')) {
      await delay(3000);
      continue;
    }
    if (!stdout.includes('status: Accepted')) {
      await viewNotarizeLog(submissionId);
      throw new Error('Notarization not accepted');
    }
    break;
  }
}
async function viewNotarizeLog(dmgFilePath: string): Promise<void> {
  const { stdout, stderr } = await spawnAndOutputs('xcrun', ['notarytool', 'log', dmgFilePath, '--key', KeyFilePath, '--key-id', KeyId, '--issuer', IssuerId], {});
  if (stderr) {
    throw new Error(stderr);
  }
}

export async function findDarwinDistfile(ctx: ArtifactCreated): Promise<string> {
  // find file endswith .dmg
  const files = [path.basename(ctx.file)];
  let dmgFiles = files.filter((file) => file.endsWith('.dmg'));
  if (ctx.arch === Arch.arm64) {
    dmgFiles = dmgFiles.filter((file) => file.includes('arm64'));
  } else {
    dmgFiles = dmgFiles.filter((file) => !file.includes('arm64'));
  }

  if (0 === dmgFiles.length) {
    console.log('files', files);
    console.warn('No dmg file found in dist folder');
    return '';
  }
  if (1 < dmgFiles.length) {
    console.warn('Multiple dmg files found');
    return '';
  }

  return path.resolve(ctx.file);
}

export async function notarizeDarwin(dmgFilePath: string): Promise<void> {
  const submissionId = await notaryDmg(dmgFilePath);
  await waitUntilProgressDone(submissionId);
  await viewNotarizeLog(submissionId);
}
