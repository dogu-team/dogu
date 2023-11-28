import { setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { DeviceClient, DeviceClientsFactory, DeviceHostClient } from '@dogu-tech/device-client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { DeviceAuthService } from '../device-auth/device-auth.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class DeviceClientService implements OnModuleInit {
  private _axiosClient: AxiosInstance;
  private _deviceClient: DeviceClient | null = null;
  private _deviceHostClient: DeviceHostClient | null = null;

  constructor(
    private readonly authService: DeviceAuthService,
    private readonly logger: DoguLogger,
  ) {
    this._axiosClient = axios.create({
      baseURL: `http://${env.DOGU_DEVICE_SERVER_HOST_PORT}`,
    });
    setAxiosErrorFilterToIntercepter(this._axiosClient);
  }

  onModuleInit(): void {
    const hostPort = env.DOGU_DEVICE_SERVER_HOST_PORT;
    const hostAndPort = hostPort.split(':');
    if (hostAndPort.length !== 2) {
      throw new Error(`Invalid host and port: ${hostPort}`);
    }
    this.logger.info('hello');
    const factory = new DeviceClientsFactory({
      port: Number(hostAndPort[1]),
      printable: {
        warn: this.logger.warn.bind(this.logger),
        debug: this.logger.debug.bind(this.logger),
        verbose: this.logger.verbose.bind(this.logger),
        info: this.logger.info.bind(this.logger),
        error: this.logger.error.bind(this.logger),
      },
      token: this.authService.adminToken,
    });
    const { deviceClient, deviceHostClient } = factory.create();
    this._deviceClient = deviceClient;
    this._deviceHostClient = deviceHostClient;
  }

  get client(): AxiosInstance {
    return this._axiosClient;
  }

  get deviceClient(): DeviceClient {
    if (!this._deviceClient) {
      throw new Error('Device client not initialized');
    }
    return this._deviceClient;
  }

  get deviceHostClient(): DeviceHostClient {
    if (!this._deviceHostClient) {
      throw new Error('Device host client not initialized');
    }
    return this._deviceHostClient;
  }
}
