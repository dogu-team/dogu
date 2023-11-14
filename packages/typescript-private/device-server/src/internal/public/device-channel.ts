import {
  DeviceAlert,
  DeviceSystemInfo,
  DeviceWindowInfo,
  ErrorResult,
  FilledRuntimeInfo,
  GeoLocation,
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
import { AppiumContext } from '../../appium/appium.context';
import { AppiumRemoteContextRental } from '../../appium/appium.context.proxy';
import { AppiumService } from '../../appium/appium.service';
import { BrowserManagerService } from '../../browser-manager/browser-manager.service';
import { DeviceHostResignAppFileService } from '../../device-host/device-host.resign-app-file';
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
  get resignService(): DeviceHostResignAppFileService;
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
  forward(hostPort: number, devicePort: number, handler: LogHandler): PromiseOrValue<void>;
  unforward(hostPort: number): PromiseOrValue<void>;
  subscribeLog(args: string[], handler: LogHandler): PromiseOrValue<Closable>;
  joinWifi(ssid: string, password: string): PromiseOrValue<void>;
  isPortListening(port: number): PromiseOrValue<boolean>;
  getWindows(): PromiseOrValue<DeviceWindowInfo[]>;

  // ui
  getAlert(): PromiseOrValue<DeviceAlert | undefined>;
  getScreenshot(): PromiseOrValue<string>;

  // app
  uninstallApp(appPath: string, handler: LogHandler): PromiseOrValue<void>;
  installApp(appPath: string, handler: LogHandler): PromiseOrValue<void>;
  runApp(appPath: string, handler: LogHandler): PromiseOrValue<void>;

  // appium
  getAppiumContext(): PromiseOrValue<AppiumContext | null>;
  getAppiumCapabilities(): PromiseOrValue<AppiumCapabilities | null>;
  rentAppiumRemoteContext(reason: string): Promise<AppiumRemoteContextRental>;

  // gamium
  set gamiumContext(context: GamiumContext | null);
  get gamiumContext(): GamiumContext | null;

  // remote test handlers
  getWebDriverHandler(): DeviceWebDriverHandler | null;

  // locale
  getLocale(): PromiseOrValue<LocaleCode>;
  setLocale(localeCode: LocaleCode): PromiseOrValue<void>;

  // GeoLocation
  getGeoLocation(): PromiseOrValue<GeoLocation>;
  setGeoLocation(geoLocation: GeoLocation): PromiseOrValue<void>;
}
