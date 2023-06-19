import compressing from 'compressing';
import os from 'os';
import path from 'path';
import shelljs from 'shelljs';

const certificateName = ''; // ex Apple Development: asdfadsf@asdfdasf.com (asds)
const xctrunnerProvision = '';
const iosdeviceAgentProvision = '';
const iosdeviceAgentDoguScreenProvision = '';

async function resign(appPath: string, provisionPath1: string, provisionPath2: string): Promise<void> {
  const tmpIpaPath = path.resolve(os.tmpdir(), 'tmp.zip');
  const tmpUnzipPath = path.resolve(os.tmpdir(), 'tmpipadir');
  const command = [`${__dirname}/resign.sh`, appPath, `"${certificateName}"`, '-p', provisionPath1, '-p', provisionPath2, tmpIpaPath].join(' ');

  shelljs.exec(command);
  await compressing.zip.uncompress(tmpIpaPath, tmpUnzipPath);
  shelljs.rm('-rf', appPath);
  shelljs.cp('-rf', `${tmpUnzipPath}/Payload/${path.basename(appPath)}`, appPath);
}

async function resignApps(zipPath: string, tmpDirPath: string, destPath: string): Promise<void> {
  shelljs.rm('-rf', tmpDirPath);
  await compressing.zip.uncompress(zipPath, tmpDirPath);
  const appsDirPath = path.resolve(tmpDirPath, 'Products/Debug-iphoneos');

  await resign(path.resolve(appsDirPath, 'DoguRunner-Runner.app'), xctrunnerProvision, `dogu.IOSDeviceAgentRunner=${xctrunnerProvision}`);
  await resign(path.resolve(appsDirPath, 'DoguDev.app'), iosdeviceAgentProvision, `dogu.IOSDeviceAgentRunner.DoguScreen=${iosdeviceAgentDoguScreenProvision}`);

  shelljs.rm('-rf', destPath);
  await compressing.zip.compressDir(path.resolve(tmpDirPath, 'Products'), destPath);
}

resignApps(
  '/Users/jenkins/projects/dogu/third-party/darwin/common/ios-device-agent/origin-ios-device-agent-runner.zip',
  '/Users/jenkins/projects/dogu/third-party/darwin/common/ios-device-agent/tmp',
  '/Users/jenkins/projects/dogu/third-party/darwin/common/ios-device-agent/ios-device-agent-runner.zip',
).catch((e) => {
  console.error(e);
  process.exit(1);
});
