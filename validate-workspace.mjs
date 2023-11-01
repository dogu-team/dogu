import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

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

function checkMigrationFiles() {
  const migrationsPath = 'projects/console-web-server/src/db/migrations';
  if (!fs.existsSync(migrationsPath)) {
    console.log(`missing ${migrationsPath} directory.`);
    process.exit(1);
  }

  const runTypes = fs.readdirSync(migrationsPath);
  const datas = runTypes.map((runType) => {
    const runTypePath = path.resolve(migrationsPath, runType);
    const files = fs.readdirSync(runTypePath);
    return { runType, count: files.length, files };
  });

  if (datas.length === 0) {
    console.log('no migration files by run type.');
    process.exit(1);
  }

  const ignoreFiles = ['1688093782649-typeorm-migration.ts'];
  const filtereds = datas.map(({ files, ...rest }) => ({
    ...rest,
    files: files.filter((file) => !ignoreFiles.includes(file)),
  }));

  const local = filtereds.find(({ runType }) => runType === 'local');
  if (!local) {
    console.log('no local migration files.');
    process.exit(1);
  }

  const others = filtereds.filter(({ runType }) => runType !== 'local');
  for (const other of others) {
    _.zip(local.files, other.files).forEach(([localFile, otherFile]) => {
      if (localFile !== otherFile) {
        console.log(`mismatched migration files: ${localFile} !== ${otherFile}`);
        process.exit(1);
      }
    });
  }
}

disallowGitSubmodules();
checkDoguWorkspaceFile();
checkThirdPartyReadMe();
checkMigrationFiles();
