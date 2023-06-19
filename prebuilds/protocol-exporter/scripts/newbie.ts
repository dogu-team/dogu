import * as shelljs from 'shelljs';

if (process.platform == 'darwin') {
  shelljs.exec('brew install clang-format');
}
