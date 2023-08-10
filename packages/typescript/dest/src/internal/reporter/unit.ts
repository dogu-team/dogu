import { DefaultHttpOptions, Instance, Printable, PromiseOrValue, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { PublicDest } from '@dogu-tech/console-dest';
import { createConsoleApiAuthHeader, DestId, DestState, destStateStringToStatusEnum, DeviceId, OrganizationId } from '@dogu-tech/types';
import axios from 'axios';
import { Reporter } from './reporter';

export interface ReporterUnitHavable {
  reporterUnit: ReporterUnit;
}

export interface ReporterUnit {
  updateState(state: DestState): PromiseOrValue<void>;
}

export class NullReporterUnit implements ReporterUnit {
  updateState(state: DestState): void {
    // noop
  }
}

export class ConsoleReporterUnit implements ReporterUnit {
  private readonly client = axios.create();

  constructor(
    private readonly reporter: Reporter,
    private readonly printable: Printable,
    private readonly apiBaseUrl: string,
    private readonly organizationid: OrganizationId,
    private readonly deviceId: DeviceId,
    private readonly destId: DestId,
    private readonly DOGU_HOST_TOKEN: string,
  ) {
    setAxiosErrorFilterToIntercepter(this.client);
  }

  async updateState(state: DestState): Promise<void> {
    const { printable, apiBaseUrl, organizationid, deviceId, destId, DOGU_HOST_TOKEN } = this;
    try {
      const pathProvider = new PublicDest.updateDestState.pathProvider(organizationid, deviceId, destId);
      const path = PublicDest.updateDestState.resolvePath(pathProvider);
      const url = `${apiBaseUrl}${path}`;
      const requestBody: Instance<typeof PublicDest.updateDestState.requestBody> = {
        destStatus: destStateStringToStatusEnum(state),
        localTimeStamp: new Date(),
      };
      printable.verbose?.('dest update state', { ...requestBody, url });
      await this.client.patch<typeof PublicDest.updateDestState.responseBody>(url, requestBody, {
        ...createConsoleApiAuthHeader(DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      });
    } catch (error) {
      printable.error('Failed to update dest state', { error: stringify(error) });
    }
  }
}
