import { filesystem } from '@dogu-dev-private/base-build-tools';
import { redirectFileToStream } from '@dogu-tech/node';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { archive } from './archive';
import { BuildTarget } from './build_target';
import { modifyManifest } from './manifest';
import { newNodeEnv } from './node_env';
import { modifyProjectSetting } from './project_settings';

const desktopParam: {
  [key: string]: {
    unityPath: string;
  };
} = {
  win32: {
    unityPath: '"C:/Program Files/Unity/Hub/Editor/2021.3.17f1/Editor/Unity.exe"',
  },
  darwin: {
    unityPath: '/Applications/Unity/Hub/Editor/2021.3.17f1/Unity.app/Contents/MacOS/Unity',
  },
};

const buildTargetConfig: {
  [key: string]: {
    outputPostfix: string;
  };
} = {
  android: {
    outputPostfix: '.apk',
  },
  ios: {
    outputPostfix: '',
  },
  standaloneosx: {
    outputPostfix: '',
  },
  standalonewindows64: {
    outputPostfix: '.exe',
  },
};

interface BuildResult {
  error: Error | null;
  isRetry: boolean;
  outputRelativePath: string;
}

interface BuildOption {
  buildTarget: BuildTarget;
  appVersion: string;
  deps: { key: string; value: string }[];
}

export async function build(projectPath: string, option: BuildOption): Promise<void> {
  await modifyProjectSetting(projectPath, option.appVersion);
  await modifyManifest(projectPath, option.deps);

  let result = await buildInternal(projectPath, option.buildTarget);
  for (let index = 0; index < 3; index++) {
    if (result.error === null) {
      break;
    }
    if (result.isRetry) {
      result = await buildInternal(projectPath, option.buildTarget);
      continue;
    }
    throw result.error;
  }

  await archive(path.resolve(projectPath, result.outputRelativePath), option.buildTarget);
}

async function buildInternal(projectPath: string, buildTarget: BuildTarget): Promise<BuildResult> {
  const outputReleativeDirectory = `build/${buildTarget}`;
  const logPath = path.resolve(projectPath, outputReleativeDirectory, 'buildlog.txt');

  const desktopInfo = desktopParam[process.platform];
  if (desktopInfo === undefined) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
  const unityPath = desktopInfo.unityPath;
  const buildTargetInfo = buildTargetConfig[buildTarget];
  if (buildTargetInfo === undefined) {
    throw new Error(`Unsupported build target: ${buildTarget}`);
  }
  const productExt = buildTargetInfo.outputPostfix;
  const productName = `${path.basename(projectPath)}${productExt}`;
  const outputRelativePath = `${outputReleativeDirectory}/${productName}`;

  // build
  await filesystem.deleteDirs([
    path.resolve(projectPath, outputReleativeDirectory),
    path.resolve(projectPath, 'Packages/packages-lock.json'),
    path.resolve(projectPath, 'Library/PackageCache'),
  ]);

  const redirectContext = { stop: false };
  redirectFileToStream(logPath, redirectContext, process.stdout).catch((err) => {
    console.error(err);
  });
  const buildcommand =
    `${unityPath} -quit -batchmode ` +
    `-projectPath ${projectPath} ` +
    '-executeMethod Gamium.Editor.Builder.PerformCommandLineBuild ' +
    `-buildTarget ${buildTarget} ` +
    `-outputRelativePath ${outputRelativePath} ` +
    `-logFile ${logPath}`;
  console.log(buildcommand);

  const childProc = shelljs.exec(buildcommand, { async: true, env: newNodeEnv() });
  const code = await new Promise((resolve) => {
    childProc.on('exit', (code) => {
      console.log('exit code', code);
      resolve(code);
    });
  });
  redirectContext.stop = true;

  const logs = fs.readFileSync(logPath, 'utf8');
  const error = checkBuildError(logs, code);
  error.outputRelativePath = outputRelativePath;
  return error;
}

function checkBuildError(logs: string, code: unknown): BuildResult {
  const retryMsgs = ['Error when executing git command.'];
  retryMsgs.forEach((retrymsg) => {
    const index = logs.indexOf(retrymsg);
    if (index != -1) {
      return { error: null, isRetry: true, outputRelativePath: '' };
    }
  });

  const errorMsgs = ['Unity license has expired', 'Please re-activate new license', ': error', 'Exception:', 'because scripts had compiler errors', 'Result: Failure'];
  errorMsgs.forEach((errorMsg) => {
    const index = logs.indexOf(errorMsg);
    if (index != -1) {
      console.error(logs.substring(index, index + 100));
      return { error: new Error(errorMsg), isRetry: false, outputRelativePath: '' };
    }
  });

  if (code != 0) {
    return { error: new Error('build failed'), isRetry: false, outputRelativePath: '' };
  }
  return { error: null, isRetry: false, outputRelativePath: '' };
}
