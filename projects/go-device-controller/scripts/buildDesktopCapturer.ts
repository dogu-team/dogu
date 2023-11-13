import { cmake } from '@dogu-dev-private/base-build-tools';
import { download } from '@dogu-tech/node';
import fs from 'fs';
import path from 'path';
import * as shelljs from 'shelljs';
import { copyForce } from './build_helpers';

interface BuildInfo {
  cmakeProject: string;
  cmakeBuildTool: string;
  cmakeMoreArg: string;
  artifacts: {
    src: string;
    dests: string[];
  }[];
  libs: {
    path: string;
  }[];
}
const doguWorkspacePath = path.resolve(__dirname, '../../..');
const parameter: {
  [key: string]: BuildInfo[];
} = {
  win32: [
    {
      cmakeProject: 'build',
      cmakeBuildTool: 'Visual Studio 16 2019',
      cmakeMoreArg: '-DMSVC_RUNTIME=static',
      artifacts: [
        {
          src: 'build/Release/desktop-capturer.exe',
          dests: [path.resolve(doguWorkspacePath, `third-party/win32/${process.arch}/desktop-capturer.exe`)],
        },
      ],
      libs: [{ path: 'externals/webrtc/lib/win-x64-webrtc.lib' }, { path: 'externals/webrtc/lib/win-x86-webrtc.lib' }],
    },
  ],
  darwin: [
    {
      cmakeProject: 'build',
      cmakeBuildTool: 'Xcode',
      cmakeMoreArg: '-DCMAKE_OSX_ARCHITECTURES=x86_64',
      artifacts: [
        {
          src: 'build/Release/desktop-capturer',
          dests: [path.resolve(doguWorkspacePath, `third-party/darwin/x64/desktop-capturer`)],
        },
      ],
      libs: [{ path: 'externals/webrtc/lib/darwin-amd64-webrtc.a' }, { path: 'externals/webrtc/lib/darwin-arm64-webrtc.a' }],
    },
    {
      cmakeProject: 'build',
      cmakeBuildTool: 'Xcode',
      cmakeMoreArg: '-DCMAKE_OSX_ARCHITECTURES=arm64',
      artifacts: [
        {
          src: 'build/Release/desktop-capturer',
          dests: [path.resolve(doguWorkspacePath, `third-party/darwin/arm64/desktop-capturer`)],
        },
      ],
      libs: [{ path: 'externals/webrtc/lib/darwin-amd64-webrtc.a' }, { path: 'externals/webrtc/lib/darwin-arm64-webrtc.a' }],
    },
  ],
  linux: [
    {
      cmakeProject: 'build',
      cmakeBuildTool: 'Unix Makefiles',
      cmakeMoreArg: '',
      artifacts: [
        {
          src: 'build/desktop-capturer',
          dests: [path.resolve(doguWorkspacePath, `third-party/linux/x64/desktop-capturer`)],
        },
      ],
      libs: [{ path: 'externals/webrtc/lib/linux-x86_64-libwebrtc.a' }],
    },
  ],
};

export async function checkLibs(desktopCapturerProjPath: string, libPaths: string[]): Promise<void> {
  for (const lib of libPaths) {
    const libPath = path.resolve(desktopCapturerProjPath, lib);
    if (fs.existsSync(libPath)) {
      continue;
    }

    const libFileName = path.basename(libPath);

    await download({ url: `https://github.com/dogu-team/third-party-binaries/releases/download/libwebrtc-4976/${libFileName}`, filePath: libPath, logger: console });
  }
}

export async function buildDesktopCapturer(): Promise<void> {
  console.log('\n\n>> [ buildDesktopCapturer ]');
  const desktopCapturerProjPath = path.resolve(__dirname, '../desktop-capturer');
  shelljs.cd(desktopCapturerProjPath);

  const platformStr: string = process.platform;
  if (platformStr in parameter === false) {
    throw new Error(`Unsupported platform: ${platformStr}`);
  }

  for (const param of parameter[platformStr]) {
    await buildDesktopCapturerWithParam(desktopCapturerProjPath, param);
  }
}

export async function buildDesktopCapturerWithParam(desktopCapturerProjPath: string, param: BuildInfo): Promise<void> {
  const projectName = param.cmakeProject;
  const projectMoreArg = param.cmakeMoreArg;
  const artifacts = param.artifacts;
  const libs = param.libs;

  await checkLibs(
    desktopCapturerProjPath,
    libs.map((lib) => lib.path),
  );

  cmake.generateProject(desktopCapturerProjPath, projectName, projectMoreArg);
  cmake.buildProject(desktopCapturerProjPath, projectName, true);

  for (const artifact of artifacts) {
    for (const copyDest of artifact.dests) {
      copyForce(artifact.src, copyDest);
    }
  }
}
