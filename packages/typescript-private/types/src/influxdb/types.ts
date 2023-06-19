import { Log } from '@dogu-tech/common';
import { IsEnum } from 'class-validator';
import { DeviceId, OrganizationId, Platform } from '..';

export enum DEVICE_RUNTIME_TYPE {
  DEVICE = 'DEVICE',
  GAME = 'GAME',
}

export enum DEVICE_JOB_LOG_TYPE {
  USER_PROJECT = 'USER_PROJECT',
  HOST_AGENT = 'HOST_AGENT',
  DEVICE = 'DEVICE',
}

export interface DeviceRunTimeTag {
  platform: keyof typeof Platform;
  type: DEVICE_RUNTIME_TYPE;
  organizationId: OrganizationId;
  deviceId: DeviceId;
  processName?: string;
  processId?: string;
}

export class DeviceJobLog extends Log {
  @IsEnum(DEVICE_JOB_LOG_TYPE)
  type!: DEVICE_JOB_LOG_TYPE;
}

export const influxDbKeyNames = {
  measurement: {
    fps: {
      name: 'fps',
      type: DEVICE_RUNTIME_TYPE.GAME,
      tags: {
        name: 'name',
      },
      field: {
        fps: 'fps',
      },
    },
    cpu: {
      name: 'cpu',
      type: DEVICE_RUNTIME_TYPE.DEVICE,
      tags: {
        cpu: 'cpu',
        name: 'name',
      },
    },
    mem: {
      name: 'mem',
      type: DEVICE_RUNTIME_TYPE.DEVICE,
      tags: {
        mem: 'mem',
        name: 'name',
      },
    },
    fs: {
      name: 'fs',
      type: DEVICE_RUNTIME_TYPE.DEVICE,
      tags: {
        fs: 'fs',
        name: 'name',
      },
    },
    battery: {
      name: 'battery',
      type: DEVICE_RUNTIME_TYPE.DEVICE,
      tags: {
        battery: 'battery',
        name: 'name',
      },
    },
    processCpu: {
      name: 'process_cpu',
      type: DEVICE_RUNTIME_TYPE.DEVICE,
    },
    processMem: {
      name: 'process_mem',
      type: DEVICE_RUNTIME_TYPE.DEVICE,
    },
    processFs: {
      name: 'process_fs',
      type: DEVICE_RUNTIME_TYPE.DEVICE,
    },
    processNet: {
      name: 'process_net',
      type: DEVICE_RUNTIME_TYPE.DEVICE,
    },
    deviceJobLog: {
      name: 'device_job_log',
      type: DEVICE_JOB_LOG_TYPE.DEVICE,
      tags: {
        deviceJobId: 'deviceJobId',
        deviceId: 'deviceId',
        organizationId: 'organizationId',
        type: 'type',
        level: 'level',
      },
      fields: {
        message: 'message',
        details: 'details',
      },
    },
  },

  common: {
    field: {
      localTimeStamp: 'localTimeStamp',
    },
  },
};

export const influxdbRuntimeInfoMeasurements = [
  influxDbKeyNames.measurement.cpu.name,
  influxDbKeyNames.measurement.mem.name,
  influxDbKeyNames.measurement.fs.name,
  influxDbKeyNames.measurement.fps.name,
  influxDbKeyNames.measurement.processCpu.name,
  influxDbKeyNames.measurement.processMem.name,
];
