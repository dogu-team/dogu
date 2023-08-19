import {
  RecordTestCasePropCamel,
  RecordTestScenarioAndRecordTestCasePropCamel,
  RecordTestScenarioAndRecordTestCasePropSnake,
  RecordTestScenarioBase,
  RecordTestScenarioPropCamel,
  RecordTestScenarioPropSnake,
  RecordTestScenarioResponse,
} from '@dogu-private/console';
import { ProjectId, RecordTestCaseId, RecordTestScenarioId } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { RecordTestScenarioAndRecordTestCase } from '../../../../db/entity/index';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../../db/entity/record-test-scenario.entity';
import { EMPTY_PAGE, Page } from '../../../../module/common/dto/pagination/page';
import { addRecordTestCaseToMappingTable, detachRecordTestCaseFromScenario, softDeleteRecordTestCaseFromMappingTable } from '../common';
import {
  AddRecordTestCaseToRecordTestScenarioDto,
  CreateRecordTestScenarioDto,
  FindRecordTestScenariosByProjectIdDto,
  UpdateRecordTestScenarioDto,
} from '../dto/record-test-scenario.dto';
import { RecordTestCaseService } from '../record-test-case/record-test-case.service';

@Injectable()
export class RecordTestScenarioService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @Inject()
    private readonly recordTestCaseService: RecordTestCaseService,
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
      .leftJoinAndSelect(`recordTestCase.${RecordTestCasePropCamel.recordTestSteps}`, 'recordTestStep')
      .where(`recordTestScenario.${RecordTestScenarioPropSnake.project_id} = :${RecordTestScenarioPropCamel.projectId}`, { projectId })
      .andWhere(`recordTestScenario.${RecordTestScenarioPropSnake.record_test_scenario_id} = :${RecordTestScenarioPropCamel.recordTestScenarioId}`, { recordTestScenarioId })
      .getOne();

    if (!scenario) {
      throw new HttpException('RecordTestScenario not found', HttpStatus.NOT_FOUND);
    }

    const rv: RecordTestScenarioResponse = {
      ...scenario,
      recordTestCases: [],
      // recordTestCases: getSortedRecordTestCases(scenario),
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

  async softDeleteRecordTestScenario(manager: EntityManager, projectId: ProjectId, recordTestScenarioId: RecordTestScenarioId): Promise<void> {
    const scenario = await manager.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
    if (!scenario) {
      throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
    }
    const mappingDatas =
      (await this.dataSource
        .getRepository(RecordTestScenarioAndRecordTestCase)
        .find({ where: { recordTestScenarioId }, relations: [RecordTestScenarioAndRecordTestCasePropCamel.recordTestCase] })) ?? [];

    for (const mappingData of mappingDatas) {
      const testCase = mappingData.recordTestCase!;
      await detachRecordTestCaseFromScenario(manager, scenario, testCase);
    }

    await manager.getRepository(RecordTestScenario).softDelete({ projectId, recordTestScenarioId });
  }

  async detachRecordTestCaseFromScenario(
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

    await this.dataSource.manager.transaction(async (manager) => {
      await detachRecordTestCaseFromScenario(manager, scenario, testCase);
    });
  }

  async attachRecordTestCaseToScenario(
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
        await softDeleteRecordTestCaseFromMappingTable(manager, recordTestScenarioId, mappingData.recordTestCase!);
        await addRecordTestCaseToMappingTable(manager, recordTestScenarioId, mappingData.recordTestCase!, prevRecordTestCaseId);
      } else {
        await addRecordTestCaseToMappingTable(manager, recordTestScenarioId, testCase, prevRecordTestCaseId);
      }
    });
  }
}
