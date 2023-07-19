import { DevicePropCamel, ProjectAndDevicePropCamel } from '@dogu-private/console';
import {
  CREATOR_TYPE,
  DeviceId,
  isRemoteDeviceJobCompleted,
  OrganizationId,
  ProjectId,
  RemoteDeviceJobId,
  REMOTE_DEVICE_JOB_STATE,
  REMOTE_TYPE,
  UserId,
  WebDriverSessionId,
} from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { HttpStatus } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../../db/entity/device.entity';
import { RemoteDeviceJob } from '../../../db/entity/remote-device-job.entity';
import { RemoteWebDriverInfo } from '../../../db/entity/remote-webdriver-info.entity';
import { Remote } from '../../../db/entity/remote.entity';
import { logger } from '../../logger/logger.instance';
import { RemoteException } from '../common/exception';

export module RemoteDeviceJobProcessor {
  export async function createWebdriverRemoteDeviceJob(
    manager: EntityManager,
    projectId: ProjectId,
    deviceId: DeviceId,
    remoteDeviceJobId: RemoteDeviceJobId,
    browserName: string | null,
    browserVersion: string | null,
    doguOptions: object,
    creatorId: UserId | null,
    creatorType: CREATOR_TYPE,
  ): Promise<RemoteDeviceJob> {
    logger.info(
      `createWebdriverRemoteDeviceJob. projectId: ${projectId}, deviceId: ${deviceId}, remoteDeviceJobId: ${remoteDeviceJobId},  browserName: ${browserName}, browserVersion: ${browserVersion}`,
    );

    // remote
    const remoteData = manager.getRepository(Remote).create({
      remoteId: v4(),
      projectId: projectId,
      type: REMOTE_TYPE.WEBDRIVER,
      creatorId,
      creatorType,
      doguOptions,
    });

    // remote-webdriver-info
    const remoteWebDriverInfoData = manager.getRepository(RemoteWebDriverInfo).create({
      remoteWebDriverInfoId: v4(),
      remoteId: remoteData.remoteId,
      browserName: browserName,
      browserVersion: browserVersion,
    });

    // remote-device-job
    const remoteDeviceJobData = manager.getRepository(RemoteDeviceJob).create({
      remoteDeviceJobId: remoteDeviceJobId,
      remoteId: remoteData.remoteId,
      deviceId: deviceId,
      lastIntervalTime: new Date(),
      sessionId: null,
      state: REMOTE_DEVICE_JOB_STATE.WAITING,
    });

    await manager.getRepository(Remote).save(remoteData);
    await manager.getRepository(RemoteWebDriverInfo).save(remoteWebDriverInfoData);
    const remoteDeviceJob = await manager.getRepository(RemoteDeviceJob).save(remoteDeviceJobData);

    return remoteDeviceJob;
  }
  export async function updateRemoteDeviceJobSessionId(manager: EntityManager, remoteDeviceJobId: RemoteDeviceJobId, sessionId: WebDriverSessionId): Promise<void> {
    logger.info(`updateRemoteDeviceJobSessionId. remote-device-job[${remoteDeviceJobId}] sessionId: ${sessionId}`);
    await manager.getRepository(RemoteDeviceJob).update(remoteDeviceJobId, { sessionId: sessionId });
  }

  export async function setRemoteDeviceJobState(manager: EntityManager, remoteDeviceJob: RemoteDeviceJob, state: REMOTE_DEVICE_JOB_STATE): Promise<void> {
    logger.info(
      `setRemoteDeviceJobState. remote-device-job[${remoteDeviceJob.remoteDeviceJobId}] state transition: ${REMOTE_DEVICE_JOB_STATE[remoteDeviceJob.state]} -> ${
        REMOTE_DEVICE_JOB_STATE[state]
      }`,
    );

    remoteDeviceJob.lastIntervalTime = new Date();
    if (state === REMOTE_DEVICE_JOB_STATE.IN_PROGRESS) {
      remoteDeviceJob.inProgressAt = new Date();
    } else if (isRemoteDeviceJobCompleted(state)) {
      remoteDeviceJob.completedAt = new Date();
    } else {
      throw new Error(`Invalid state: ${remoteDeviceJob.state}`);
    }

    remoteDeviceJob.state = state;
    await manager.getRepository(RemoteDeviceJob).save(remoteDeviceJob);
  }

  export async function setRemoteDeviceJobLastIntervalTime(manager: EntityManager, remoteDeviceJob: RemoteDeviceJob): Promise<void> {
    remoteDeviceJob.lastIntervalTime = new Date();
    await manager.getRepository(RemoteDeviceJob).save(remoteDeviceJob);
  }

  export async function validateAvailableDevice(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId, deviceId: DeviceId): Promise<void> {
    const device = await manager //
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .leftJoinAndSelect(`projectAndDevice.${ProjectAndDevicePropCamel.project}`, 'project')
      .innerJoinAndSelect(`device.${DevicePropCamel.organization}`, 'organization')
      .where(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId })
      .andWhere(`organization.${DevicePropCamel.organizationId} = :organizationId`, { organizationId })
      .getOne();

    if (!device) {
      throw new RemoteException(HttpStatus.NOT_FOUND, `isAvailableDevice. The device is not found. DeviceId: ${deviceId}, OrganizationId: ${organizationId}`, {});
    }

    if (device.isGlobal === 1) {
      return;
    }

    const projectIds = device.projectAndDevices?.map((deviceAndProject) => deviceAndProject.projectId).filter(notEmpty) ?? [];
    if (projectIds.length === 0) {
      throw new RemoteException(
        HttpStatus.BAD_REQUEST,
        `isAvailableDevice. The device is not active state. DeviceId: ${deviceId}, OrganizationId: ${organizationId}, ProjectId: ${projectId}`,
        {},
      );
    }
  }
}
