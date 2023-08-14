import { IAppConfigClient } from './app-config';
import { IChildCallback, IChildClient } from './child';
import { IDeviceLookupClient } from './device-lookup';
import { IDotEnvConfigClient } from './dot-env-config';
import { IExternalCallback, IExternalClient } from './external';
import { IFeatureConfigClient } from './feature-config';
import { ILogger, IStdLogCallback } from './log';
import { IServicesOpenStatusClient } from './services-open-status';
import { ISettingsClient } from './settings';
import { IThemeClient } from './theme';
import { IUpdaterClient } from './updater';
import { IWindowClient } from './window';

export interface IElectronIpc {
  themeClient: IThemeClient;
  appConfigClient: IAppConfigClient;
  settingsClient: ISettingsClient;
  childClient: IChildClient;
  childCallback: IChildCallback;
  rendererLogger: ILogger;
  updaterClient: IUpdaterClient;
  dotEnvConfigClient: IDotEnvConfigClient;
  externalClient: IExternalClient;
  externalCallback: IExternalCallback;
  stdLogCallback: IStdLogCallback;
  windowClient: IWindowClient;
  featureConfigClient: IFeatureConfigClient;
  deviceLookupClient: IDeviceLookupClient;
  servicesOpenStatusClient: IServicesOpenStatusClient;
}

type PropertiesOfWeek<T> = { [K in Extract<keyof T, string>]: string };

export function instanceKeys<T>(name: keyof IElectronIpc): PropertiesOfWeek<T> {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        return `${name}.${typeof prop === 'symbol' ? prop.toString() : prop}`;
      },
      set: (): boolean => {
        throw new Error('Cannot set property on a proxied object');
      },
    },
  ) as PropertiesOfWeek<T>;
}
