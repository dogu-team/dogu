import path from 'path';
import * as shelljs from 'shelljs';

export function copyForce(src: string, dest: string): void {
  shelljs.mkdir('-p', path.dirname(dest));
  shelljs.rm('-rf', dest);
  if (0 != shelljs.cp('-f', src, dest).code) {
    process.exit(1);
  }
  if (0 != shelljs.chmod('-v', '+x', dest).code) {
    process.exit(1);
  }
}
