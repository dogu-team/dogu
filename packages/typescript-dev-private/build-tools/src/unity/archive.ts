import { delay } from '@dogu-tech/common';
import fsPromises from 'fs/promises';
import path from 'path';
import { Xcode } from 'pbxproj-dom/xcode';
import shelljs from 'shelljs';
import { BuildTarget } from './build_target';

const FailDescriptions = ['** ARCHIVE FAILED **', '** EXPORT FAILED **'];

export async function archive(outputPath: string, buildTarget: BuildTarget): Promise<void> {
  if (buildTarget !== BuildTarget.iOS) {
    return;
  }
  await delay(0);

  shelljs.which('xcodebuild');

  const pbxprojPath = path.resolve(outputPath, 'Unity-iPhone.xcodeproj', 'project.pbxproj');
  const xcode = Xcode.open(pbxprojPath);
  xcode.setAutomaticSigningStyle('Unity-iPhone', 'THJJSQ3S6P');
  xcode.save();

  const archiveRet = shelljs.exec(
    `xcodebuild -project "${path.resolve(
      outputPath,
      'Unity-iPhone.xcodeproj',
    )}" -scheme Unity-iPhone -sdk iphoneos -destination generic/platform=iOS archive -archivePath "${path.resolve(outputPath, 'Unity-iPhone.xcarchive')}"`,
    { fatal: true },
  );
  FailDescriptions.forEach((failDescription) => {
    if (archiveRet.stdout.includes(failDescription)) {
      throw new Error(`xcodebuild archive failed: ${archiveRet.stdout}`);
    }
    if (archiveRet.stderr.includes(failDescription)) {
      throw new Error(`xcodebuild archive failed: ${archiveRet.stderr}`);
    }
  });
  const exportOptionPlistText = `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
        <dict>
            <key>compileBitcode</key>
            <false/>
            <key>method</key>
            <string>development</string>
            <key>teamID</key>
            <string>THJJSQ3S6P</string>
            <key>uploadBitcode</key>
            <false/>
            <key>uploadSymbols</key>
            <true/>
        </dict>
        </plist>
        `;
  await fsPromises.writeFile(path.resolve(outputPath, 'exportOptions.plist'), exportOptionPlistText);

  const exportRet = shelljs.exec(
    `xcodebuild -exportArchive -archivePath "${path.resolve(outputPath, 'Unity-iPhone.xcarchive')}" -exportPath "${outputPath}" -exportOptionsPlist ${path.resolve(
      outputPath,
      'exportOptions.plist',
    )}`,
    { fatal: true },
  );
  FailDescriptions.forEach((failDescription) => {
    if (exportRet.stdout.includes(failDescription)) {
      throw new Error(`xcodebuild export failed: ${exportRet.stdout}`);
    }
    if (exportRet.stderr.includes(failDescription)) {
      throw new Error(`xcodebuild export failed: ${exportRet.stderr}`);
    }
  });
}
