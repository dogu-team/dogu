import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function validateXcode(logger: { stdout: (message: string) => void; stderr: (message: string) => void }): Promise<void> {
  const command = 'xcodebuild -version';
  logger.stdout(command);
  const { stdout, stderr } = await execAsync(command);
  if (stdout) {
    logger.stdout(stdout);
  }
  if (stderr) {
    logger.stderr(stderr);
  }
  if (stderr) {
    throw new Error(stderr);
  } else if (stdout) {
    return;
  } else {
    throw new Error('unexpected error');
  }
}
