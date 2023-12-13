import { BillingPlanType, CloudLicenseBase, CloudLicenseUpdateMessage, CreateCloudLicenseDto, FindCloudLicenseDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { WebSocketClientFactory } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WebSocket } from 'ws';

import { env } from '../../../env';
import { FeatureConfig } from '../../../feature.config';
import { DoguLogger } from '../../../module/logger/logger';
import { getBillingServerWebSocketUrl, updateAuthHeaderByBillingApiToken } from './common/utils';

const CloudLicenseUpdateIntervalSeconds = 5;

export type StartCloudLicenseUpdateOptions = {
  organizationId: string;
  planType: BillingPlanType;
  key: string;
  value: string;
};

type CloudLicenseUpdaterKeyOptions = Pick<StartCloudLicenseUpdateOptions, 'key' | 'value'>;

export type StopCloudLicenseUpdateOptions = CloudLicenseUpdaterKeyOptions;

export type StopCloudLicenseUpdate = () => void;

function createUpdaterKey(options: CloudLicenseUpdaterKeyOptions): string {
  const { key, value } = options;
  return `${key}:${value}`;
}

@Injectable()
export class CloudLicenseService {
  private readonly api: axios.AxiosInstance;
  private readonly updaterMap = new Map<string, WebSocket>();

  constructor(private readonly logger: DoguLogger) {
    this.api = axios.create({
      baseURL: env.DOGU_BILLING_SERVER_URL,
    });
    setAxiosErrorFilterToIntercepter(this.api);
    if (FeatureConfig.get('licenseModule') === 'cloud') {
      updateAuthHeaderByBillingApiToken(this.api.defaults.headers);
    }
  }

  async createLicense(dto: CreateCloudLicenseDto): Promise<CloudLicenseBase> {
    const response = await this.api.post<CloudLicenseBase>('/cloud-licenses', dto);
    return response.data;
  }

  async getLicenseInfo(organizationId: OrganizationId): Promise<CloudLicenseBase> {
    const query: FindCloudLicenseDto = {
      organizationId,
    };
    const response = await this.api.get<CloudLicenseBase>(`/cloud-licenses`, {
      params: query,
    });
    return response.data;
  }

  async startUpdate(options: StartCloudLicenseUpdateOptions): Promise<StopCloudLicenseUpdate> {
    return new Promise((resolve, reject) => {
      const { organizationId, planType } = options;
      const updaterKey = createUpdaterKey(options);
      if (this.updaterMap.has(updaterKey)) {
        resolve(() => {});
        return;
      }

      const url = `${getBillingServerWebSocketUrl()}/cloud-licenses/update?token=${env.DOGU_BILLING_TOKEN}`;
      const webSocket = new WebSocketClientFactory().create({ url });
      webSocket.on('open', () => {
        let updatedAt = Date.now();

        const update = (): void => {
          if (webSocket.readyState !== WebSocket.OPEN) {
            return;
          }

          const now = Date.now();
          const diff = now - updatedAt;
          const usedSeconds = Math.floor(diff / 1000);
          updatedAt = now;
          const message: CloudLicenseUpdateMessage = {
            organizationId,
            planType,
            usedSeconds,
          };
          webSocket.send(JSON.stringify(message));
        };

        let intervalTimer: NodeJS.Timer | undefined = setInterval(() => {
          if (webSocket.readyState !== WebSocket.OPEN) {
            clearInterval(intervalTimer);
            intervalTimer = undefined;
            return;
          }

          update();
        }, CloudLicenseUpdateIntervalSeconds * 1000);

        webSocket.on('close', () => {
          this.updaterMap.delete(updaterKey);
        });
        this.updaterMap.set(updaterKey, webSocket);

        resolve(() => {
          this.stopUpdate(options);
        });
      });

      webSocket.on('error', (error) => {
        this.logger.error(`websocket error occurred`, { error });
        reject(error);
      });
    });
  }

  stopUpdate(options: StopCloudLicenseUpdateOptions): void {
    const updaterKey = createUpdaterKey(options);
    const webSocket = this.updaterMap.get(updaterKey);
    if (!webSocket) {
      return;
    }

    closeWebSocketWithTruncateReason(webSocket, 1000, 'closed');
    this.updaterMap.delete(updaterKey);
  }
}
