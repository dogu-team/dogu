import {
  DeviceSystemInfo,
  DeviceWindowInfo,
  ErrorResult,
  FilledRuntimeInfo,
  LocaleCode,
  Platform,
  PrivateProtocol,
  ProfileMethod,
  ScreenRecordOption,
  Serial,
  StreamingAnswer,
} from '@dogu-private/types';
import { Closable, Printable, PromiseOrValue } from '@dogu-tech/common';
import { AppiumCapabilities, BrowserInstallation, StreamingOfferDto } from '@dogu-tech/device-client-common';
import { Observable } from 'rxjs';
import { DeviceWebDriver } from '../../alias';
import { AppiumContext, AppiumContextKey } from '../../appium/appium.context';
import { AppiumService } from '../../appium/appium.service';
import { BrowserManagerService } from '../../browser-manager/browser-manager.service';
import { DevicePortService } from '../../device-port/device-port.service';
import { DeviceWebDriverHandler } from '../../device-webdriver/device-webdriver.common';
import { GamiumContext } from '../../gamium/gamium.context';
import { GamiumService } from '../../gamium/gamium.service';
import { HttpRequestRelayService } from '../../http-request-relay/http-request-relay.common';
import { DoguLogger } from '../../logger/logger';
import { SeleniumService } from '../../selenium/selenium.service';

type DeviceControl = PrivateProtocol.DeviceControl;

export interface DeviceChannelOpenParam {
  serial: Serial;
}

export interface DeviceHealthStatus {
  isHealthy: boolean;
  message: string;
}

export type LogHandler = Pick<Printable, 'info' | 'error'>;

export interface DeviceServerService {
  get httpRequestRelayService(): HttpRequestRelayService;
  get seleniumEndpointHandlerService(): DeviceWebDriver.SeleniumEndpointHandlerService;
  get appiumEndpointHandlerService(): DeviceWebDriver.AppiumEndpointHandlerService;
  get doguLogger(): DoguLogger;
  get gamiumService(): GamiumService;
  get seleniumService(): SeleniumService;
  get appiumService(): AppiumService;
  get browserManagerService(): BrowserManagerService;
  get devicePortService(): DevicePortService;
}

export interface DeviceChannel {
  get serial(): Serial;
  get serialUnique(): Serial;
  get platform(): Platform;
  get info(): DeviceSystemInfo;
  get isVirtual(): boolean;
  get browserInstallations(): BrowserInstallation[];

  // screen
  startStreamingWebRtcWithTrickle(offer: StreamingOfferDto): PromiseOrValue<Observable<StreamingAnswer>>;
  startRecord(option: ScreenRecordOption): PromiseOrValue<ErrorResult>;
  stopRecord(filePath: string): PromiseOrValue<ErrorResult>;
  turnScreen(isOn: boolean): PromiseOrValue<void>;

  // control
  control(control: DeviceControl): PromiseOrValue<void>;

  // lifecycle
  reboot(): PromiseOrValue<void>;
  checkHealth(): PromiseOrValue<DeviceHealthStatus>;
  reset(): PromiseOrValue<void>;

  // process
  queryProfile(methods: ProfileMethod[] | ProfileMethod): PromiseOrValue<FilledRuntimeInfo>;
  killOnPort(port: number): PromiseOrValue<void>;
  forward(hostPort: number, devicePort: number, printable?: Printable): PromiseOrValue<void>;
  unforward(hostPort: number): PromiseOrValue<void>;
  subscribeLog(args: string[], handler: LogHandler, printable?: Printable): PromiseOrValue<Closable>;
  joinWifi(ssid: string, password: string): PromiseOrValue<void>;
  isPortListening(port: number): PromiseOrValue<boolean>;
  getWindows(): PromiseOrValue<DeviceWindowInfo[]>;

  // app
  uninstallApp(appPath: string, printable?: Printable): PromiseOrValue<void>;
  installApp(appPath: string, printable?: Printable): PromiseOrValue<void>;
  runApp(appPath: string, printable?: Printable): PromiseOrValue<void>;

  // appium
  getAppiumContext(): PromiseOrValue<AppiumContext | null>;
  getAppiumCapabilities(): PromiseOrValue<AppiumCapabilities | null>;
  switchAppiumContext(key: AppiumContextKey): PromiseOrValue<AppiumContext>;

  // gamium
  set gamiumContext(context: GamiumContext | null);
  get gamiumContext(): GamiumContext | null;

  // remote test handlers
  getWebDriverHandler(): DeviceWebDriverHandler | null;

  // locale
  getLocale(): PromiseOrValue<LocaleCode>;
  chagneLocale(localeCode: LocaleCode): PromiseOrValue<void>;
}
