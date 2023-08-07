import { Param, Result, WebSocketProxyId, WebSocketProxyReceive } from '@dogu-private/console-host-agent';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { transformAndValidate } from '@dogu-tech/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from '../../config';
import { DoguLogger } from '../logger/logger';
import { DoguTimestampLogger } from '../logger/timestamp-logger';

@Injectable()
export class DeviceMessageQueue {
  constructor(@InjectRedis() private readonly redis: Redis, private readonly logger: DoguLogger, private readonly timestamplogger: DoguTimestampLogger) {}

  async pushParam(organizationId: OrganizationId, deviceId: DeviceId, param: Param): Promise<void> {
    const key = config.redis.key.deviceParam(organizationId, deviceId);
    const data = JSON.stringify(param);
    await this.rpushWithExpire(key, data);
  }

  async popParamDatas(organizationId: OrganizationId, deviceId: DeviceId, count: number): Promise<string[]> {
    const key = config.redis.key.deviceParam(organizationId, deviceId);
    const result = await this.redis.lpop(key, count);
    return result ?? [];
  }

  async pushResult(organizationId: OrganizationId, deviceId: DeviceId, resultId: string, result: Result): Promise<void> {
    const key = config.redis.key.deviceResult(organizationId, deviceId, resultId);
    const data = JSON.stringify(result);
    await this.rpushWithExpire(key, data);
  }

  popResultData(organizationId: OrganizationId, deviceId: DeviceId, resultId: string): Promise<string | null> {
    const key = config.redis.key.deviceResult(organizationId, deviceId, resultId);
    return this.redis.lpop(key);
  }

  async deleteResult(organizationId: OrganizationId, deviceId: DeviceId, resultId: string): Promise<void> {
    const key = config.redis.key.deviceResult(organizationId, deviceId, resultId);
    await this.redis.del(key);
  }

  async pushWebSocketProxyReceive(organizationId: OrganizationId, deviceId: DeviceId, webSocketProxyId: WebSocketProxyId, receive: WebSocketProxyReceive): Promise<void> {
    const key = config.redis.key.WebSocketProxyReceive(organizationId, deviceId, webSocketProxyId);
    const data = JSON.stringify(receive);
    await this.rpushWithExpire(key, data);
  }

  async popWebSocketProxyReceives(organizationId: OrganizationId, deviceId: DeviceId, webSocketProxyId: WebSocketProxyId, count: number): Promise<WebSocketProxyReceive[]> {
    const key = config.redis.key.WebSocketProxyReceive(organizationId, deviceId, webSocketProxyId);
    const popsOrNull = await this.redis.lpop(key, count);
    const pops = popsOrNull ?? [];
    const validateds: WebSocketProxyReceive[] = [];
    const befValidate = Date.now();
    for (const pop of pops) {
      try {
        const validated = await transformAndValidate(WebSocketProxyReceive, JSON.parse(pop));
        validateds.push(validated);
      } catch (error) {
        this.logger.error(error);
      }
    }
    return validateds;
  }

  private async rpushWithExpire(key: string, data: string): Promise<void> {
    await this.redis.rpush(key, data);
    await this.redis.expire(key, config.redis.expireSeconds);
  }
}
