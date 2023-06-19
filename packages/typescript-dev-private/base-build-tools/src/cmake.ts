import process from 'process';
import shelljs from 'shelljs';
const parameter: {
  [key: string]: {
    cmakeProject: string;
    cmakeBuildTool: string;
  };
} = {
  win32: {
    cmakeProject: 'build',
    cmakeBuildTool: 'Visual Studio 16 2019',
  },
  darwin: {
    cmakeProject: 'build',
    cmakeBuildTool: 'Xcode',
  },
  linux: {
    cmakeProject: 'build',
    cmakeBuildTool: 'Unix Makefiles',
  },
};

export function generateProject(workingDir: string, projectName: string, args = ''): void {
  const currentDir = process.cwd();
  process.chdir(workingDir);

  const platformStr: string = process.platform;
  if (platformStr in parameter === false) {
    throw new Error(`Unsupported platform: ${platformStr}`);
  }
  const platform = parameter[platformStr];
  if (platform === undefined) {
    throw new Error(`Unsupported platform: ${platformStr}`);
  }
  const projectBuildTool = platform.cmakeBuildTool;
  shelljs.rm('-rf', projectName);
  const ret = shelljs.exec(`cmake -H. -B${projectName} -G "${projectBuildTool}" ${args}`);
  if (0 != ret.code) {
    throw new Error(`cmake error ${ret}`);
  }

  process.chdir(currentDir);
}

export function buildProject(workingDir: string, projectName: string, isRelease: boolean, args = ''): void {
  const currentDir = process.cwd();
  process.chdir(workingDir);

  const ret = shelljs.exec(`cmake --build ${projectName} --config ${isRelease ? 'Release' : 'Debug'} ${args}`);
  if (0 != ret.code) {
    throw new Error(`cmake build error ${ret}`);
  }

  process.chdir(currentDir);
}
