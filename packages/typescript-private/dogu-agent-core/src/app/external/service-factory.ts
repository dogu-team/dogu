import { Printable } from '@dogu-tech/common';
import { ThirdPartyPathMap } from '@dogu-tech/types';
import { AppConfigService } from '../app-config/service';
import { DotenvConfigService } from '../dotenv-config/service';
import { ExternalService } from './service';
import { UnitCallbackFactory } from './types';

export interface ExternalServiceFactoryOptions {
  dotenvConfigService: DotenvConfigService;
  appConfigService: AppConfigService;
  thirdPartyPathMap: ThirdPartyPathMap;
  unitCallbackFactory: UnitCallbackFactory;
  logger: Printable;
}

export class ExternalServiceFactory {
  constructor(private readonly options: ExternalServiceFactoryOptions) {}

  async create(): Promise<ExternalService> {
    const service = new ExternalService(this.options);
    await service.validateSupportedPlatform();
    await service.updateIsSupportedPlatformValid();
    return service;
  }
}
