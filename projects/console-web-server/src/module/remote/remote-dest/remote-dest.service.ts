import { RemoteDestId, RemoteDeviceJobId } from '@dogu-private/types';
import { CreateRemoteDestRequestBody, CreateRemoteDestResponse, RemoteDestData, RemoteDestInfo } from '@dogu-tech/console-remote-dest';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { RemoteDestEdge } from '../../../db/entity/relations/remote-dest-edge.entity';
import { RemoteDest } from '../../../db/entity/remote-dest.entity';
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
    const exist = await this.dataSource.getRepository(RemoteDest).exist({ where: { remoteDeviceJobId } });
    if (!exist) {
      throw new HttpException(`RemoteDeviceJobId ${remoteDeviceJobId} not found`, HttpStatus.NOT_FOUND);
    }
    const rv = await this.dataSource.transaction(async (entityManager) => {
      const destDatas = await this.createRemoteDestDatas(entityManager, remoteDestInfos, remoteDeviceJobId, null);
      return destDatas;
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

  private async createRemoteDestDatas(
    manager: EntityManager,
    remoteDestInfos: RemoteDestInfo[],
    remoteDeviceJobId: RemoteDeviceJobId,
    parentRemoteDestId: RemoteDestId | null,
  ): Promise<RemoteDestData[]> {
    const destDatas: RemoteDestData[] = [];
    let index = 0;
    for (const remoteDestInfo of remoteDestInfos) {
      const newData = manager.getRepository(RemoteDest).create({ remoteDestId: v4(), index, remoteDeviceJobId, ...remoteDestInfo });
      const remoteDest = await manager.getRepository(RemoteDest).save(newData);
      if (parentRemoteDestId) {
        await this.createRemoteDestEdge(manager, parentRemoteDestId, remoteDest.remoteDestId);
      }

      const children = await this.createRemoteDestDatas(manager, remoteDestInfo.children, remoteDeviceJobId, remoteDest.remoteDestId);

      const remoteDestData: RemoteDestData = {
        remoteDestId: remoteDest.remoteDestId,
        remoteDeviceJobId: remoteDest.remoteDeviceJobId,
        name: remoteDest.name,
        index: remoteDest.index,
        state: remoteDest.state,
        type: remoteDest.type,
        children,
      };
      destDatas.push(remoteDestData);
      ++index;
    }
    return destDatas;
  }
}
