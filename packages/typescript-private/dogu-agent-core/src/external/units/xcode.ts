import { PrefixLogger, Printable } from '@dogu-tech/common';
import { ExternalKey } from '../types';
import { IExternalUnit } from '../unit';
import { validateXcode } from '../xcode';

export class XcodeExternalUnit extends IExternalUnit {
  private readonly logger: PrefixLogger;

  constructor(logger: Printable) {
    super();
    this.logger = new PrefixLogger(logger, '[Xcode]');
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
    await validateXcode(this.logger);
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
