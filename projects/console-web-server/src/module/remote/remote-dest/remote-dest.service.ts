import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class RemoteDestService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly logger: DoguLogger,
  ) {}

  // async createRemoteDest(dto: CreateDestRequestBody): Promise<CreateDestResponse> {
  //   const { destInfos, stepId } = dto;
  //   const exist = await this.dataSource.getRepository(RemoteDest).exist({ where: { routineStepId: stepId } });
  //   if (!exist) {
  //     throw new HttpException(`stepId is not exist. stepId: ${stepId}`, HttpStatus.NOT_FOUND);
  //   }
  //   const rv = await this.dataSource.transaction(async (entityManager) => {
  //     const destDatas = await this.createDestDatas(entityManager, destInfos, stepId, null);
  //     return destDatas;
  //   });

  //   const response: CreateDestResponse = {
  //     dests: rv,
  //   };

  //   return response;
  // }

  // private async createRemoteDestEdge(manager: EntityManager, parentDestId: DestId, destId: DestId): Promise<void> {
  //   const newData = manager.getRepository(DestEdge).create({ parentDestId, destId });
  //   await manager.getRepository(DestEdge).save(newData);
  // }

  // private async createDestDatas(manager: EntityManager, destInfos: DestInfo[], stepId: RoutineStepId, parentDestId: DestId | null): Promise<DestData[]> {
  //   const destDatas: DestData[] = [];
  //   let index = 0;
  //   for (const destInfo of destInfos) {
  //     const newData = manager.getRepository(Dest).create({ index, routineStepId: stepId, ...destInfo });
  //     const dest = await manager.getRepository(Dest).save(newData);
  //     if (parentDestId) {
  //       await this.createRemoteDestEdge(manager, parentDestId, dest.destId);
  //     }

  //     const children = await this.createDestDatas(manager, destInfo.children, stepId, dest.destId);

  //     const destData: DestData = {
  //       destId: dest.destId,
  //       routineStepId: dest.routineStepId,
  //       name: dest.name,
  //       index: dest.index,
  //       state: dest.state,
  //       type: dest.type,
  //       children,
  //     };
  //     destDatas.push(destData);
  //     ++index;
  //   }
  //   return destDatas;
  // }
}
