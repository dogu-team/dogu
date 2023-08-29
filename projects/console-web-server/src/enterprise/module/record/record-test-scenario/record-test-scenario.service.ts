import {
  RecordTestCasePropCamel,
  RecordTestScenarioAndRecordTestCasePropCamel,
  RecordTestScenarioBase,
  RecordTestScenarioPropCamel,
  RecordTestScenarioPropSnake,
  RecordTestScenarioResponse,
} from '@dogu-private/console';
import { ProjectId, RecordTestCaseId, RecordTestScenarioId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';
import { RecordTestScenarioAndRecordTestCase } from '../../../../db/entity/index';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../../db/entity/record-test-scenario.entity';
import { EMPTY_PAGE, Page } from '../../../../module/common/dto/pagination/page';
import { addRecordTestCaseToMappingTable } from '../common';
import { CreateRecordTestScenarioDto, FindRecordTestScenariosByProjectIdDto, UpdateRecordTestScenarioDto } from '../dto/record-test-scenario.dto';

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

    const recordCaseIds = dto.recordTestCaseIds ?? [];
    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const scenario = await manager.getRepository(RecordTestScenario).save(newData);
      await this.attachCasesToScenario(manager, projectId, newData.recordTestScenarioId, recordCaseIds);
      return scenario;
    });

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
    const recordCaseIds = dto.recordTestCaseIds ?? [];

    const data = await this.dataSource.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
    if (!data) {
      throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
    }

    const rv = await this.dataSource.manager.transaction(async (manager) => {
      data.name = name;
      const scenario = await manager.getRepository(RecordTestScenario).save(data);
      await this.clearRecordTestCasesFromScenario(manager, projectId, recordTestScenarioId);
      await this.attachCasesToScenario(manager, projectId, recordTestScenarioId, recordCaseIds);
      return scenario;
    });

    return rv;
  }

  async clearRecordTestCasesFromScenario(manager: EntityManager, projectId: ProjectId, recordTestScenarioId: RecordTestScenarioId): Promise<void> {
    const scenario = await manager.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
    if (!scenario) {
      throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
    }
    await manager.getRepository(RecordTestScenarioAndRecordTestCase).softDelete({ recordTestScenarioId: recordTestScenarioId });
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
      await this.clearRecordTestCasesFromScenario(manager, projectId, recordTestScenarioId);
    }

    await manager.getRepository(RecordTestScenario).softDelete({ projectId, recordTestScenarioId });
  }

  async attachCasesToScenario(manager: EntityManager, projectId: ProjectId, recordTestScenarioId: RecordTestScenarioId, recordTestCaseIds: RecordTestCaseId[]): Promise<void> {
    const recordCaseIds = recordTestCaseIds ?? [];
    const recordCases = await manager.getRepository(RecordTestCase).find({ where: { projectId, recordTestCaseId: In(recordCaseIds) } });
    if (recordCases.length !== 0) {
      const platform = recordCases[0].platform;
      recordCases.every((recordCase) => {
        if (recordCase.platform !== platform) {
          throw new HttpException(`RecordTestCases have different platform.`, HttpStatus.BAD_REQUEST);
        }
        return true;
      });

      // FIXME:(felix) check same app & browser
    } else {
      return;
    }
    let prevRecordTestCaseId: RecordTestCaseId | null = null;
    for (const recordCase of recordCases) {
      await addRecordTestCaseToMappingTable(manager, recordTestScenarioId, recordCase, prevRecordTestCaseId);
      prevRecordTestCaseId = recordCase.recordTestCaseId;
    }
  }

  // async detachRecordTestCaseFromScenario(
  //   projectId: ProjectId, //
  //   recordTestScenarioId: RecordTestScenarioId,
  //   recordTestCaseId: RecordTestCaseId,
  // ): Promise<void> {
  //   const scenario = await this.dataSource.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
  //   if (!scenario) {
  //     throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
  //   }
  //   const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
  //   if (!testCase) {
  //     throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
  //   }

  //   await this.dataSource.manager.transaction(async (manager) => {
  //     await detachRecordTestCaseFromScenario(manager, scenario, testCase);
  //   });
  // }

  // async attachRecordTestCaseToScenario(
  //   projectId: ProjectId, //
  //   recordTestScenarioId: RecordTestScenarioId,
  //   dto: AddRecordTestCaseToRecordTestScenarioDto,
  // ): Promise<void> {
  //   const { recordTestCaseId, prevRecordTestCaseId } = dto;
  //   const scenario = await this.dataSource.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
  //   if (!scenario) {
  //     throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
  //   }
  //   const testCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
  //   if (!testCase) {
  //     throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
  //   }

  //   if (prevRecordTestCaseId) {
  //     const prevTestCase = await this.dataSource.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId: prevRecordTestCaseId } });
  //     if (!prevTestCase) {
  //       throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${prevRecordTestCaseId}`, HttpStatus.NOT_FOUND);
  //     }
  //   }

  //   const mappingData = await this.dataSource
  //     .getRepository(RecordTestScenarioAndRecordTestCase) //
  //     .createQueryBuilder('recordTestScenarioAndRecordTestCase')
  //     .innerJoinAndSelect(`recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCase}`, 'recordTestCase')
  //     .leftJoinAndSelect(`recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropCamel.prevRecordTestCase}`, 'prevRecordTestCase')
  //     .where(
  //       `recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropSnake.record_test_scenario_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenarioId}`,
  //       { recordTestScenarioId },
  //     )
  //     .andWhere(
  //       `recordTestScenarioAndRecordTestCase.${RecordTestScenarioAndRecordTestCasePropSnake.record_test_case_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCaseId}`,
  //       { recordTestCaseId },
  //     )
  //     .getOne();

  //   if (mappingData?.prevRecordTestCaseId === prevRecordTestCaseId) {
  //     throw new HttpException(`RecordTestCase is already attached. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.BAD_REQUEST);
  //   }

  //   await this.dataSource.manager.transaction(async (manager) => {
  //     if (mappingData) {
  //       await softDeleteRecordTestCaseFromMappingTable(manager, recordTestScenarioId, mappingData.recordTestCase!);
  //       await addRecordTestCaseToMappingTable(manager, recordTestScenarioId, mappingData.recordTestCase!, prevRecordTestCaseId);
  //     } else {
  //       await addRecordTestCaseToMappingTable(manager, recordTestScenarioId, testCase, prevRecordTestCaseId);
  //     }
  //   });
  // }
}
