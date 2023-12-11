import path from 'path';
import shell from 'shelljs';

const args = process.argv.slice(2);
const dirPath = 'nm-space/projects/env-generator/bin';

function getBinaryPath() {
  if (process.platform === 'darwin') {
    return path.resolve(dirPath, 'env-generator');
  } else if (process.platform === 'win32') {
    return path.resolve(dirPath, 'env-generator.exe');
  } else {
    return path.resolve(dirPath, 'env-generator-linux');
  }
}

const binaryPath = getBinaryPath();
shell.chmod('+x', binaryPath);
if (shell.exec(`${binaryPath} ${args.join(' ')}`).code !== 0) {
  shell.echo('Error: env-generator failed');
  shell.exit(1);
}
