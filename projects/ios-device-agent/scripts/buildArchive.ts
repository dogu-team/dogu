import compressing from 'compressing';
import fsPromise from 'fs/promises';
import shelljs from 'shelljs';

if (process.platform !== 'darwin') {
  console.log('This script is only for macOS.');
  process.exit(0);
}

async function buildArchive(): Promise<void> {
  shelljs.rm('-rf', '.build');
  if (
    shelljs.exec(
      'xcodebuild build-for-testing -project IOSDeviceAgent/IOSDeviceAgent.xcodeproj -scheme DoguRunner -destination generic/platform=iOS -derivedDataPath .build -allowProvisioningUpdates',
    ).code !== 0
  ) {
    throw new Error('Failed to build the archive');
  }
  const buildProductsSubDir = '.build/Build/Products/Debug-iphoneos';
  // const allowedExtensions = ['.app', '.appex'];
  const allowedExtensions = ['.app'];
  const files = await fsPromise.readdir(buildProductsSubDir);
  files.forEach((file) => {
    if (!allowedExtensions.some((ext) => file.endsWith(ext))) {
      shelljs.rm('-rf', `${buildProductsSubDir}/${file}`);
    }
  });

  const src = '.build/ios-device-agent-runner.zip';
  await compressing.zip.compressDir('.build/Build/Products', src);

  const dests = [`../../third-party/${process.platform}/common/ios-device-agent`];
  for (const dst of dests) {
    if (shelljs.rm('-rf', dst).code !== 0) {
      throw new Error(`Failed to remove the directory: ${dst}`);
    }
    if (shelljs.mkdir('-p', dst).code !== 0) {
      throw new Error(`Failed to create the directory: ${dst}`);
    }
    if (shelljs.cp('-f', src, dst).code !== 0) {
      throw new Error(`Failed to copy the file: ${src} -> ${dst}`);
    }
  }
}
// if (ci.isCI()) {
//   if (!git.matchesChangedFiles(['projects/ios-device-agent/**', 'prebuilds/protocol-exporter/**'])) {
//     console.log('No changes to ios-device-agent, skipping build.');
//     process.exit(0);
//   }
// }

buildArchive().catch((e) => {
  console.error(e);
  process.exit(1);
});
