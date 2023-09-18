import { Printable } from '@dogu-tech/common';
import { ThirdPartyPathMap } from '@dogu-tech/types';
import { AppConfigService } from '../app-config/service';
import { DotenvConfigService } from '../dotenv-config/service';
import { ExternalService } from './service';
import { UnitCallbackFactory } from './types';

export interface ExternalLoaderOptions {
  dotenvConfigService: DotenvConfigService;
  appConfigService: AppConfigService;
  thirdPartyPathMap: ThirdPartyPathMap;
  unitCallbackFactory: UnitCallbackFactory;
  logger: Printable;
}

export class ExternalLoader {
  constructor(private readonly options: ExternalLoaderOptions) {}

  async load(): Promise<ExternalService> {
    const service = new ExternalService(this.options);
    await service.validateSupportedPlatform();
    await service.updateIsSupportedPlatformValid();
    service.startLoopUpdateIsSupportedPlatformValid();
    return service;
  }
}
