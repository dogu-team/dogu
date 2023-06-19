import { FilledRuntimeInfo, ProfileMethod, ProfileMethodKind, ProfileMethods, RuntimeInfo, Serial } from '@dogu-private/types';
import { DuplicatedCallGuarder, Instance, validateAndEmitEventAsync } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '../config/config.service';
import { OnDeviceConfigChangedEvent, OnDeviceRuntimeInfoUpdatedEvent, OnUpdateEvent } from '../events';
import { DeviceChannel } from '../internal/public/device-channel';
import { DoguLogger } from '../logger/logger';
import { ScanService } from '../scan/scan.service';
import { DeviceRuntimeInfo } from '../types';
import { PeriodTimeChecker } from '../utils/period-time-checker';

type DeviceTimeChecker = Map<ProfileMethodKind, PeriodTimeChecker>;
type DeviceTimeCheckers = Map<Serial, DeviceTimeChecker>;

@Injectable()
export class ProfileService {
  private readonly devceTimeCheckers: DeviceTimeCheckers = new Map();
  private readonly onUpdateGuarder = new DuplicatedCallGuarder();

  constructor(
    private readonly scanService: ScanService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: DoguLogger,
  ) {}

  @OnEvent(OnDeviceConfigChangedEvent.key)
  onDeviceConfigChanged(value: Instance<typeof OnDeviceConfigChangedEvent.value>): void {
    const { channel, config } = value;
    this.logger.info(`DeviceProfileService.configChanged id:${channel.serial}`);
    let checkers = this.devceTimeCheckers.get(channel.serial);
    if (!checkers) {
      this.applyDefaultTimeChecker(channel);
      checkers = this.devceTimeCheckers.get(channel.serial);
      if (!checkers) {
        this.logger.error(`DeviceProfileService.configChanged checkers not found id:${channel.serial}`);
        return;
      }
    }
    for (const method of config.profileMethods) {
      const kind = method.profileMethod.kind;
      const timeChecker = checkers.get(kind);
      if (!timeChecker) continue;
      timeChecker.period = method.periodSec * 1000;
    }
  }

  @OnEvent(OnUpdateEvent.key)
  async onUpdate(value: Instance<typeof OnUpdateEvent.value>): Promise<void> {
    await this.onUpdateGuarder.guard(async () => {
      await this.updateRuntimeInfo();
    });
  }

  private async updateRuntimeInfo(): Promise<void> {
    const deviceRuntimeInfos = await this.queryRuntimeInfos();
    if (deviceRuntimeInfos.length === 0) return;
    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceRuntimeInfoUpdatedEvent, { deviceRuntimeInfos });
  }

  async queryRuntimeInfos(): Promise<DeviceRuntimeInfo[]> {
    function query(channel: DeviceChannel, configService: ConfigService, devceTimeCheckers: DeviceTimeCheckers): Promise<RuntimeInfo> | undefined {
      const { serial, platform } = channel;
      const config = configService.findConfig(serial, platform);
      if (!config) {
        throw new Error(`DevicesStatus.queryRuntimePoints deviceConfig not found id:${serial}`);
      }
      const timeCheckers = devceTimeCheckers.get(serial);
      if (!timeCheckers) {
        throw new Error(`DevicesStatus.queryRuntimePoints timeCheckers not found id:${serial}`);
      }

      const toUpdateMethods: ProfileMethod[] = [];
      for (const method of config.profileMethods) {
        const timeChecker = timeCheckers.get(method.profileMethod.kind);
        if (!timeChecker) continue;
        timeChecker.updateTime();
        if (!timeChecker.isTimeHasCome) continue;
        toUpdateMethods.push(method.profileMethod);
      }
      if (0 == toUpdateMethods.length) {
        return;
      }
      return Promise.resolve(channel.queryProfile(toUpdateMethods));
    }

    const queries = this.scanService
      .getChannels()
      .map((channel) => {
        const { serial } = channel;
        return {
          serial,
          queryPromise: query(channel, this.configService, this.devceTimeCheckers),
        };
      })
      .filter((query) => query.queryPromise !== undefined) as { serial: Serial; queryPromise: Promise<FilledRuntimeInfo> }[];
    const results = await Promise.allSettled(queries.map((query) => query.queryPromise));
    if (queries.length !== results.length) {
      throw new Error(`DevicesStatus.queryRuntimePoints queries.length !== results.length`);
    }

    const zippeds = queries.map((query, index) => {
      const { serial } = query;
      const result = results[index];
      return { serial, result };
    });
    const filtereds = zippeds.filter((zipped) => {
      if (zipped.result.status === 'rejected') {
        this.logger.error('DevicesStatus.queryRuntimePoints error.', { reason: zipped.result.reason });
        return false;
      }
      return true;
    }) as { serial: Serial; result: PromiseFulfilledResult<FilledRuntimeInfo> }[];
    const deviceRuntimeInfo = filtereds.map((filtered) => {
      const { serial, result } = filtered;
      const deviceRuntineInfo: DeviceRuntimeInfo = {
        serial,
        runtimeInfo: result.value,
      };
      return deviceRuntineInfo;
    });
    return deviceRuntimeInfo;
  }

  private applyDefaultTimeChecker(channel: DeviceChannel): void {
    const allTimeCheckers = new Map<ProfileMethodKind, PeriodTimeChecker>();
    for (const kind of ProfileMethods.ProfileMethodAllKinds) {
      allTimeCheckers.set(kind, new PeriodTimeChecker(0));
    }
    this.devceTimeCheckers.set(channel.serial, allTimeCheckers);
  }
}
