import { errorify, Printable } from '@dogu-tech/common';
import { ThirdPartyPathMap } from '@dogu-tech/types';
import { setInterval } from 'timers/promises';
import { DotenvConfigKey } from '../../shares/dotenv-config';
import { ExternalKey, ValidationCheckOption } from '../../shares/external';
import { AppConfigService } from '../app-config/service';
import { DotenvConfigService } from '../dotenv-config/service';
import { ExternalUnitCallback, UnitCallbackFactory } from './types';
import { IExternalUnit } from './unit';
import { AndroidSdkExternalUnit } from './units/android-sdk';
import { AppiumExternalUnit } from './units/appium';
import { AppiumUiAutomator2DriverExternalUnit } from './units/appium-uiautomator2-driver';
import { AppiumXcUiTestDriverExternalUnit } from './units/appium-xcuitest-driver';
import { GeckoDriverExternalUnit } from './units/gecko-driver';
import { IdaBuildExternalUnit } from './units/ida-build';
import { JdkExternalUnit } from './units/jdk';
import { LibimobledeviceExternalUnit } from './units/libimobiledevice';
import { SeleniumServerExternalUnit } from './units/selenium-server';
import { WdaBuildExternalUnit } from './units/wda-build';
import { XcodeExternalUnit } from './units/xcode';

export interface ExternalServiceOptions {
  dotenvConfigService: DotenvConfigService;
  appConfigService: AppConfigService;
  thirdPartyPathMap: ThirdPartyPathMap;
  unitCallbackFactory: UnitCallbackFactory;
  logger: Printable;
}

export class ExternalService {
  private units: Map<ExternalKey, IExternalUnit> = new Map();
  private dotenvConfigService: DotenvConfigService;
  private appConfigService: AppConfigService;
  private thirdPartyPathMap: ThirdPartyPathMap;
  private unitCallbackFactory: UnitCallbackFactory;
  private logger: Printable;

  constructor(options: ExternalServiceOptions) {
    this.dotenvConfigService = options.dotenvConfigService;
    this.appConfigService = options.appConfigService;
    this.thirdPartyPathMap = options.thirdPartyPathMap;
    this.unitCallbackFactory = options.unitCallbackFactory;
    this.logger = options.logger;
    this.registerUnits();
  }

  private registerUnits(): void {
    this.registerUnit('jdk', (unitCallback) => new JdkExternalUnit(this.dotenvConfigService, this.appConfigService, unitCallback, this.logger));
    this.registerUnit('android-sdk', (unitCallback) => new AndroidSdkExternalUnit(this.dotenvConfigService, this.appConfigService, unitCallback, this.logger));
    this.registerUnit('appium', (unitCallback) => new AppiumExternalUnit(this.dotenvConfigService, this.appConfigService, unitCallback, this.thirdPartyPathMap, this.logger));
    this.registerUnit(
      'appium-uiautomator2-driver',
      (unitCallback) => new AppiumUiAutomator2DriverExternalUnit(this.dotenvConfigService, this.appConfigService, unitCallback, this.thirdPartyPathMap, this.logger),
    );
    this.registerUnit('xcode', () => new XcodeExternalUnit(this.logger));
    this.registerUnit(
      'appium-xcuitest-driver',
      (unitCallback) => new AppiumXcUiTestDriverExternalUnit(this.dotenvConfigService, this.appConfigService, unitCallback, this.thirdPartyPathMap, this.logger),
    );
    this.registerUnit('libimobiledevice', (unitCallback) => new LibimobledeviceExternalUnit(this.appConfigService, unitCallback, this.logger));
    this.registerUnit('web-driver-agent-build', () => new WdaBuildExternalUnit(this.logger));
    this.registerUnit('ios-device-agent-build', () => new IdaBuildExternalUnit(this.logger));
    this.registerUnit('gecko-driver', (unitCallback) => new GeckoDriverExternalUnit(this.appConfigService, unitCallback, this.logger));
    this.registerUnit('selenium-server', (unitCallback) => new SeleniumServerExternalUnit(this.appConfigService, unitCallback, this.logger));
  }

  private registerUnit(key: ExternalKey, onRegister: (unitCallback: ExternalUnitCallback) => IExternalUnit): void {
    const unit = onRegister(this.unitCallbackFactory(key));
    this.units.set(key, unit);
  }

  getUnit(key: ExternalKey): IExternalUnit {
    const unit = this.units.get(key);
    if (!unit) {
      throw new Error(`external tool unit not found. key: ${key}`);
    }
    return unit;
  }

  getKeys(): ExternalKey[] {
    return [...this.units.keys()];
  }

  getName(key: ExternalKey): string {
    const unit = this.getUnit(key);
    return unit.getName();
  }

  getEnvValue(key: ExternalKey, dotenvConfigKey: DotenvConfigKey): string | undefined {
    const unit = this.getUnit(key);
    return this.dotenvConfigService.get(dotenvConfigKey);
  }

  async writeEnvValue(key: ExternalKey, dotenvConfigKey: DotenvConfigKey, value: string): Promise<void> {
    const unit = this.getUnit(key);
    await this.dotenvConfigService.write(dotenvConfigKey, value);
  }

  async validateSupportedPlatform(): Promise<void> {
    await Promise.all([...this.units.values()].filter((unit) => unit.isPlatformSupported()).map(async (unit) => unit.validate()));
  }

  async isSupportedPlatformValidationCompleted(): Promise<boolean> {
    return Promise.resolve([...this.units.values()].filter((unit) => unit.isPlatformSupported()).every((unit) => unit.lastValidationResult !== null));
  }

  async isSupportedPlatformValid(option: ValidationCheckOption): Promise<boolean> {
    if (option.ignoreManual) {
      return Promise.resolve([...this.units.values()].filter((unit) => unit.isPlatformSupported() && !unit.isManualInstallNeeded()).every((unit) => unit.isValid().valid));
    }
    return Promise.resolve([...this.units.values()].filter((unit) => unit.isPlatformSupported()).every((unit) => unit.isValid().valid));
  }

  async isSupportedPlatformAgreementNeeded(option: ValidationCheckOption): Promise<boolean> {
    let targets: IExternalUnit[] = [];
    if (option.ignoreManual) {
      targets = [...this.units.values()].filter((unit) => unit.isPlatformSupported() && !unit.isManualInstallNeeded());
    } else {
      targets = [...this.units.values()].filter((unit) => unit.isPlatformSupported());
    }
    for (const unit of targets) {
      if (await unit.isAgreementNeeded()) {
        return true;
      }
    }
    return false;
  }

  async updateIsSupportedPlatformValid(): Promise<boolean> {
    const oldValue = this.appConfigService.get<boolean>('DOGU_IS_SUPPORTED_PLATFORM_VALID');
    const newValue = await this.isSupportedPlatformValid({ ignoreManual: true });
    if (oldValue !== newValue) {
      this.appConfigService.set('DOGU_IS_SUPPORTED_PLATFORM_VALID', newValue);
    }
    return newValue;
  }

  private async loopUpdateIsSupportedPlatformValid(): Promise<void> {
    for await (const _ of setInterval(3 * 1000)) {
      await this.updateIsSupportedPlatformValid();
    }
  }

  startLoopUpdateIsSupportedPlatformValid(): void {
    this.loopUpdateIsSupportedPlatformValid().catch((error) => {
      this.logger.error('loopUpdateIsSupportedPlatformValid error', { error: errorify(error) });
    });
  }

  async getSupportedPlatformKeys(): Promise<ExternalKey[]> {
    return Promise.resolve([...this.units.keys()].filter((key) => this.getUnit(key).isPlatformSupported()));
  }
}
