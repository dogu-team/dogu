import {
  RecordTestCaseAndRecordTestStepPropCamel,
  RecordTestCasePropCamel,
  RecordTestScenarioAndRecordTestCasePropCamel,
  RecordTestScenarioAndRecordTestCasePropSnake,
  RecordTestScenarioBase,
  RecordTestScenarioPropCamel,
  RecordTestScenarioPropSnake,
  RecordTestScenarioResponse,
} from '@dogu-private/console';
import { ProjectId, RecordTestCaseId, RecordTestScenarioId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { v4 } from 'uuid';
import { RecordTestScenarioAndRecordTestCase } from '../../../../db/entity/index';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../../db/entity/record-test-scenario.entity';
import { EMPTY_PAGE, Page } from '../../../../module/common/dto/pagination/page';
import { castEntity } from '../../../../types/entity-cast';
import { getSortedRecordTestCases } from '../common';
import {
  AddRecordTestCaseToRecordTestScenarioDto,
  CreateRecordTestScenarioDto,
  FindRecordTestScenariosByProjectIdDto,
  UpdateRecordTestScenarioDto,
} from '../dto/record-test-scenario.dto';

@Injectable()
export class RecordTestScenarioService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createRecordTestScenario(projectId: ProjectId, dto: CreateRecordTestScenarioDto): Promise<RecordTestScenarioBase> {
    const newData = this.dataSource.getRepository(RecordTestScenario).create({
      recordTestScenarioId: v4(),
      projectId,
      name: dto.name,
    });

    const rv = await this.dataSource.getRepository(RecordTestScenario).save(newData);
    return rv;
  }

  async findRecordTestScenarioById(projectId: ProjectId, recordTestScenarioId: RecordTestScenarioId): Promise<RecordTestScenarioResponse> {
    const scenario = await this.dataSource
      .getRepository(RecordTestScenario) //
      .createQueryBuilder('recordTestScenario')
      .leftJoinAndSelect(`recordTestScenario.${RecordTestScenarioPropCamel.recordTestScenarioAndRecordTestCases}`, 'recordTestScenarioAndRecordTestCases')
      .leftJoinAndSelect(`recordTestScenarioAndRecordTestCases.${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCase}`, 'recordTestCase')
      .leftJoinAndSelect(`recordTestCase.${RecordTestCasePropCamel.recordTestCaseAndRecordTestSteps}`, 'recordTestCaseAndRecordTestSteps')
      .leftJoinAndSelect(`recordTestCaseAndRecordTestSteps.${RecordTestCaseAndRecordTestStepPropCamel.recordTestStep}`, 'recordTestStep')
      .where(`recordTestScenario.${RecordTestScenarioPropSnake.project_id} = :${RecordTestScenarioPropCamel.projectId}`, { projectId })
      .andWhere(`recordTestScenario.${RecordTestScenarioPropSnake.record_test_scenario_id} = :${RecordTestScenarioPropCamel.recordTestScenarioId}`, { recordTestScenarioId })
      .getOne();

    if (!scenario) {
      throw new HttpException('RecordTestScenario not found', HttpStatus.NOT_FOUND);
    }

    const rv: RecordTestScenarioResponse = {
      ...scenario,
      recordTestCases: getSortedRecordTestCases(scenario),
    };
    return rv;
  }

  async findRecordTestScenarioByProjectId(projectId: ProjectId, dto: FindRecordTestScenariosByProjectIdDto): Promise<Page<RecordTestScenarioBase>> {
    const rv = await this.dataSource //
      .getRepository(RecordTestScenario)
      .createQueryBuilder('recordTestScenario')
      .where(`recordTestScenario.${RecordTestScenarioPropSnake.project_id} = :${RecordTestScenarioPropCamel.projectId}`, { projectId })
      .andWhere(`recordTestScenario.${RecordTestScenarioPropSnake.name} ILIKE :${RecordTestScenarioPropCamel.name}`, { name: `%${dto.keyword}%` })
      .orderBy(`recordTestScenario.${RecordTestScenarioPropCamel.updatedAt}`, 'DESC')
      .limit(dto.getDBLimit())
      .offset(dto.getDBOffset())
      .getManyAndCount();
    const data = rv[0];
    const totalCount = rv[1];

    if (data.length === 0) {
      return EMPTY_PAGE;
    }

    const page = new Page<RecordTestScenarioBase>(dto.page, dto.offset, totalCount, data);
    return page;
  }

  async updateRecordTestScenario(projectId: ProjectId, recordTestScenarioId: RecordTestScenarioId, dto: UpdateRecordTestScenarioDto): Promise<RecordTestScenarioBase> {
    const { name } = dto;
    const data = await this.dataSource.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
    if (!data) {
      throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
    }

    if (data.name === name) {
      throw new HttpException(`RecordTestScenario name is same. name: ${name}`, HttpStatus.BAD_REQUEST);
    }

    data.name = name;
    const rv = await this.dataSource.getRepository(RecordTestScenario).save(data);
    return rv;
  }

  async deleteRecordTestScenario(projectId: ProjectId, recordTestScenarioId: RecordTestScenarioId): Promise<void> {
    const data = await this.dataSource.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
    if (!data) {
      throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
    }

    // FIXME: join data
    await this.dataSource.getRepository(RecordTestScenario).softRemove(data);
  }

  async removeRecordTestCaseFromRecordTestScenario(
    projectId: ProjectId, //
    recordTestScenarioId: RecordTestScenarioId,
    recordTestCaseId: RecordTestCaseId,
  ): Promise<void> {
    const scenario = await this.dataSource.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
    if (!scenario) {
      throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
    }
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    const mappingData = await this.dataSource
      .getRepository(RecordTestScenarioAndRecordTestCase) //
      .createQueryBuilder('recordTestScenarioAndRecordTestCase')
      .innerJoinAndSelect(`recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCase}`, 'recordTestCase')
      .where(
        `recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropSnake.record_test_scenario_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenarioId}`,
        { recordTestScenarioId },
      )
      .andWhere(
        `recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropSnake.record_test_case_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCaseId}`,
        { recordTestCaseId },
      )
      .getOne();

    if (!mappingData) {
      throw new HttpException(
        `RecordTestScenarioAndRecordTestCase not found. recordTestScenarioId: ${recordTestScenarioId}, recordTestCaseId: ${recordTestCaseId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.dataSource.manager.transaction(async (manager) => {
      await this.removeRecordTestCaseFromMappingTable(manager, recordTestScenarioId, testCase);
    });
  }

  async addRecordTestCaseToRecordTestScenario(
    projectId: ProjectId, //
    recordTestScenarioId: RecordTestScenarioId,
    dto: AddRecordTestCaseToRecordTestScenarioDto,
  ): Promise<void> {
    const { recordTestCaseId, prevRecordTestCaseId } = dto;
    const scenario = await this.dataSource.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
    if (!scenario) {
      throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
    }
    const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
    if (!testCase) {
      throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
    }

    if (prevRecordTestCaseId) {
      const prevTestCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId: prevRecordTestCaseId } });
      if (!prevTestCase) {
        throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${prevRecordTestCaseId}`, HttpStatus.NOT_FOUND);
      }
    }

    const mappingData = await this.dataSource
      .getRepository(RecordTestScenarioAndRecordTestCase) //
      .createQueryBuilder('recordTestScenarioAndRecordTestCase')
      .innerJoinAndSelect(`recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCase}`, 'recordTestCase')
      .leftJoinAndSelect(`recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropCamel.prevRecordTestCase}`, 'prevRecordTestCase')
      .where(
        `recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropSnake.record_test_scenario_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenarioId}`,
        { recordTestScenarioId },
      )
      .andWhere(
        `recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropSnake.record_test_case_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCaseId}`,
        { recordTestCaseId },
      )
      .getOne();

    if (mappingData?.prevRecordTestCaseId === prevRecordTestCaseId) {
      throw new HttpException(`RecordTestCase is already attached. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.BAD_REQUEST);
    }

    await this.dataSource.manager.transaction(async (manager) => {
      if (mappingData) {
        await this.removeRecordTestCaseFromMappingTable(manager, recordTestScenarioId, mappingData.recordTestCase!);
        await this.addRecordTestCaseToMappingTable(manager, recordTestScenarioId, mappingData.recordTestCase!, prevRecordTestCaseId);
      } else {
        await this.addRecordTestCaseToMappingTable(manager, recordTestScenarioId, testCase, prevRecordTestCaseId);
      }
    });
  }

  private async removeRecordTestCaseFromMappingTable(
    manager: EntityManager, //
    recordTestScenarioId: RecordTestScenarioId,
    recordTestCase: RecordTestCase,
  ): Promise<void> {
    const next = await this.getNextRecordTestCase(manager, recordTestScenarioId, recordTestCase);
    if (!next) {
      await manager.getRepository(RecordTestScenarioAndRecordTestCase).softDelete({ recordTestScenarioId, recordTestCaseId: recordTestCase.recordTestCaseId });
      return;
    }
    const prev = await this.getPrevRecordTestCase(manager, recordTestScenarioId, recordTestCase);
    if (prev) {
      await manager
        .getRepository(RecordTestScenarioAndRecordTestCase)
        .update({ recordTestScenarioId, recordTestCaseId: next.recordTestCaseId }, { prevRecordTestCaseId: prev.recordTestCaseId });
    } else {
      await manager.getRepository(RecordTestScenarioAndRecordTestCase).update({ recordTestScenarioId, recordTestCaseId: next.recordTestCaseId }, { prevRecordTestCaseId: null });
    }
    await manager.getRepository(RecordTestScenarioAndRecordTestCase).softDelete({ recordTestScenarioId, recordTestCaseId: recordTestCase.recordTestCaseId });
  }

  private async addRecordTestCaseToMappingTable(
    manager: EntityManager, //
    recordTestScenarioId: RecordTestScenarioId,
    recordTestCase: RecordTestCase,
    prevRecordTestCaseId: RecordTestCaseId | null,
  ): Promise<void> {
    // root
    if (!prevRecordTestCaseId) {
      const originRoot = await manager.getRepository(RecordTestScenarioAndRecordTestCase).findOne({
        where: {
          recordTestScenarioId,
          recordTestCaseId: IsNull(),
        },
      });
      if (!originRoot) {
        throw new HttpException(`First RecordTestCase not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
      }
      originRoot.prevRecordTestCaseId = recordTestCase.recordTestCaseId;
      await manager.getRepository(RecordTestScenarioAndRecordTestCase).save(originRoot);

      const newRoot = manager.getRepository(RecordTestScenarioAndRecordTestCase).create({
        recordTestScenarioId,
        recordTestCaseId: recordTestCase.recordTestCaseId,
        prevRecordTestCaseId: null,
        deletedAt: null,
      });
      await manager
        .getRepository(RecordTestScenarioAndRecordTestCase)
        .upsert(castEntity(newRoot), [`${RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenarioId}`, `${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCaseId}`]);
      return;
    }

    const oldNext = await manager.getRepository(RecordTestScenarioAndRecordTestCase).findOne({
      where: {
        recordTestScenarioId,
        prevRecordTestCaseId,
      },
    });

    // tail
    if (!oldNext) {
      const newTail = manager.getRepository(RecordTestScenarioAndRecordTestCase).create({
        recordTestScenarioId,
        recordTestCaseId: recordTestCase.recordTestCaseId,
        prevRecordTestCaseId,
        deletedAt: null,
      });
      await manager
        .getRepository(RecordTestScenarioAndRecordTestCase)
        .upsert(castEntity(newTail), [`${RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenarioId}`, `${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCaseId}`]);
      return;
    } else {
      // middle
      const newMiddle = manager.getRepository(RecordTestScenarioAndRecordTestCase).create({
        recordTestScenarioId,
        recordTestCaseId: recordTestCase.recordTestCaseId,
        prevRecordTestCaseId,
        deletedAt: null,
      });
      await manager
        .getRepository(RecordTestScenarioAndRecordTestCase)
        .upsert(castEntity(newMiddle), [
          `${RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenarioId}`,
          `${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCaseId}`,
        ]);
      oldNext.prevRecordTestCaseId = recordTestCase.recordTestCaseId;
      await manager.getRepository(RecordTestScenarioAndRecordTestCase).save(oldNext);
      return;
    }
  }

  private async getNextRecordTestCase(
    manager: EntityManager, //
    recordTestScenarioId: RecordTestScenarioId,
    recordTestCase: RecordTestCase,
  ): Promise<RecordTestCase | null> {
    const next = await manager
      .getRepository(RecordTestScenarioAndRecordTestCase) //
      .createQueryBuilder('scenarioAndCase')
      .leftJoinAndSelect(`scenarioAndCase.${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCase}`, 'recordTestCase')
      .where(`scenarioAndCase.${RecordTestScenarioAndRecordTestCasePropSnake.record_test_scenario_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenarioId}`, {
        recordTestScenarioId,
      })
      .andWhere(
        `scenarioAndCase.${RecordTestScenarioAndRecordTestCasePropSnake.prev_record_test_case_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.prevRecordTestCaseId}`,
        {
          prevRecordTestCaseId: recordTestCase.recordTestCaseId,
        },
      )
      .getOne();
    return next?.recordTestCase ?? null;
  }

  private async getPrevRecordTestCase(
    manager: EntityManager, //
    recordTestScenarioId: RecordTestScenarioId,
    recordTestCase: RecordTestCase,
  ): Promise<RecordTestCase | null> {
    const current = await manager
      .getRepository(RecordTestScenarioAndRecordTestCase)
      .createQueryBuilder('scenarioAndCase')
      .leftJoinAndSelect(`scenarioAndCase.${RecordTestScenarioAndRecordTestCasePropCamel.prevRecordTestCase}`, 'prevRecordTestCase')
      .where(`scenarioAndCase.${RecordTestScenarioAndRecordTestCasePropSnake.record_test_scenario_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenarioId}`, {
        recordTestScenarioId,
      })
      .andWhere(`scenarioAndCase.${RecordTestScenarioAndRecordTestCasePropSnake.record_test_case_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCaseId}`, {
        recordTestCaseId: recordTestCase.recordTestCaseId,
      })
      .getOne();

    const prev = current?.prevRecordTestCase;
    return prev ?? null;
  }
}
