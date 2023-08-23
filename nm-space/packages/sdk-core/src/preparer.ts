import { createLogger } from './logger.js';

export const TestingType = ['remote-testing', 'routine-testing'] as const;
export type TestingType = (typeof TestingType)[number];

export interface PrepareResult {
  testingType: TestingType;
}

export class Preparer {
  private readonly logger = createLogger(Preparer);

  async prepare(): Promise<PrepareResult> {
    this.logger.verbose('prepare');
    await this.clearTempfiles();
    this.addFileLogger();
    this.parseEnv();
    this.parseArgs();
    this.parseConfig();
    this.updateLogger();
    this.findPackageManager();
    this.findTestingFramework();
    this.validateOptions();
    this.logger.verbose('prepare done');
    return { testingType: 'remote-testing' };
  }

  private async clearTempfiles(): Promise<void> {
    this.logger.verbose('clearTempfiles');
  }

  private addFileLogger(): void {
    this.logger.verbose('addFileLogger');
  }

  private parseEnv(): void {
    this.logger.verbose('parseEnv');
  }

  private parseArgs(): void {
    this.logger.verbose('parseArgs');
  }

  private parseConfig(): void {
    this.logger.verbose('parseConfig');
  }

  private updateLogger(): void {
    this.logger.verbose('updateLogger');
  }

  private findPackageManager(): void {
    this.logger.verbose('findPackageManager');
  }

  private findTestingFramework(): void {
    this.logger.verbose('findTestingFramework');
  }

  private validateOptions(): void {
    this.logger.verbose('validateOptions');
  }
}
