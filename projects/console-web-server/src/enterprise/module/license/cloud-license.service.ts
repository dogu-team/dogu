import { CloudLicenseBase, CloudLicenseMessage, CreateCloudLicenseDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, setAxiosErrorFilterToIntercepter, transformAndValidate } from '@dogu-tech/common';
import { WebSocketClientFactory } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WebSocket } from 'ws';

import { env } from '../../../env';
import { DoguLogger } from '../../../module/logger/logger';
import { getBillingServerWebSocketUrl } from './common/utils';

export interface CloudLicenseLiveTestingFreeSecondsHandler {
  onOpen: (close: () => void) => void;
  onMessage: (message: CloudLicenseMessage.LiveTestingReceive) => void;
}

@Injectable()
export class CloudLicenseService {
  private readonly api: axios.AxiosInstance;

  constructor(private readonly logger: DoguLogger) {
    this.api = axios.create({
      baseURL: env.DOGU_BILLING_SERVER_URL,
    });
    setAxiosErrorFilterToIntercepter(this.api);
  }

  async createLicense(dto: CreateCloudLicenseDto): Promise<CloudLicenseBase> {
    try {
      const response = await this.api.post<CloudLicenseBase>('/cloud-licenses', dto);
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  async getLicenseInfo(organizationId: OrganizationId): Promise<CloudLicenseBase> {
    try {
      const response = await this.api.get<CloudLicenseBase>(`/cloud-licenses/${organizationId}`);
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  async startUpdateLiveTesting(cloudLicenseId: string, handler: CloudLicenseLiveTestingFreeSecondsHandler): Promise<void> {
    const intervalSeconds = 5;
    const url = `${getBillingServerWebSocketUrl()}/cloud-license/live-testing`;
    const webSocket = new WebSocketClientFactory().create({ url });
    webSocket.on('open', () => {
      let updatedAt = Date.now();
      const update = () => {
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

      const close = () => {
        update();
        closeWebSocketWithTruncateReason(webSocket, 1000, 'closed');
      };
      handler.onOpen(close);
    });

    webSocket.on('message', (data) => {
      (async () => {
        const receiveMessage = await transformAndValidate(CloudLicenseMessage.LiveTestingReceive, JSON.parse(data.toString()));
        if (receiveMessage.cloudLicenseId !== cloudLicenseId) {
          this.logger.error('LiveSessionService.startUpdateLiveTesting.message cloudLicenseId not matched', {
            cloudLicenseId,
            receiveMessage,
          });
          return;
        }

        handler.onMessage(receiveMessage);
      })().catch((error) => {
        this.logger.error('LiveSessionService.startUpdateLiveTesting.message error', {
          error,
          cloudLicenseId,
        });
      });
    });
  }
}
