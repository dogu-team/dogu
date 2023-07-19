import _ from 'lodash';
import { remote, RemoteOptions } from 'webdriverio';
import { DoguConfig } from './dogu-config.js';

export class DriverFactory {
  async create(doguConfig: DoguConfig): Promise<WebdriverIO.Browser> {
    const { protocol, hostname, port } = doguConfig.parseApiBaseUrl();

    const options: RemoteOptions = {
      logLevel: 'debug',
      protocol,
      hostname,
      port,
      path: '/remote/wd/hub',
      capabilities: {},
    };

    const doguOptions = {
      token: doguConfig.token,
      organizationId: doguConfig.organizationId,
      projectId: doguConfig.projectId,
      runsOn: doguConfig.runsOn,
      browserName: doguConfig.browserName,
      browserVersion: doguConfig.browserVersion,
      appVersion: doguConfig.appVersion,
    };
    _.set(options, 'capabilities.dogu:options', doguOptions);

    return remote(options);
  }
}
