import { Printable } from '@dogu-tech/common';
import { AppConfigService } from '../app-config/service';
import { ExternalService } from '../external/service';
import { FeatureConfigService } from '../index';
import { DeviceServerChild } from './device-server/child';
import { HostAgentChild } from './host-agent/child';
import { ChildService } from './service';
import { ChildListener, ChildMap } from './types';

export interface ChildServiceFactoryOptions {
  appConfigService: AppConfigService;
  featureConfigService: FeatureConfigService;
  externalService: ExternalService;
  logsPath: string;
  listener: ChildListener;
  logger: Printable;
}

export class ChildServiceFactory {
  constructor(private readonly options: ChildServiceFactoryOptions) {}

  create(): ChildService {
    const { appConfigService, featureConfigService, externalService, logsPath, listener, logger } = this.options;
    const childMap: ChildMap = {
      'device-server': new DeviceServerChild(appConfigService, featureConfigService, externalService, logsPath, listener, logger),
      'host-agent': new HostAgentChild(appConfigService, featureConfigService, logsPath, listener, logger),
    };

    const service = new ChildService({ childMap, appConfigService, logger });
    return service;
  }
}
