import { PrefixLogger } from '@dogu-tech/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { IExternalUnit } from '../external-unit';

const execAsync = promisify(exec);

export class XcodeExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, '[Xcode]');

  constructor(private readonly stdLogCallbackService: StdLogCallbackService) {
    super();
  }

  isPlatformSupported(): boolean {
    return process.platform === 'darwin';
  }

  isManualInstallNeeded(): boolean {
    return true;
  }

  getKey(): ExternalKey {
    return 'xcode';
  }

  getName(): string {
    return 'XCode';
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    const command = 'xcodebuild -version';
    this.stdLogCallbackService.stdout(command);
    const { stdout, stderr } = await execAsync(command);
    if (stdout) {
      this.stdLogCallbackService.stdout(stdout);
    }
    if (stderr) {
      this.stdLogCallbackService.stderr(stderr);
    }
    this.logger.verbose('xcodebuild -version', { stdout, stderr });
    if (stderr) {
      throw new Error(stderr);
    } else if (stdout) {
      return;
    } else {
      throw new Error('unexpected error');
    }
  }

  isAgreementNeeded(): boolean {
    return false;
  }

  writeAgreement(): void {
    this.logger.warn('do not need agreement');
  }

  install(): void {
    this.logger.warn('install not supported');
  }

  cancelInstall(): void {
    this.logger.warn('cancel install not supported');
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  getTermUrl(): string | null {
    return null;
  }
}
