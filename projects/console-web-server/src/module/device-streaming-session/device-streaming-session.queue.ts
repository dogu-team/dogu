import { DeviceId, UserId } from '@dogu-private/types';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from '../../config';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class DeviceStreamingSessionQueue {
  constructor(@InjectRedis() private readonly redis: Redis, private readonly logger: DoguLogger) {}

  async pushData(deviceId: DeviceId, userId: UserId): Promise<void> {
    const key = config.redis.key.deviceStreamingSessionParam(deviceId);
    // await this.redis.rpush(key, userId);
    await this.rpushWithExpire(key, userId);
  }

  async rangeParamDatas(deviceId: DeviceId): Promise<string[]> {
    const key = config.redis.key.deviceStreamingSessionParam(deviceId);
    // const count = await this.redis.llen(key);
    const result = await this.redis.lrange(key, 0, -1);
    // this.logger.verbose('popParamDatas111111111', { count, result });
    // let test = await this.redis.lrange(key, 0, -1);
    // this.logger.verbose('popParamDatas222222222', { test });

    // const key1 = config.redis.key.deviceStreamingSessionParam(deviceId);
    // await this.redis.lrem(key1, 1, userId);
    // test = await this.redis.lrange(key, 0, -1);
    // this.logger.verbose('popParamDatas333333333', { test });

    // const key2 = config.redis.key.deviceStreamingSessionParam(deviceId);
    // await this.redis.lrem(key2, 1, userId);
    // test = await this.redis.lrange(key, 0, -1);
    // this.logger.verbose('popParamDatas444444444', { test });

    return result ?? [];
  }

  // async pushResult(organizationId: OrganizationId, deviceId: DeviceId, resultId: string, result: Result): Promise<void> {
  //   const key = config.redis.key.deviceResult(organizationId, deviceId, resultId);
  //   const data = JSON.stringify(result);
  //   await this.rpushWithExpire(key, data);
  // }

  // popResultData(organizationId: OrganizationId, deviceId: DeviceId, resultId: string): Promise<string | null> {
  //   const key = config.redis.key.deviceResult(organizationId, deviceId, resultId);
  //   return this.redis.lpop(key);
  // }

  async removeAllData(deviceId: DeviceId, userId: UserId): Promise<void> {
    const key = config.redis.key.deviceStreamingSessionParam(deviceId);
    await this.redis.lrem(key, 0, userId);
  }

  async removeOneData(deviceId: DeviceId, userId: UserId): Promise<void> {
    const key = config.redis.key.deviceStreamingSessionParam(deviceId);
    await this.redis.lrem(key, 1, userId);
  }

  // async pushWebSocketProxyReceive(organizationId: OrganizationId, deviceId: DeviceId, webSocketProxyId: WebSocketProxyId, receive: WebSocketProxyReceive): Promise<void> {
  //   const key = config.redis.key.WebSocketProxyReceive(organizationId, deviceId, webSocketProxyId);
  //   const data = JSON.stringify(receive);
  //   await this.rpushWithExpire(key, data);
  // }

  // async popWebSocketProxyReceives(organizationId: OrganizationId, deviceId: DeviceId, webSocketProxyId: WebSocketProxyId, count: number): Promise<WebSocketProxyReceive[]> {
  //   const key = config.redis.key.WebSocketProxyReceive(organizationId, deviceId, webSocketProxyId);
  //   const popsOrNull = await this.redis.lpop(key, count);
  //   const pops = popsOrNull ?? [];
  //   const validateds: WebSocketProxyReceive[] = [];
  //   const befValidate = Date.now();
  //   for (const pop of pops) {
  //     try {
  //       const validated = await transformAndValidate(WebSocketProxyReceive, JSON.parse(pop));
  //       validateds.push(validated);
  //     } catch (error) {
  //       this.logger.error(error);
  //     }
  //   }
  //   return validateds;
  // }

  private async rpushWithExpire(key: string, data: string): Promise<void> {
    await this.redis.rpush(key, data);
    await this.redis.expire(key, config.redis.deviceStreamingExpireSeconds);
  }
}
