import _ from 'lodash';
import { remote, RemoteOptions } from 'webdriverio';
import { Dogu } from './instance.js';

export interface CreateDriverResult {
  driver: WebdriverIO.Browser;
  destroy: () => Promise<void>;
}

export class DriverFactory {
  async create(): Promise<CreateDriverResult> {
    const config = await Dogu.config();
    const { protocol, hostname, port } = config.parseApiBaseUrl();

    const doguOptions = {
      token: config.token,
      organizationId: config.organizationId,
      projectId: config.projectId,
      runsOn: config.runsOn,
      browserName: config.browserName,
    };

    const options: RemoteOptions = {
      logLevel: 'debug',
      protocol,
      hostname,
      port,
      path: '/remote/wd/hub',
      capabilities: {},
    };
    _.set(options, 'capabilities.doguOptions', doguOptions);

    const driver = await remote(options);
    return {
      driver,
      destroy: async () => {
        await driver.deleteSession();
      },
    };
  }
}
