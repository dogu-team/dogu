import { FilledPrintable } from '@dogu-tech/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function validateXcode(logger: FilledPrintable): Promise<void> {
  const command = 'xcodebuild -version';
  logger.info(command);
  const { stdout, stderr } = await execAsync(command, {
    timeout: 30 * 1000,
  });
  if (stdout) {
    logger.info(stdout);
  }
  if (stderr) {
    logger.error(stderr);
  }
  if (stderr) {
    throw new Error(stderr);
  } else if (stdout) {
    return;
  } else {
    throw new Error('unexpected error');
  }
}
