import fs from 'fs';
import path from 'path';
import process from 'process';
import * as shelljs from 'shelljs';
import { copyForce } from './build_helpers';

const srcToDest = [
  {
    os: 'windows',
    arch: 'amd64',
    nodeOs: 'win32',
    nodeArch: 'x64',
    buildDest: 'build/windows/amd64/go-device-controller.exe',
    artifacts: [
      {
        src: 'build/windows/amd64/go-device-controller.exe',
        dests: ['../../third-party/win32/x64/go-device-controller.exe'],
      },
    ],
    primaryPaths: ['C:\\msys64\\mingw64\\bin', path.resolve(shelljs.env.GITHUB_WORKSPACE ?? '', 'msys64', 'mingw64', 'bin')],
  },
  {
    os: 'darwin',
    arch: 'amd64',
    nodeOs: 'darwin',
    nodeArch: 'x64',
    buildDest: 'build/darwin/amd64/go-device-controller',
    artifacts: [
      {
        src: 'build/darwin/amd64/go-device-controller',
        dests: ['../../third-party/darwin/x64/go-device-controller'],
      },
    ],
    primaryPaths: [],
  },
  {
    os: 'darwin',
    arch: 'arm64',
    nodeOs: 'darwin',
    nodeArch: 'arm64',
    buildDest: 'build/darwin/arm64/go-device-controller',
    artifacts: [
      {
        src: 'build/darwin/arm64/go-device-controller',
        dests: ['../../third-party/darwin/arm64/go-device-controller'],
      },
    ],
    primaryPaths: [],
  },
];

function prepareCgo(os: string, arch: string, primaryPaths: string[]): void {
  for (const path of primaryPaths) {
    process.env.PATH = `${path};${process.env.PATH}`;
  }
  console.log(`  [prepareCgo] PATH: ${process.env.PATH}`);
  console.log(`  [prepareCgo] which gcc: ${shelljs.which('gcc')}`);
  console.log(`  [prepareCgo] which g++ ${shelljs.which('g++')}`);
}

export async function buildGoDeviceController(): Promise<void> {
  console.log('\n\n>> [ buildGoDeviceController ]');

  const desktopCapturerProjPath = path.resolve(__dirname, '..');
  shelljs.cd(desktopCapturerProjPath);

  shelljs.rm('-rf', 'build');

  const buildPromises: Promise<void>[] = [];
  for (const dict of srcToDest) {
    buildPromises.push(
      new Promise((resolve, reject) => {
        if (process.platform !== dict.nodeOs) {
          console.log(`  [build] skip process.platform:${process.platform} !== target:${dict.nodeOs}`);
          resolve();
          return;
        }
        prepareCgo(dict.os, dict.arch, dict.primaryPaths);

        shelljs.mkdir('-p', path.dirname(dict.buildDest));
        process.env.GOOS = dict.os;
        process.env.GOARCH = dict.arch;
        process.env.CGO_ENABLED = '1';
        shelljs.exec(`go build -gcflags "screen=-N -l" -gcflags "robot=-N -l" -ldflags "-s -w" -buildvcs=false -o ${dict.buildDest}`, { fatal: true });
        if (!fs.existsSync(dict.buildDest)) {
          console.log(`  [failed] ${dict.os}, ${dict.arch}, ${dict.buildDest}`);
          reject();
        }
        for (const artifact of dict.artifacts) {
          for (const copyDest of artifact.dests) {
            copyForce(artifact.src, copyDest);
          }
        }

        resolve();
      }),
    );
  }
  for (const p of buildPromises) {
    await p;
  }

  // await Promise.all(buildPromises);
}
