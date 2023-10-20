import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import 'reflect-metadata';
import { EnvGenerator } from './generator';
import { logger } from './logger';
import { findIdFromProjectName, getAllProjectNameToSheet } from './sheet_ids';

program.name('env-generator').description('CLI to generate dogu env').version('0.8.0');

program
  .command('gen')
  .description('Generate dogu environment to current directory/.env.local')
  .argument('<runtype>', 'runtype')
  .argument('<project>', 'ProjectName')
  .action((runtype, project: string) => {
    const workdir = process.cwd();
    process.env.DOGU_RUN_TYPE = runtype;
    const sheets = findIdFromProjectName(project);
    for (const sheet of sheets) {
      new EnvGenerator(workdir, sheet.id).generate(sheet.name).catch((error) => {
        logger.error(error);
        process.exit(1);
      });
    }
  });

program
  .command('gen-all')
  .description('Generate dogu environment at predefined paths. based on .dogu-workspace location')
  .argument('<runtype>', 'runtype')
  .action((runtype, project: string) => {
    const workdir = findRootWorkspace();
    process.env.DOGU_RUN_TYPE = runtype;
    const nameToSheet = getAllProjectNameToSheet();
    for (const name in nameToSheet) {
      const info = nameToSheet[name as keyof typeof nameToSheet];
      for (const sheet of info.sheets) {
        new EnvGenerator(path.resolve(workdir, info.path), sheet.id).generate(sheet.name).catch((error) => {
          logger.error(`[Failed ${name} / ${sheet.name} / ${sheet.id} error : ${error.message}, ${error.stack}]`);
          process.exit(1);
        });
      }
    }
    return;
  });

program.parse();

export function findRootWorkspace(): string {
  // find .dogu_workspace in parent
  if (fs.existsSync(path.resolve(process.cwd(), 'dogu', '.dogu-workspace'))) {
    return path.resolve(process.cwd(), 'dogu');
  }
  let current = process.cwd();
  for (let i = 0; i < 10; i++) {
    const doguWorkspace = path.resolve(current, '.dogu-workspace');
    if (fs.existsSync(doguWorkspace)) {
      return current;
    }
    const parent = path.resolve(current, '..');
    if (parent === current) {
      break;
    }
    current = parent;
  }

  throw new Error('Cannot find .dogu-workspace');
}
