import { CloudLicenseBase, CloudLicenseMessage, CreateCloudLicenseDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, errorify, setAxiosErrorFilterToIntercepter, transformAndValidate } from '@dogu-tech/common';
import { rawToString, WebSocketClientFactory } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WebSocket } from 'ws';

import { env } from '../../../env';
import { FeatureConfig } from '../../../feature.config';
import { DoguLogger } from '../../../module/logger/logger';
import { getBillingServerWebSocketUrl, updateAuthHeaderByBillingApiToken } from './common/utils';

export interface CloudLicenseLiveTestingFreeSecondsHandler {
  onOpen: (close: () => void) => Promise<void>;
  onClose: () => Promise<void>;
  onMessage: (message: CloudLicenseMessage.LiveTestingReceive) => Promise<void>;
}

@Injectable()
export class CloudLicenseService {
  private readonly api: axios.AxiosInstance;

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
    const response = await this.api.get<CloudLicenseBase>(`/cloud-licenses/${organizationId}`);
    return response.data;
  }

  startUpdateLiveTesting(cloudLicenseId: string, handler: CloudLicenseLiveTestingFreeSecondsHandler): void {
    const intervalSeconds = 5;
    const url = `${getBillingServerWebSocketUrl()}/cloud-licenses/live-testing?token=${env.DOGU_BILLING_TOKEN}`;
    const webSocket = new WebSocketClientFactory().create({ url });
    webSocket.on('open', () => {
      let updatedAt = Date.now();
      const update = (): void => {
        if (webSocket.readyState !== WebSocket.OPEN) {
          return;
        }

        const now = Date.now();
        const diff = now - updatedAt;
        const usedFreeSeconds = Math.floor(diff / 1000);
        updatedAt = now;
        const message: CloudLicenseMessage.LiveTestingSend = {
          cloudLicenseId,
          usedFreeSeconds,
        };
        webSocket.send(JSON.stringify(message));
      };

      let interval: NodeJS.Timer | undefined = setInterval(() => {
        if (webSocket.readyState !== WebSocket.OPEN) {
          clearInterval(interval);
          interval = undefined;
          return;
        }

        update();
      }, intervalSeconds * 1000);

      const close = (): void => {
        update();
        closeWebSocketWithTruncateReason(webSocket, 1000, 'closed');
      };
      handler.onOpen(close).catch((error) => {
        this.logger.error('LiveSessionService.startUpdateLiveTesting.onOpen error', {
          error: errorify(error),
          cloudLicenseId,
        });
        close();
      });
    });

    webSocket.on('close', () => {
      handler.onClose().catch((error) => {
        this.logger.error('LiveSessionService.startUpdateLiveTesting.onClose error', {
          error: errorify(error),
          cloudLicenseId,
        });
      });
    });

    webSocket.on('message', (data) => {
      (async (): Promise<void> => {
        const receiveMessage = await transformAndValidate(CloudLicenseMessage.LiveTestingReceive, JSON.parse(rawToString(data)));
        if (receiveMessage.cloudLicenseId !== cloudLicenseId) {
          this.logger.error('LiveSessionService.startUpdateLiveTesting.message cloudLicenseId not matched', {
            cloudLicenseId,
            receiveMessage,
          });
          return;
        }

        await handler.onMessage(receiveMessage);
      })().catch((error) => {
        this.logger.error('LiveSessionService.startUpdateLiveTesting.message error', {
          error: errorify(error),
          cloudLicenseId,
        });
      });
    });
  }
}
