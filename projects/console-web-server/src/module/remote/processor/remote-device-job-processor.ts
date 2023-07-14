import { DeviceId, isRemoteDeviceJobCompleted, ProjectId, RemoteDeviceJobId, REMOTE_DEVICE_JOB_STATE, REMOTE_TYPE, WebDriverSessionId } from '@dogu-private/types';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { RemoteDeviceJob } from '../../../db/entity/remote-device-job.entity';
import { RemoteWebDriverInfo } from '../../../db/entity/remote-webdriver-info.entity';
import { Remote } from '../../../db/entity/remote.entity';

export module RemoteDeviceJobProcessor {
  export async function createWebdriverRemoteDeviceJob(
    manager: EntityManager,
    projectId: ProjectId,
    deviceId: DeviceId,
    remoteDeviceJobId: RemoteDeviceJobId,
    sessionId: WebDriverSessionId,
    browserName: string | null,
    browserVersion: string | null,
    // type: REMOTE_TYPE,
  ): Promise<RemoteDeviceJob> {
    // remote
    const remoteData = manager.getRepository(Remote).create({
      remoteId: v4(),
      projectId: projectId,
      type: REMOTE_TYPE.WEBDRIVER,
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
      sessionId,
      state: REMOTE_DEVICE_JOB_STATE.WAITING,
    });

    await manager.getRepository(Remote).save(remoteData);
    await manager.getRepository(RemoteWebDriverInfo).save(remoteWebDriverInfoData);
    const remoteDeviceJob = await manager.getRepository(RemoteDeviceJob).save(remoteDeviceJobData);

    return remoteDeviceJob;
  }

  export async function setRemoteDeviceJobState(manager: EntityManager, remoteDeviceJob: RemoteDeviceJob, state: REMOTE_DEVICE_JOB_STATE): Promise<void> {
    remoteDeviceJob.state = state;
    remoteDeviceJob.lastIntervalTime = new Date();
    if (remoteDeviceJob.state === REMOTE_DEVICE_JOB_STATE.IN_PROGRESS) {
      remoteDeviceJob.inProgressAt = new Date();
    } else if (isRemoteDeviceJobCompleted(remoteDeviceJob.state)) {
      remoteDeviceJob.completedAt = new Date();
    } else {
      throw new Error(`Invalid state: ${remoteDeviceJob.state}`);
    }

    await manager.getRepository(RemoteDeviceJob).save(remoteDeviceJob);
  }

  export async function setRemoteDeviceJobLastIntervalTime(manager: EntityManager, remoteDeviceJob: RemoteDeviceJob): Promise<void> {
    remoteDeviceJob.lastIntervalTime = new Date();
    await manager.getRepository(RemoteDeviceJob).save(remoteDeviceJob);
  }
}
