import { DotenvConfigKey, DownloadProgress, ExternalLoader, ExternalService as Impl, IExternalUnit, UnitCallbackFactory } from '@dogu-private/dogu-agent-core';
import { Printable, stringify } from '@dogu-tech/common';
import { ipcMain } from 'electron';
import { externalCallbackKey, externalKey, ExternalKey, ValidationCheckOption } from '../../src/shares/external';
import { AppConfigService } from '../app-config/app-config-service';
import { DotEnvConfigService } from '../dot-env-config/dot-env-config-service';
import { logger } from '../log/logger.instance';
import { StdLogCallbackService } from '../log/std-log-callback-service';
import { ThirdPartyPathMap } from '../path-map';
import { WindowService } from '../window/window-service';

export class ExternalService {
  static instance: ExternalService;

  static async open(
    dotenvConfigService: DotEnvConfigService,
    stdLogCallbackService: StdLogCallbackService,
    appConfigService: AppConfigService,
    windowService: WindowService,
  ): Promise<void> {
    const unitCallbackFactory: UnitCallbackFactory = (key: ExternalKey) => {
      return {
        onDownloadStarted: () => {
          windowService.window?.webContents.send(externalCallbackKey.onDownloadStarted, key);
        },
        onDownloadInProgress: (progress: DownloadProgress) => {
          windowService.window?.webContents.send(externalCallbackKey.onDownloadInProgress, key, progress);
        },
        onDownloadCompleted: () => {
          windowService.window?.webContents.send(externalCallbackKey.onDownloadCompleted, key);
        },
        onInstallStarted: () => {
          windowService.window?.webContents.send(externalCallbackKey.onInstallStarted, key);
        },
        onInstallCompleted: () => {
          windowService.window?.webContents.send(externalCallbackKey.onInstallCompleted, key);
        },
      };
    };

    const loggerImpl: Printable = {
      error: (message: unknown, details?: Record<string, unknown>) => {
        stdLogCallbackService.stderr(`[ExternalService] ${message}` + (details ? ` ${stringify(details)}` : ''));
      },
      warn: (message: unknown, details?: Record<string, unknown>) => {
        stdLogCallbackService.stdout(`[ExternalService] ${message}` + (details ? ` ${stringify(details)}` : ''));
      },
      info: (message: unknown, details?: Record<string, unknown>) => {
        stdLogCallbackService.stdout(`[ExternalService] ${message}` + (details ? ` ${stringify(details)}` : ''));
      },
      debug: (message: unknown, details?: Record<string, unknown>) => {
        logger.debug(`[ExternalService] ${message}`, details);
      },
      verbose: (message: unknown, details?: Record<string, unknown>) => {
        logger.verbose(`[ExternalService] ${message}`, details);
      },
    };

    const impl = await new ExternalLoader({
      dotenvConfigService: dotenvConfigService.impl,
      appConfigService: appConfigService.impl,
      thirdPartyPathMap: ThirdPartyPathMap,
      unitCallbackFactory,
      logger: loggerImpl,
    }).load();

    ExternalService.instance = new ExternalService(impl);
    const { instance } = ExternalService;
    instance.registerHandlers();
  }

  private constructor(readonly impl: Impl) {}

  private registerHandlers(): void {
    ipcMain.handle(externalKey.getKeys, () => this.getKeys());
    ipcMain.handle(externalKey.isPlatformSupported, (_, key: ExternalKey) => this.getUnit(key).isPlatformSupported());
    ipcMain.handle(externalKey.getName, (_, key: ExternalKey) => this.getName(key));
    ipcMain.handle(externalKey.getEnvKeys, (_, key: ExternalKey) => this.getUnit(key).getEnvKeys());
    ipcMain.handle(externalKey.getEnvValue, (_, key: ExternalKey, dotEnvConfigKey: DotenvConfigKey) => this.getEnvValue(key, dotEnvConfigKey));
    ipcMain.handle(externalKey.writeEnvValue, (_, key: ExternalKey, dotEnvConfigKey: DotenvConfigKey, value: string) => this.writeEnvValue(key, dotEnvConfigKey, value));
    ipcMain.handle(externalKey.getLastValidationResult, (_, key: ExternalKey) => this.getUnit(key).lastValidationResult);
    ipcMain.handle(externalKey.isAgreementNeeded, (_, key: ExternalKey) => this.getUnit(key).isAgreementNeeded());
    ipcMain.handle(externalKey.writeAgreement, (_, key: ExternalKey, value: boolean) => this.getUnit(key).writeAgreement(value));
    ipcMain.handle(externalKey.isInstallNeeded, (_, key: ExternalKey) => this.getUnit(key).isInstallNeeded());
    ipcMain.handle(externalKey.isManualInstallNeeded, (_, key: ExternalKey) => this.getUnit(key).isManualInstallNeeded());
    ipcMain.handle(externalKey.install, (_, key: ExternalKey) => this.getUnit(key).install());
    ipcMain.handle(externalKey.uninstall, (_, key: ExternalKey) => this.getUnit(key).uninstall());
    ipcMain.handle(externalKey.cancelInstall, (_, key: ExternalKey) => this.getUnit(key).cancelInstall());
    ipcMain.handle(externalKey.validate, (_, key: ExternalKey) => this.getUnit(key).validate());
    ipcMain.handle(externalKey.isValid, (_, key: ExternalKey) => this.getUnit(key).isValid());
    ipcMain.handle(externalKey.isSupportedPlatformValidationCompleted, () => this.isSupportedPlatformValidationCompleted());
    ipcMain.handle(externalKey.isSupportedPlatformValid, (_, option: ValidationCheckOption) => this.isSupportedPlatformValid(option));
    ipcMain.handle(externalKey.isSupportedPlatformAgreementNeeded, (_, option: ValidationCheckOption) => this.isSupportedPlatformAgreementNeeded(option));
    ipcMain.handle(externalKey.getSupportedPlatformKeys, () => this.getSupportedPlatformKeys());
    ipcMain.handle(externalKey.getTermUrl, (_, key: ExternalKey) => this.getUnit(key).getTermUrl());
  }

  private getUnit(key: ExternalKey): IExternalUnit {
    return this.impl.getUnit(key);
  }

  private getKeys(): ExternalKey[] {
    return this.impl.getKeys();
  }

  private getName(key: ExternalKey): string {
    return this.impl.getName(key);
  }

  private getEnvValue(key: ExternalKey, dotenvConfigKey: DotenvConfigKey): string | undefined {
    return this.impl.getEnvValue(key, dotenvConfigKey);
  }

  private async writeEnvValue(key: ExternalKey, dotenvConfigKey: DotenvConfigKey, value: string): Promise<void> {
    await this.impl.writeEnvValue(key, dotenvConfigKey, value);
  }

  private async validateSupportedPlatform(): Promise<void> {
    await this.impl.validateSupportedPlatform();
  }

  private async isSupportedPlatformValidationCompleted(): Promise<boolean> {
    return await this.impl.isSupportedPlatformValidationCompleted();
  }

  private async isSupportedPlatformValid(option: ValidationCheckOption): Promise<boolean> {
    return await this.impl.isSupportedPlatformValid(option);
  }

  private async isSupportedPlatformAgreementNeeded(option: ValidationCheckOption): Promise<boolean> {
    return await this.isSupportedPlatformAgreementNeeded(option);
  }

  async updateIsSupportedPlatformValid(): Promise<boolean> {
    return await this.impl.updateIsSupportedPlatformValid();
  }

  private async getSupportedPlatformKeys(): Promise<ExternalKey[]> {
    return await this.impl.getSupportedPlatformKeys();
  }
}
