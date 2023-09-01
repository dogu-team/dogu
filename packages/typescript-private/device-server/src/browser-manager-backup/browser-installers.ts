import { PromiseOrValue } from '@dogu-tech/common';
import { BrowserInstallation, BrowserInstaller, BrowserInstallerOptions } from '@dogu-tech/device-client-common';

export class FirefoxBrowserInstaller implements BrowserInstaller {
  match(options: BrowserInstallerOptions): PromiseOrValue<boolean> {
    throw new Error('Method not implemented.');
  }

  install(options: BrowserInstallerOptions): PromiseOrValue<BrowserInstallation> {
    throw new Error('Method not implemented.');
  }
}
