import { DestSummaryResponse, RemoteDestBase, RemoteDeviceJobPropCamel } from '@dogu-private/console';
import { DEST_STATE, DEST_TYPE, RemoteDestId, RemoteDeviceJobId } from '@dogu-private/types';
import { CreateRemoteDestRequestBody, CreateRemoteDestResponse, RemoteDestInfo, RemoteJestData } from '@dogu-tech/console-remote-dest';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';
import { RemoteDestEdge } from '../../../db/entity/relations/remote-dest-edge.entity';
import { RemoteDest } from '../../../db/entity/remote-dest.entity';
import { RemoteDeviceJob } from '../../../db/entity/remote-device-job.entity';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class RemoteDestService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  async createRemoteDest(remoteDeviceJobId: RemoteDeviceJobId, dto: CreateRemoteDestRequestBody): Promise<CreateRemoteDestResponse> {
    const { remoteDestInfos } = dto;
    const exist = await this.dataSource.getRepository(RemoteDeviceJob).exist({ where: { remoteDeviceJobId } });
    if (!exist) {
      throw new HttpException(`RemoteDeviceJobId ${remoteDeviceJobId} not found`, HttpStatus.NOT_FOUND);
    }
    const rv = await this.dataSource.transaction(async (entityManager) => {
      const jestDatas = await this.createRemoteJestDatas(entityManager, remoteDestInfos, remoteDeviceJobId, null);
      return jestDatas;
    });

    const response: CreateRemoteDestResponse = {
      dests: rv,
    };

    return response;
  }

  private async createRemoteDestEdge(manager: EntityManager, parentRemoteDestId: RemoteDestId, remoteDestId: RemoteDestId): Promise<void> {
    const newData = manager.getRepository(RemoteDestEdge).create({ parentRemoteDestId, remoteDestId });
    await manager.getRepository(RemoteDestEdge).save(newData);
  }

  private async createRemoteJestDatas(
    manager: EntityManager,
    remoteDestInfos: RemoteDestInfo[],
    remoteDeviceJobId: RemoteDeviceJobId,
    parentRemoteDestId: RemoteDestId | null,
  ): Promise<RemoteJestData[]> {
    const jestDatas: RemoteJestData[] = [];
    let index = 0;
    for (const remoteDestInfo of remoteDestInfos) {
      const newData = manager.getRepository(RemoteDest).create({ remoteDestId: v4(), index, remoteDeviceJobId, ...remoteDestInfo });
      const remoteDest = await manager.getRepository(RemoteDest).save(newData);
      if (parentRemoteDestId) {
        await this.createRemoteDestEdge(manager, parentRemoteDestId, remoteDest.remoteDestId);
      }

      const children = await this.createRemoteJestDatas(manager, remoteDestInfo.children, remoteDeviceJobId, remoteDest.remoteDestId);

      const remoteJestData: RemoteJestData = {
        remoteDestId: remoteDest.remoteDestId,
        remoteDeviceJobId: remoteDest.remoteDeviceJobId,
        name: remoteDest.name,
        index: remoteDest.index,
        state: remoteDest.state,
        type: remoteDest.type,
        children,
      };
      jestDatas.push(remoteJestData);
      ++index;
    }
    return jestDatas;
  }

  async findRemoteDestsByRemoteDeviceJobId(remoteDeviceJobId: RemoteDeviceJobId): Promise<RemoteDestBase[]> {
    const remoteDests = await (
      await this.dataSource
        .getRepository(RemoteDest) //
        .find({ where: { remoteDeviceJobId } })
    ).sort((a, b) => a.index - b.index);

    if (remoteDests.length === 0) {
      return [];
    }
    // const destIds = remoteDests.map((remoteDest) => remoteDest.index).sort();
    const destIds = remoteDests.sort((a, b) => a.index - b.index).map((remoteDest) => remoteDest.remoteDestId);

    const destEdges = await this.dataSource.getRepository(RemoteDestEdge).findBy({ remoteDestId: In(destIds) });

    const jestDatas = await this.makeJestData(remoteDests, destEdges, null);
    return jestDatas;
  }

  private async makeJestData(remoteDests: RemoteDest[], remoteDestEdges: RemoteDestEdge[], parentRemoteDestId: RemoteDestId | null): Promise<RemoteDest[]> {
    let jestDatas;
    if (parentRemoteDestId === null) {
      // root
      jestDatas = remoteDests.filter((dest) => !remoteDestEdges.some((destEdge) => destEdge.remoteDestId === dest.remoteDestId));
    } else {
      // children by parentDestId
      jestDatas = remoteDests.filter((dest) =>
        remoteDestEdges.some((destEdge) => destEdge.remoteDestId === dest.remoteDestId && destEdge.parentRemoteDestId === parentRemoteDestId),
      );
    }

    for (const jestData of jestDatas) {
      jestData.children = await this.makeJestData(remoteDests, remoteDestEdges, jestData.remoteDestId);
    }

    return jestDatas;
  }

  async getRemoteDestSummary(remoteDeviceJobId: RemoteDeviceJobId): Promise<DestSummaryResponse> {
    const remoteDeviceJob = await this.dataSource
      .getRepository(RemoteDeviceJob) //
      .createQueryBuilder('remoteDeviceJob')
      .leftJoinAndSelect(`remoteDeviceJob.${RemoteDeviceJobPropCamel.remoteDests}`, 'remoteDest')
      .where(`remoteDeviceJob.${RemoteDeviceJobPropCamel.remoteDeviceJobId} = :remoteDeviceJobId`, { remoteDeviceJobId })
      .getOne();
    if (!remoteDeviceJob) {
      throw new HttpException(`RemoteDeviceJob not found. remoteDeviceJobId: ${remoteDeviceJobId}`, HttpStatus.NOT_FOUND);
    }

    const remoteDests = remoteDeviceJob.remoteDests ? remoteDeviceJob.remoteDests : [];
    if (remoteDests.length === 0) {
      throw new HttpException(`RemoteDest with ${remoteDeviceJobId} not found`, HttpStatus.NOT_FOUND);
    }

    const totalJobCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.JOB).length;
    const totalUnitCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.UNIT).length;
    const passedJobCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.PASSED).length;
    const passedUnitCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.PASSED).length;
    const failedJobCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.FAILED).length;
    const failedUnitCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.FAILED).length;
    const skippedJobCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.SKIPPED).length;
    const skippedUnitCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.SKIPPED).length;
    const pendingJobCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.PENDING).length;
    const pendingUnitCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.PENDING).length;
    const unspecifiedJobCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.UNSPECIFIED).length;
    const unspecifiedUnitCount = remoteDests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.UNSPECIFIED).length;

    const destSummary: DestSummaryResponse = {
      totalJobCount,
      totalUnitCount,
      passedJobCount,
      passedUnitCount,
      failedJobCount,
      failedUnitCount,
      skippedJobCount,
      skippedUnitCount,
      pendingJobCount,
      pendingUnitCount,
      unspecifiedJobCount,
      unspecifiedUnitCount,
    };

    return destSummary;
  }
}
