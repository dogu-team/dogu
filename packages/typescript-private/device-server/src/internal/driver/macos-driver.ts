import { Platform, Serial } from '@dogu-private/types';
import systeminformation from 'systeminformation';
import { DeviceWebDriver } from '../../alias';
import { env } from '../../env';
import { HttpRequestRelayService } from '../../http-request-relay/http-request-relay.common';
import { DoguLogger } from '../../logger/logger';
import { idcLogger } from '../../logger/logger.instance';
import { SeleniumService } from '../../selenium/selenium.service';
import { MacosChannel } from '../channel/macos-channel';
import { DeviceChannel, DeviceChannelOpenParam } from '../public/device-channel';
import { DeviceDriver, DeviceScanInfo } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';
import { StreamingService } from '../services/streaming/streaming-service';

export class MacosDriver implements DeviceDriver {
  private constructor(
    private readonly streamingService: StreamingService,
    private readonly httpRequestRelayService: HttpRequestRelayService,
    private readonly seleniumEndpointHandlerService: DeviceWebDriver.SeleniumEndpointHandlerService,
    private readonly seleniumService: SeleniumService,
    private readonly doguLogger: DoguLogger,
  ) {}

  static async create(
    httpRequestRelayService: HttpRequestRelayService,
    seleniumEndpointHandlerService: DeviceWebDriver.SeleniumEndpointHandlerService,
    seleniumService: SeleniumService,
    doguLogger: DoguLogger,
  ): Promise<MacosDriver> {
    const streaming = await PionStreamingService.create(Platform.PLATFORM_MACOS, env.DOGU_DEVICE_SERVER_PORT);
    return new MacosDriver(streaming, httpRequestRelayService, seleniumEndpointHandlerService, seleniumService, doguLogger);
  }

  get platform(): Platform {
    return Platform.PLATFORM_MACOS;
  }

  async scanSerials(): Promise<DeviceScanInfo[]> {
    const hostname = (await systeminformation.osInfo()).hostname;
    const uuid = await systeminformation.uuid();
    return [{ serial: uuid.os, status: 'online', name: hostname }];
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    return await MacosChannel.create(initParam, this.streamingService, this.httpRequestRelayService, this.seleniumEndpointHandlerService, this.seleniumService, this.doguLogger);
  }

  async closeChannel(seial: Serial): Promise<void> {
    return await this.streamingService.deviceDisconnected(seial);
  }

  async reset(): Promise<void> {
    idcLogger.warn('MacosDriver.reset is not implemented');
    return await Promise.resolve();
  }
}
