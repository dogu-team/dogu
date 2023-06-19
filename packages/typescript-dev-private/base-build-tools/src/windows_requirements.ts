import shelljs from 'shelljs';

function check(path: string): void {
  if (!shelljs.which(path)) {
    shelljs.echo(`Sorry, this script requires ${path}`);
    shelljs.exit(1);
  }
}

check('git');
check('yarn');
check('nvm');
check('npm');
check('node');
check('python');
shelljs.exec('git config --system core.longpaths true'); // administrator permission required

// etc
// LongPathsEnabled : https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation?tabs=registry
// Set-ExecutionPolicy Unrestricted
