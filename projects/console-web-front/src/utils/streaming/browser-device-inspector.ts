import { Serial } from '@dogu-private/types';
import { Instance } from '@dogu-tech/common';
import {
  ContextPageSource,
  DeviceClientOptions,
  DeviceHttpClient,
  DeviceInspector,
  DeviceService,
  HitPoint,
  TryConnectGamiumInspectorStatus,
} from '@dogu-tech/device-client-common';

export class BrowserDeviceInspector extends DeviceHttpClient {
  constructor(deviceService: DeviceService, options?: DeviceClientOptions) {
    super(deviceService, options);
  }

  async getPageSource(serial: Serial): Promise<string> {
    return '';
    // const pathProvider = new DeviceInspector.getPageSource.pathProvider(serial);
    // const response = await this.httpRequest(DeviceInspector.getPageSource, pathProvider);
    // return response.pageSource;
  }

  async getContexts(serial: Serial): Promise<string[]> {
    const pathProvider = new DeviceInspector.getContexts.pathProvider(serial);
    const response = await this.httpRequest(DeviceInspector.getContexts, pathProvider);
    return response.contexts;
  }

  async getContext(serial: Serial): Promise<string> {
    const pathProvider = new DeviceInspector.getContext.pathProvider(serial);
    const response = await this.httpRequest(DeviceInspector.getContext, pathProvider);
    return response.context;
  }

  async switchContext(serial: Serial, context: string): Promise<void> {
    const pathProvider = new DeviceInspector.switchContext.pathProvider(serial);
    const body: Instance<typeof DeviceInspector.switchContext.requestBody> = {
      context,
    };
    await this.httpRequest(DeviceInspector.switchContext, pathProvider, undefined, body);
  }

  async switchContextAndGetPageSource(serial: Serial, context: string): Promise<string> {
    const pathProvider = new DeviceInspector.switchContextAndGetPageSource.pathProvider(serial);
    const body: Instance<typeof DeviceInspector.switchContextAndGetPageSource.requestBody> = {
      context,
    };
    const response = await this.httpRequest(
      DeviceInspector.switchContextAndGetPageSource,
      pathProvider,
      undefined,
      body,
    );
    return response.pageSource;
  }

  async getContextPageSources(serial: Serial): Promise<ContextPageSource[]> {
    return [];
    const pathProvider = new DeviceInspector.getContextPageSources.pathProvider(serial);
    const response = await this.httpRequest(DeviceInspector.getContextPageSources, pathProvider);
    return response.contextPageSources;
  }

  async tryConnectGamiumInspector(serial: Serial, gamiumEnginePort = 50061): Promise<TryConnectGamiumInspectorStatus> {
    const pathProvider = new DeviceInspector.tryConnectGamiumInspector.pathProvider(serial);
    const body: Instance<typeof DeviceInspector.tryConnectGamiumInspector.requestBody> = {
      gamiumEnginePort,
    };
    const response = await this.httpRequest(DeviceInspector.tryConnectGamiumInspector, pathProvider, undefined, body);
    return response.status;
  }

  async getHitPoint(
    serial: Serial,
    screenPos: { x: number; y: number },
    deviceSize: { width: number; height: number },
  ): Promise<HitPoint | undefined> {
    const pathProvider = new DeviceInspector.getHitPoint.pathProvider(serial);
    const query: Instance<typeof DeviceInspector.getHitPoint.query> = {
      x: screenPos.x,
      y: screenPos.y,
      deviceWidth: deviceSize.width,
      deviceHeight: deviceSize.height,
    };
    const response = await this.httpRequest(DeviceInspector.getHitPoint, pathProvider, query);
    return response.hitPoint;
  }
}
