import { Serial } from '@dogu-private/types';
import { delay, loop, Printable } from '@dogu-tech/common';
import { ChildProcess, DirectoryRotation, redirectFileToStream } from '@dogu-tech/node';
import child_process from 'child_process';
import { randomUUID } from 'crypto';
import { glob } from 'glob';
import path from 'path';
import { logger } from '../../../logger/logger.instance';

const directoryRotation = new DirectoryRotation('xctest', 1440);

const XcodeBuildCommand = 'xcodebuild';

export async function validateXcodeBuild(): Promise<void> {
  try {
    await ChildProcess.exec(`${XcodeBuildCommand} -version`, {}, logger);
  } catch (error) {
    const message = `
1. install xcode
2. execute change xcode path command: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
3. show xcode path command: sudo xcode-select -p
4. validate xcode command: xcodebuild -version`;
    throw new Error(`xcode not found. ${message}`);
  }
}

export class XCTestRunContext {
  public isAlive = true;
  private logs = '';
  constructor(private readonly tempDirPath: string, public readonly proc: child_process.ChildProcess, private readonly logger: Printable) {
    const redirectContext = { stop: false };
    proc.on('close', (code, signal) => {
      this.isAlive = false;
      redirectContext.stop = true;
    });
    this.redirectOutput(tempDirPath, proc, redirectContext).catch((err) => {
      this.logger.error(err);
    });
  }
  public kill(): void {
    this.proc.kill();
  }

  private async redirectOutput(tempDirPath: string, proc: child_process.ChildProcess, redirectContext: { stop: boolean }): Promise<void> {
    let fileName = '';
    for await (const _ of loop(1000, 10)) {
      const files = await glob('**/StandardOutputAndStandardError.txt', { cwd: tempDirPath, nocase: true });
      if (0 < files.length) {
        fileName = files[0];
        break;
      }
      await delay(1000);
    }
    const outputPath = path.resolve(tempDirPath, fileName);
    this.logger.info(`StandardOutputAndStandardError.txt path: ${outputPath}`);
    redirectFileToStream(outputPath, redirectContext, {
      write: (str: string): boolean => {
        this.logger.verbose?.(str);
        this.logs += str;
        this.checkLog();
        if (!this.isAlive) {
          proc.kill();
        }
        return true;
      },
    }).catch((err) => {
      proc.kill();
      this.logger.error(err);
      this.isAlive = false;
      redirectContext.stop = true;
    });
  }

  private checkLog(): void {
    if (this.logs.includes('TEST EXECUTE FAILED') || this.logs.includes('BUILD INTERRUPTED')) {
      this.isAlive = false;
    }
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(1000);
    }
  }
}

export async function removeOldWaves(): Promise<void> {
  await directoryRotation.removeOldWaves();
}

export function testWithoutBuilding(xctestrunPath: string, serial: Serial, printable: Printable): XCTestRunContext {
  const tempDirPath = `${directoryRotation.getCurrentWavePath()}/${randomUUID()}`;
  const proc = ChildProcess.spawnSync(
    XcodeBuildCommand,
    ['test-without-building', '-xctestrun', `${xctestrunPath}`, '-destination', `id=${serial}`, '-resultBundlePath', tempDirPath],
    {},
    printable,
  );

  return new XCTestRunContext(tempDirPath, proc, printable);
}
