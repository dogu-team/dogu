import compressing from 'compressing';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import shelljs from 'shelljs';

if (process.platform !== 'darwin') {
  console.log('This script is only for macOS.');
  process.exit(0);
}

async function copyArtifact(): Promise<void> {
  const buildProductsSubDir = '.build/Build/Products/Debug-iphoneos';

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

function copyDirectoryRecursive(
  sourceDir: string,
  destinationDir: string,
  filter: {
    ignoreDirectoryNames: string[];
  },
): void {
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
  }

  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const destinationPath = path.join(destinationDir, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      if (filter.ignoreDirectoryNames.includes(file)) {
        continue;
      }
      copyDirectoryRecursive(sourcePath, destinationPath, filter);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

async function buildArchive(): Promise<void> {
  // build takes long time. so check this by e2e dost manual setup process
  // shelljs.rm('-rf', '.build');
  // let command =
  //   'xcodebuild build-for-testing -project IOSDeviceAgent/IOSDeviceAgent.xcodeproj -scheme DoguRunner -destination generic/platform=iOS -derivedDataPath .build -allowProvisioningUpdates';
  // if (process.env.DOGU_APPLE_API_KEY_ID && process.env.DOGU_APPLE_API_ISSUER_ID) {
  //   command += ` -authenticationKeyID ${process.env.DOGU_APPLE_API_KEY_ID} -authenticationKeyIssuerID ${process.env.DOGU_APPLE_API_ISSUER_ID}`;
  // }
  // if (shelljs.exec(command).code !== 0) {
  //   throw new Error('Failed to build the archive');
  // }

  const sourceDirPath = path.resolve('IOSDeviceAgent');
  const destDirPath = path.resolve(`../../third-party/${process.platform}/common/ios-device-agent`);
  if (fs.existsSync(destDirPath)) {
    if (shelljs.rm('-rf', destDirPath).code !== 0) {
      throw new Error(`Failed to remove the directory: ${destDirPath}`);
    }
  }
  if (shelljs.mkdir('-p', destDirPath).code !== 0) {
    throw new Error(`Failed to create the directory: ${destDirPath}`);
  }
  copyDirectoryRecursive(sourceDirPath, destDirPath, { ignoreDirectoryNames: ['DerivedData', '.build'] });
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
