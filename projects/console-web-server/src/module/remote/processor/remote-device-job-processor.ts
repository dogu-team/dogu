import { DevicePropCamel, isRemoteDeviceJobSessionCompleted, ProjectAndDevicePropCamel } from '@dogu-private/console';
import {
  CREATOR_TYPE,
  DeviceId,
  OrganizationId,
  ProjectId,
  RemoteDeviceJobId,
  REMOTE_DEVICE_JOB_SESSION_STATE,
  REMOTE_TYPE,
  UserId,
  WebDriverSessionId,
} from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { HttpStatus } from '@nestjs/common';
import dayjs from 'dayjs';
import _ from 'lodash';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { DeviceRunner } from '../../../db/entity/device-runner.entity';

import { Device } from '../../../db/entity/device.entity';
import { ProjectSlackRemote } from '../../../db/entity/project-slack-remote.entity';
import { Project } from '../../../db/entity/project.entity';
import { RemoteDeviceJob } from '../../../db/entity/remote-device-job.entity';
import { RemoteWebDriverInfo } from '../../../db/entity/remote-webdriver-info.entity';
import { Remote } from '../../../db/entity/remote.entity';
import { User } from '../../../db/entity/user.entity';
import { SlackMessageService } from '../../../enterprise/module/integration/slack/slack-message.service';
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

    if ('token' in doguOptions) {
      doguOptions = _.omit(doguOptions, 'token');
    }

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
      sessionState: REMOTE_DEVICE_JOB_SESSION_STATE.WAITING,
    });

    // update projct updatedAt
    await manager.getRepository(Project).update({ projectId }, { updatedAt: new Date() });

    await manager.getRepository(Remote).save(remoteData);
    await manager.getRepository(RemoteWebDriverInfo).save(remoteWebDriverInfoData);
    const remoteDeviceJob = await manager.getRepository(RemoteDeviceJob).save(remoteDeviceJobData);

    return remoteDeviceJob;
  }
  export async function updateRemoteDeviceJobByCapabilities(
    manager: EntityManager,
    remoteDeviceJobId: RemoteDeviceJobId,
    sessionId: WebDriverSessionId,
    webDriverSeCdp: string | null,
  ): Promise<void> {
    logger.info(`updateRemoteDeviceJobByCapabilities. remote-device-job[${remoteDeviceJobId}]`, { sessionId, webDriverSeCdp });
    await manager.getRepository(RemoteDeviceJob).update(remoteDeviceJobId, { sessionId, webDriverSeCdp });
  }

  export async function setRemoteDeviceJobSessionState(
    manager: EntityManager,
    remoteDeviceJob: RemoteDeviceJob,
    state: REMOTE_DEVICE_JOB_SESSION_STATE,
    slackMessageService: SlackMessageService,
  ): Promise<void> {
    logger.info(
      `setRemoteDeviceJobState. remote-device-job[${remoteDeviceJob.remoteDeviceJobId}] state transition: ${REMOTE_DEVICE_JOB_SESSION_STATE[remoteDeviceJob.sessionState]} -> ${
        REMOTE_DEVICE_JOB_SESSION_STATE[state]
      }`,
    );

    remoteDeviceJob.lastIntervalTime = new Date();
    if (state === REMOTE_DEVICE_JOB_SESSION_STATE.IN_PROGRESS) {
      remoteDeviceJob.inProgressAt = new Date();
    } else if (isRemoteDeviceJobSessionCompleted(state)) {
      remoteDeviceJob.completedAt = new Date();

      if (remoteDeviceJob.deviceRunnerId) {
        await manager.getRepository(DeviceRunner).update(remoteDeviceJob.deviceRunnerId, { isInUse: 0 });
      }

      await handleSendingSlackMessage(manager, slackMessageService, remoteDeviceJob);
    } else {
      throw new Error(`Invalid state: ${remoteDeviceJob.sessionState}`);
    }

    remoteDeviceJob.sessionState = state;
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

  async function handleSendingSlackMessage(manager: EntityManager, slackMessageService: SlackMessageService, remoteDeviceJob: RemoteDeviceJob): Promise<void> {
    try {
      const remote = await manager.getRepository(Remote).findOne({ where: { remoteId: remoteDeviceJob.remoteId } });
      if (remote === null) {
        throw new Error(`Remote not found.`);
      }
      const project = await manager.getRepository(Project).findOne({ where: { projectId: remote.projectId } });
      if (project === null) {
        throw new Error(`Project not found.`);
      }
      const remoteSlack = await manager.getRepository(ProjectSlackRemote).findOne({ where: { projectId: project.projectId } });
      if (remoteSlack === null) {
        throw new Error(`RemoteSlack not found.`);
      }

      const isSucceeded = remoteDeviceJob.sessionState === REMOTE_DEVICE_JOB_SESSION_STATE.COMPLETE;
      const subscribeSuccess = remoteSlack.onSuccess === 1;
      const subscribeFailure = remoteSlack.onFailure === 1;

      if (isSucceeded && !subscribeSuccess) {
        return;
      }
      if (!isSucceeded && !subscribeFailure) {
        return;
      }

      const organizationId = project.organizationId;
      const projectId = project.projectId;
      const remoteName = remote.remoteId;
      const remoteUrl = `${process.env.DOGU_CONSOLE_URL}/dashboard/${organizationId}/projects/${projectId}/remotes/${remoteName}`;
      const durationSeconds = dayjs(remoteDeviceJob.completedAt!).diff(dayjs(remoteDeviceJob.inProgressAt!), 'second');
      let executorName = '';

      if (remote.creatorId) {
        const user = await manager.getRepository(User).findOne({ where: { userId: remote.creatorId! } });
        if (user === null) {
          throw new Error(`User [${remote.creatorId}] not found.`);
        }

        const slackUserId = await slackMessageService.getUserId(manager, organizationId, user.email);
        executorName = slackUserId === undefined ? `${user.name}` : `<@${slackUserId}>`;
      }

      await slackMessageService.sendRemoteMessage(manager, organizationId, remoteSlack.channelId, {
        isSucceeded,
        executorName,
        remoteName,
        remoteUrl,
        durationSeconds,
      });
    } catch (e: any) {
      logger.error(`Error occurred while sending slack message.`, e);
    }
  }
}
