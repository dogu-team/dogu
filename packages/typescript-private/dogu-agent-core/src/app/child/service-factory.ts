import { Printable } from '@dogu-tech/common';
import { AppConfigService } from '../app-config/service';
import { ExternalService } from '../external/service';
import { DeviceServerChild } from './device-server/child';
import { HostAgentChild } from './host-agent/child';
import { ChildService } from './service';
import { ChildListener, ChildMap } from './types';

export interface ChildServiceFactoryOptions {
  appConfigService: AppConfigService;
  externalService: ExternalService;
  logsPath: string;
  listener: ChildListener;
  logger: Printable;
}

export class ChildServiceFactory {
  constructor(private readonly options: ChildServiceFactoryOptions) {}

  create(): ChildService {
    const { appConfigService, externalService, logsPath, listener, logger } = this.options;
    const childMap: ChildMap = {
      'device-server': new DeviceServerChild(appConfigService, externalService, logsPath, listener, logger),
      'host-agent': new HostAgentChild(appConfigService, logsPath, listener, logger),
    };

    const service = new ChildService({ childMap, appConfigService, logger });
    return service;
  }
}
