import { execSync } from 'child_process';
import fs from 'fs';

function disallowGitSubmodules() {
  const result = execSync('git submodule status', { encoding: 'utf8' });
  if (result.trim().length !== 0) {
    console.log('do NOT use git submodules.');
    process.exit(1);
  }
}

function checkDoguWorkspaceFile() {
  const doguWorkspaceFile = '.dogu-workspace';
  if (!fs.existsSync(doguWorkspaceFile)) {
    console.log(`missing ${doguWorkspaceFile} file.`);
    process.exit(1);
  }
}

function checkThirdPartyReadMe() {
  const thirdPartyMeadMe = 'third-party/README.md';
  if (!fs.existsSync(thirdPartyMeadMe)) {
    console.log(`missing ${thirdPartyMeadMe} file.`);
    process.exit(1);
  }
}

disallowGitSubmodules();
checkDoguWorkspaceFile();
checkThirdPartyReadMe();
