import { RecordTestStepBase, RecordTestStepPropCamel, RecordTestStepPropSnake } from '@dogu-private/console';
import { ProjectId, RecordTestStepId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { EMPTY_PAGE, Page } from '../../../../module/common/dto/pagination/page';
import { CreateRecordTestStepDto, FindRecordTestStepsByProjectIdDto, UpdateRecordTestStepDto } from '../dto/record-test-step.dto';

@Injectable()
export class RecordTestStepService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findRecordTestStepsByProjectId(projectId: ProjectId, dto: FindRecordTestStepsByProjectIdDto): Promise<Page<RecordTestStepBase>> {
    const rv = await this.dataSource
      .getRepository(RecordTestStep) //
      .createQueryBuilder('recordTestStep')
      .where(`recordTestStep.${RecordTestStepPropCamel.projectId} = :${RecordTestStepPropCamel.projectId}`, { projectId })
      .andWhere(`recordTestStep.${RecordTestStepPropCamel.name} ILIKE :${RecordTestStepPropCamel.name}`, { name: `%${dto.keyword}%` })
      .orderBy(`recordTestStep.${RecordTestStepPropCamel.updatedAt}`, 'DESC')
      .limit(dto.getDBLimit())
      .offset(dto.getDBOffset())
      .getManyAndCount();

    const data = rv[0];
    const totalCount = rv[1];

    if (data.length === 0) {
      return EMPTY_PAGE;
    }

    const page = new Page<RecordTestStepBase>(dto.page, dto.offset, totalCount, data);
    return page;
  }

  async findRecordTestStepById(projectId: ProjectId, recordTestStepId: RecordTestStepId): Promise<RecordTestStepBase> {
    const recordTestStep = await this.dataSource
      .getRepository(RecordTestStep) //
      .createQueryBuilder('recordTestStep')
      .where(`recordTestStep.${RecordTestStepPropSnake.project_id} = :${RecordTestStepPropCamel.projectId}`, { projectId })
      .andWhere(`recordTestStep.${RecordTestStepPropSnake.record_test_step_id} = :recordTestStepId`, { recordTestStepId })
      .getOne();

    if (!recordTestStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    return recordTestStep;
  }

  async createRecordTestStep(projectId: ProjectId, dto: CreateRecordTestStepDto): Promise<RecordTestStepBase> {
    const { name } = dto;
    const newData = this.dataSource.getRepository(RecordTestStep).create({
      recordTestStepId: v4(),
      projectId,
      name,
    });

    const recordTestStep = await this.dataSource.getRepository(RecordTestStep).save(newData);
    return recordTestStep;
  }

  async updateRecordTestStep(projectId: ProjectId, recordTestStepId: RecordTestStepId, dto: UpdateRecordTestStepDto): Promise<RecordTestStepBase> {
    const { name } = dto;
    const data = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId } });
    if (!data) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    if (data.name === name) {
      throw new HttpException(`RecordTestStep name is same. name: ${name}`, HttpStatus.BAD_REQUEST);
    }

    data.name = name;
    const rv = await this.dataSource.getRepository(RecordTestStep).save(data);
    return rv;
  }

  async deleteRecordTestStep(projectId: ProjectId, recordTestStepId: RecordTestStepId): Promise<void> {
    const testStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId } });
    if (!testStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    // FIXME: join data
    await this.dataSource.getRepository(RecordTestStep).softRemove(testStep);
  }
}
