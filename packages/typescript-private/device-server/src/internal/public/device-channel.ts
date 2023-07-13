import {
  DeviceSystemInfo,
  ErrorResult,
  FilledRuntimeInfo,
  Platform,
  PrivateProtocol,
  ProfileMethod,
  ProtoRTCPeerDescription,
  ScreenRecordOption,
  Serial,
  StreamingAnswer,
} from '@dogu-private/types';
import { Closable, Printable, PromiseOrValue } from '@dogu-tech/common';
import { StreamingOfferDto } from '@dogu-tech/device-client-common';
import { Observable } from 'rxjs';
import { AppiumContext, AppiumContextKey } from '../../appium/appium.context';
import { DeviceWebDriverHandler } from '../../device-webdriver/device-webdriver.common';
import { GamiumContext } from '../../gamium/gamium.context';
import { DevicePortContext } from '../types/device-port-context';

type DeviceControl = PrivateProtocol.DeviceControl;

export interface DeviceChannelOpenParam {
  serial: Serial;
  deviceAgentDevicePort: number; // android:
  deviceAgentDeviceSecondPort: number;
  deviceAgentDeviceThirdPort: number;
}

export type LogHandler = Pick<Printable, 'info' | 'error'>;

export interface DeviceChannel {
  get serial(): Serial;
  get platform(): Platform;
  get info(): DeviceSystemInfo;
  get portContext(): DevicePortContext;

  // screen
  startStreamingWebRTC(offer: StreamingOfferDto): PromiseOrValue<ProtoRTCPeerDescription>;
  startStreamingWebRtcWithTrickle(offer: StreamingOfferDto): PromiseOrValue<Observable<StreamingAnswer>>;
  startRecord(option: ScreenRecordOption): PromiseOrValue<ErrorResult>;
  stopRecord(): PromiseOrValue<ErrorResult>;
  turnScreen(isOn: boolean): PromiseOrValue<void>;

  // control
  control(control: DeviceControl): PromiseOrValue<void>;

  // lifecycle
  reboot(): PromiseOrValue<void>;
  reset(): PromiseOrValue<void>;

  // process
  queryProfile(methods: ProfileMethod[] | ProfileMethod): PromiseOrValue<FilledRuntimeInfo>;
  killOnPort(port: number): PromiseOrValue<void>;
  forward(hostPort: number, devicePort: number, printable?: Printable): PromiseOrValue<void>;
  unforward(hostPort: number): PromiseOrValue<void>;
  subscribeLog(args: string[], handler: LogHandler, printable?: Printable): PromiseOrValue<Closable>;
  joinWifi(ssid: string, password: string): PromiseOrValue<void>;

  // app
  uninstallApp(appPath: string, printable?: Printable): PromiseOrValue<void>;
  installApp(appPath: string, printable?: Printable): PromiseOrValue<void>;
  runApp(appPath: string, printable?: Printable): PromiseOrValue<void>;

  // appium
  getAppiumContext(): PromiseOrValue<AppiumContext | null>;
  switchAppiumContext(key: AppiumContextKey): PromiseOrValue<AppiumContext>;

  // gamium
  set gamiumContext(context: GamiumContext | null);
  get gamiumContext(): GamiumContext | null;

  // remote test handlers
  getWebDriverHandler(): DeviceWebDriverHandler | null;
}
