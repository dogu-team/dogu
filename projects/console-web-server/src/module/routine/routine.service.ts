import { RoutineBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutineId, RoutineSchema, UserPayload } from '@dogu-private/types';
import { BadRequestException, ConflictException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Routine } from '../../db/entity/routine.entity';
import { ProjectFileService } from '../file/project-file.service';
import { YamlLoaderService } from '../init/yaml-loader/yaml-loader.service';

@Injectable()
export class RoutineService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly projectFileService: ProjectFileService,
    @Inject(YamlLoaderService)
    private readonly yamlLoaderService: YamlLoaderService,
  ) {}
  private async getRoutineNameFromYAML(yamlContent: string): Promise<string> {
    const routineSchema: RoutineSchema = this.yamlLoaderService.routineYamlToObject(yamlContent);
    const name = routineSchema.name;
    return name;
  }

  async readRoutine(organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId): Promise<string> {
    const routine = await this.dataSource.getRepository(Routine).findOne({ where: { projectId, routineId } });
    if (!routine) {
      throw new NotFoundException(`Routine with ${routineId} not found`);
    }

    const routineData = await this.projectFileService.readRoutine(organizationId, projectId, routineId, routine.name);
    return routineData;
  }

  async createRoutine(userPayload: UserPayload, organizationId: OrganizationId, projectId: ProjectId, file: Express.Multer.File): Promise<RoutineBase> {
    const content = file.buffer.toString();
    const name = await this.getRoutineNameFromYAML(content);

    if (!name) {
      throw new BadRequestException('Routine name is required');
    }

    const existRoutine = await this.dataSource.getRepository(Routine).findOne({ where: { projectId, name } });
    if (existRoutine) {
      throw new ConflictException(`Routine "${name}" already exists.`);
    }

    const routine = await this.dataSource.transaction(async (transactionEntityManager) => {
      const result = transactionEntityManager.create(Routine, { name, projectId });
      const routine = await transactionEntityManager.save(Routine, result);

      await this.projectFileService.uploadRoutine(file, organizationId, projectId, routine.routineId, routine.name);
      return routine;
    });

    return routine;
  }

  async createSampleRoutine(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId): Promise<RoutineBase> {
    const content = `name: sample routine

on:
  workflow_dispatch:

jobs:
  sample-job:
    record: true
    runs-on:
      group:
        - android
    steps:
      - name: prepare
        uses: dogu-actions/prepare
        with:
          appVersion: 2.0.0
          uninstallApp: true
      - name: run test
        uses: dogu-actions/run-test
        with:
          script: test/samples/dogurpgsample.test.ts`;

    const name = await this.getRoutineNameFromYAML(content);
    const buffer = Buffer.from(content);

    if (!name) {
      throw new BadRequestException('Routine name is required');
    }

    const existRoutine = await manager.getRepository(Routine).findOne({ where: { projectId, name } });
    if (existRoutine) {
      ``;
      throw new ConflictException(`Routine "${name}" already exists.`);
    }

    const file: Express.Multer.File = {
      // fieldname: 'file',
      // originalname: name,
      mimetype: 'text/yaml',
      buffer: buffer,
    } as Express.Multer.File;

    const result = manager.create(Routine, { name, projectId });
    const routine = await manager.save(Routine, result);

    await this.projectFileService.uploadRoutine(file, organizationId, projectId, routine.routineId, routine.name);
    return routine;
  }

  async findAllRoutinesByProjectId(organizationId: OrganizationId, projectId: ProjectId, name?: string): Promise<Routine[]> {
    if (name) {
      const [routines] = await this.dataSource
        .getRepository(Routine)
        .createQueryBuilder('routine')
        .where({ projectId })
        .andWhere(`routine.name LIKE :name`, { name: `%${name}%` })
        .orderBy('routine.name', 'ASC')
        .getManyAndCount();
      return routines;
    }

    const [routines] = await this.dataSource.getRepository(Routine).createQueryBuilder('routine').where({ projectId }).orderBy('routine.name', 'ASC').getManyAndCount();

    return routines;
  }

  async findRoutineById(organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId): Promise<Routine> {
    const routine = await this.dataSource.getRepository(Routine).findOne({ where: { projectId, routineId } });

    if (routine) {
      return routine;
    }

    throw new NotFoundException('Cannot find routine');
  }

  async updateRoutine(userPayload: UserPayload, organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId, file: Express.Multer.File): Promise<void> {
    const routineRepository = this.dataSource.getRepository(Routine);
    const routine = await routineRepository.findOne({ where: { projectId, routineId } });
    if (!routine) {
      throw new NotFoundException('Cannot find routine');
    }

    const content = file.buffer.toString();
    const name = await this.getRoutineNameFromYAML(content);

    const isChangedFileName = name !== routine.name;
    if (isChangedFileName) {
      const existRoutine = await routineRepository.findOne({ where: { projectId, name } });

      if (existRoutine) {
        throw new ConflictException(`Routine "${name}" already exists.`);
      }
    } else {
      const routineData = await this.projectFileService.readRoutine(organizationId, projectId, routineId, name);
      if (!routineData) {
        throw new HttpException('Routine configFilePath is not valid', HttpStatus.CONFLICT);
      }
    }

    await this.projectFileService.uploadRoutine(file, organizationId, projectId, routineId, name);
    await routineRepository.save(Object.assign(routine, { name }));
  }

  /**
   * felix: fixme. join table delete
   */
  async deleteRoutine(organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId): Promise<void> {
    const routineRepository = this.dataSource.getRepository(Routine);
    const routine = await routineRepository.findOne({ where: { projectId, routineId } });

    if (routine) {
      await routineRepository.softRemove(routine);
      return;
    }

    throw new NotFoundException('Cannot find routine');
  }
}
