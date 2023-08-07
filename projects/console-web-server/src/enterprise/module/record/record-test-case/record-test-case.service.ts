import {
  RecordTestCaseAndRecordTestStepPropCamel,
  RecordTestCaseAndRecordTestStepPropSnake,
  RecordTestCaseBase,
  RecordTestCasePropCamel,
  RecordTestCasePropSnake,
  RecordTestCaseResponse,
} from '@dogu-private/console';
import { ProjectId, RecordTestCaseId, RecordTestScenarioId, RecordTestStepId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { v4 } from 'uuid';
import { RecordTestCaseAndRecordTestStep } from '../../../../db/entity/index';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { EMPTY_PAGE, Page } from '../../../../module/common/dto/pagination/page';
import { castEntity } from '../../../../types/entity-cast';
import { getSortedRecordTestSteps } from '../common';
import { AddRecordTestStepToRecordTestCaseDto, CreateRecordTestCaseDto, FindRecordTestCaseByProjectIdDto, UpdateRecordTestCaseDto } from '../dto/record-test-case.dto';

@Injectable()
export class RecordTestCaseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findRecordTestCasesByProjectId(projectId: ProjectId, dto: FindRecordTestCaseByProjectIdDto): Promise<Page<RecordTestCaseBase>> {
    const rv = await this.dataSource
      .getRepository(RecordTestCase) //
      .createQueryBuilder('recordTestCase')
      .where(`recordTestCase.${RecordTestCasePropSnake.project_id} = :${RecordTestCasePropCamel.projectId}`, { projectId })
      .andWhere(`recordTestCase.${RecordTestCasePropSnake.name} ILIKE :${RecordTestCasePropCamel.name}`, { name: `%${dto.keyword}%` })
      .orderBy(`recordTestCase.${RecordTestCasePropCamel.updatedAt}`, 'DESC')
      .limit(dto.getDBLimit())
      .offset(dto.getDBOffset())
      .getManyAndCount();

    const data = rv[0];
    const totalCount = rv[1];

    if (data.length === 0) {
      return EMPTY_PAGE;
    }

    const page = new Page<RecordTestCaseBase>(dto.page, dto.offset, totalCount, data);
    return page;
  }

  async findRecordTestCaseById(projectId: ProjectId, recordTestCaseId: string): Promise<RecordTestCaseResponse> {
    const recordTestCase = await this.dataSource
      .getRepository(RecordTestCase) //
      .createQueryBuilder('recordTestCase')
      .leftJoinAndSelect(`recordTestCase.${RecordTestCasePropCamel.recordTestCaseAndRecordTestSteps}`, `recordTestCaseAndRecordTestSteps`)
      .leftJoinAndSelect(`recordTestCaseAndRecordTestSteps.${RecordTestCaseAndRecordTestStepPropCamel.recordTestStep}`, `recordTestStep`)
      .where(`recordTestCase.${RecordTestCasePropSnake.project_id} = :${RecordTestCasePropCamel.projectId}`, { projectId })
      .andWhere(`recordTestCase.${RecordTestCasePropSnake.record_test_case_id} = :recordTestCaseId`, { recordTestCaseId })
      .getOne();

    if (!recordTestCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const rv: RecordTestCaseResponse = {
      ...recordTestCase,
      recordTestSteps: getSortedRecordTestSteps(recordTestCase),
    };
    return rv;
  }

  async createRecordTestCase(projectId: ProjectId, dto: CreateRecordTestCaseDto): Promise<RecordTestCaseBase> {
    const { name } = dto;

    const data = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, name } });

    if (data) {
      throw new HttpException(`Name: ${name} already exist.`, HttpStatus.BAD_REQUEST);
    }

    const newData = this.dataSource.getRepository(RecordTestCase).create({
      recordTestCaseId: v4(),
      projectId,
      name,
    });

    const recordTestCase = await this.dataSource.getRepository(RecordTestCase).save(newData);
    return recordTestCase;
  }

  async updateRecordTestCase(projectId: ProjectId, recordTestCaseId: RecordTestCaseId, dto: UpdateRecordTestCaseDto): Promise<RecordTestCaseBase> {
    const { name } = dto;

    const existingCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, name } });

    if (existingCase) {
      throw new HttpException(`Name: ${name} already exist.`, HttpStatus.BAD_REQUEST);
    }

    const data = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!data) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    if (data.name === name) {
      throw new HttpException(`RecordTestCase name is same. name: ${name}`, HttpStatus.BAD_REQUEST);
    }

    data.name = name;
    const rv = await this.dataSource.getRepository(RecordTestCase).save(data);
    return rv;
  }

  async deleteRecordTestCase(projectId: ProjectId, recordTestCaseId: RecordTestCaseId): Promise<void> {
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    // FIXME: join data
    await this.dataSource.getRepository(RecordTestCase).softRemove(testCase);
  }

  async addRecordTestStepToRecordTestCase(
    projectId: ProjectId, //
    recordTestCaseId: RecordTestCaseId,
    dto: AddRecordTestStepToRecordTestCaseDto,
  ): Promise<void> {
    const { recordTestStepId, prevRecordTestStepId } = dto;
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const testStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId } });
    if (!testStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    if (prevRecordTestStepId) {
      const prevTestStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId: prevRecordTestStepId } });
      if (!prevTestStep) {
        throw new HttpException(`RecordTestStep not found. prevRecordTestStepId: ${prevRecordTestStepId}`, HttpStatus.NOT_FOUND);
      }
    }

    const mappingData = await this.dataSource
      .getRepository(RecordTestCaseAndRecordTestStep) //
      .createQueryBuilder('recordTestCaseAndRecordTestStep')
      .innerJoinAndSelect(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropCamel.recordTestStep}`, 'recordTestStep')
      .leftJoinAndSelect(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropCamel.prevRecordTestStep}`, 'prevRecordTestStep')
      .where(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, {
        recordTestCaseId,
      })
      .andWhere(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_step_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`, {
        recordTestStepId,
      })
      .getOne();

    if (mappingData?.prevRecordTestStepId === prevRecordTestStepId) {
      throw new HttpException(`RecordTestCase is already attached. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.BAD_REQUEST);
    }

    await this.dataSource.manager.transaction(async (manager) => {
      if (mappingData) {
        await this.removeRecordTestStepFromMappingTable(manager, recordTestCaseId, mappingData.recordTestStep!);
        await this.addRecordTestStepToMappingTable(manager, recordTestCaseId, mappingData.recordTestStep!, prevRecordTestStepId);
      } else {
        await this.addRecordTestStepToMappingTable(manager, recordTestCaseId, testStep, prevRecordTestStepId);
      }
    });
  }

  async removeRecordTestStepFromRecordTestCase(
    projectId: ProjectId, //
    recordTestCaseId: RecordTestScenarioId,
    recordTestStepId: RecordTestCaseId,
  ): Promise<void> {
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestScenarioId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }
    const testStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId } });
    if (!testStep) {
      throw new HttpException(`RecordTestStep not found. recordTestCaseId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    const mappingData = await this.dataSource
      .getRepository(RecordTestCaseAndRecordTestStep) //
      .createQueryBuilder('recordTestCaseAndRecordTestStep')
      .innerJoinAndSelect(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropCamel.recordTestStep}`, 'recordTestStep')
      .where(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, {
        recordTestCaseId,
      })
      .andWhere(`recordTestCaseAndRecordTestStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_step_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`, {
        recordTestStepId,
      })
      .getOne();

    if (!mappingData) {
      throw new HttpException(`RecordTestCaseAndRecordTestStep not found. recordTestCaseId: ${recordTestCaseId}, recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.manager.transaction(async (manager) => {
      await this.removeRecordTestStepFromMappingTable(manager, recordTestCaseId, testStep);
    });
  }

  private async removeRecordTestStepFromMappingTable(
    manager: EntityManager, //
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<void> {
    const next = await this.getNextRecordTestStep(manager, recordTestCaseId, recordTestStep);
    if (!next) {
      await manager.getRepository(RecordTestCaseAndRecordTestStep).softDelete({ recordTestCaseId, recordTestStepId: recordTestStep.recordTestStepId });
      return;
    }
    const prev = await this.getPrevRecordTestStep(manager, recordTestCaseId, recordTestStep);
    if (prev) {
      await manager
        .getRepository(RecordTestCaseAndRecordTestStep)
        .update({ recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: prev.recordTestStepId });
    } else {
      await manager.getRepository(RecordTestCaseAndRecordTestStep).update({ recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: null });
    }
    await manager.getRepository(RecordTestCaseAndRecordTestStep).softDelete({ recordTestCaseId, recordTestStepId: recordTestStep.recordTestStepId });
  }

  private async addRecordTestStepToMappingTable(
    manager: EntityManager, //
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
    prevRecordTestStepId: RecordTestStepId | null,
  ): Promise<void> {
    // root
    if (!prevRecordTestStepId) {
      const originRoot = await manager.getRepository(RecordTestCaseAndRecordTestStep).findOne({
        where: {
          recordTestCaseId,
          recordTestStepId: IsNull(),
        },
      });
      if (!originRoot) {
        throw new HttpException(`First RecordTestCase not found. recordTestScenarioId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
      }
      originRoot.prevRecordTestStepId = recordTestStep.recordTestStepId;
      await manager.getRepository(RecordTestCaseAndRecordTestStep).save(originRoot);

      const newRoot = manager.getRepository(RecordTestCaseAndRecordTestStep).create({
        recordTestCaseId,
        recordTestStepId: recordTestStep.recordTestStepId,
        prevRecordTestStepId: null,
        deletedAt: null,
      });
      await manager
        .getRepository(RecordTestCaseAndRecordTestStep)
        .upsert(newRoot, [`${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, `${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`]);
      return;
    }

    const oldNext = await manager.getRepository(RecordTestCaseAndRecordTestStep).findOne({
      where: {
        recordTestCaseId,
        prevRecordTestStepId,
      },
    });

    // tail
    if (!oldNext) {
      const newTail = manager.getRepository(RecordTestCaseAndRecordTestStep).create({
        recordTestCaseId,
        recordTestStepId: recordTestStep.recordTestStepId,
        prevRecordTestStepId: prevRecordTestStepId,
        deletedAt: null,
      });
      await manager
        .getRepository(RecordTestCaseAndRecordTestStep)
        .upsert(castEntity(newTail), [`${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, `${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`]);
      return;
    } else {
      // middle
      const newMiddle = manager.getRepository(RecordTestCaseAndRecordTestStep).create({
        recordTestCaseId,
        recordTestStepId: recordTestStep.recordTestStepId,
        prevRecordTestStepId,
        deletedAt: null,
      });
      await manager
        .getRepository(RecordTestCaseAndRecordTestStep)
        .upsert(castEntity(newMiddle), [`${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, `${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`]);
      oldNext.prevRecordTestStepId = recordTestStep.recordTestStepId;
      await manager.getRepository(RecordTestCaseAndRecordTestStep).save(oldNext);
      return;
    }
  }

  private async getNextRecordTestStep(
    manager: EntityManager, //
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<RecordTestStep | null> {
    const next = await manager
      .getRepository(RecordTestCaseAndRecordTestStep) //
      .createQueryBuilder('caseAndStep')
      .leftJoinAndSelect(`caseAndStep.${RecordTestCaseAndRecordTestStepPropCamel.recordTestStep}`, 'recordTestStep')
      .where(`caseAndStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, {
        recordTestCaseId,
      })
      .andWhere(`caseAndStep.${RecordTestCaseAndRecordTestStepPropSnake.prev_record_test_step_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`, {
        prevRecordTestStepId: recordTestStep.recordTestStepId,
      })
      .getOne();
    return next?.recordTestStep ?? null;
  }

  private async getPrevRecordTestStep(
    manager: EntityManager, //
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<RecordTestStep | null> {
    const current = await manager
      .getRepository(RecordTestCaseAndRecordTestStep)
      .createQueryBuilder('caseAndStep')
      .leftJoinAndSelect(`caseAndStep.${RecordTestCaseAndRecordTestStepPropCamel.prevRecordTestStep}`, 'recordTestStep')
      .where(`caseAndStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_case_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestCaseId}`, {
        recordTestCaseId,
      })
      .andWhere(`caseAndStep.${RecordTestCaseAndRecordTestStepPropSnake.record_test_step_id} = :${RecordTestCaseAndRecordTestStepPropCamel.recordTestStepId}`, {
        recordTestStepId: recordTestStep.recordTestStepId,
      })
      .getOne();

    const prev = current?.prevRecordTestStep;
    return prev ?? null;
  }
}
