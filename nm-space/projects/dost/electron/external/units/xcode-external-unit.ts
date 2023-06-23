import { PrefixLogger } from '@dogu-tech/common';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { IExternalUnit } from '../external-unit';
import { validateXcode } from '../xcode';

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
    await validateXcode(this.stdLogCallbackService);
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
