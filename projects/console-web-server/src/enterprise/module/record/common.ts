import { RecordTestScenarioAndRecordTestCasePropCamel, RecordTestScenarioAndRecordTestCasePropSnake } from '@dogu-private/console';
import { OrganizationId, platformTypeFromPlatform, ProjectId, RecordTestCaseId, RecordTestScenarioId } from '@dogu-private/types';
import { DoguDevicePlatformHeader, DoguDeviceSerialHeader, DoguRemoteDeviceJobIdHeader, DoguRequestTimeoutHeader, HeaderRecord } from '@dogu-tech/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EntityManager, IsNull } from 'typeorm';
import { Device } from '../../../db/entity/device.entity';
import { RecordTestCase } from '../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../db/entity/record-test-scenario.entity';
import { RecordTestStep } from '../../../db/entity/record-test-step.entity';
import { RecordTestScenarioAndRecordTestCase } from '../../../db/entity/relations/record-test-scenario-and-record-test-case.entity';
import { RemoteWebDriverBatchRequestExecutor } from '../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import { RemoteWebDriverService } from '../../../module/remote/remote-webdriver/remote-webdriver.service';
import { castEntity } from '../../../types/entity-cast';

export function getSortedRecordTestCases(recordTestScenario: RecordTestScenario): RecordTestCase[] {
  const mappingData = recordTestScenario.recordTestScenarioAndRecordTestCases ?? [];
  if (mappingData.length === 0) {
    return [];
  }

  const sortedTestCase: RecordTestCase[] = [];

  const first = mappingData.find((data) => data.prevRecordTestCaseId === null);
  if (!first) {
    throw new HttpException(`Firt RecordTestCase not found. recordTestScenarioId: ${recordTestScenario.recordTestScenarioId}`, HttpStatus.NOT_FOUND);
  }

  const sortedSteps = getSortedRecordTestSteps(first.recordTestCase!);
  first.recordTestCase!.recordTestSteps = sortedSteps;
  sortedTestCase.push(first.recordTestCase!);

  let nextId = first.recordTestCaseId;
  while (true) {
    const next = mappingData.find((data) => data.prevRecordTestCaseId === nextId);
    if (!next) {
      break;
    }
    const isDuplicate = sortedTestCase.some((step) => step.recordTestCaseId === next.recordTestCaseId);
    if (isDuplicate) {
      throw new HttpException(`Duplicate RecordTestCase found. recordTestCaseId: ${next.recordTestCaseId}`, HttpStatus.BAD_REQUEST);
    }

    const sortedSteps = getSortedRecordTestSteps(next.recordTestCase!);
    next.recordTestCase!.recordTestSteps = sortedSteps;
    sortedTestCase.push(next.recordTestCase!);
    nextId = next.recordTestCaseId;
  }

  return sortedTestCase;
}

export function getSortedRecordTestSteps(recordTestCase: RecordTestCase): RecordTestStep[] {
  const recordTestSteps = recordTestCase.recordTestSteps ?? [];
  if (recordTestSteps.length === 0) {
    return [];
  }

  const sortedTestStep: RecordTestStep[] = [];
  const first = recordTestSteps.find((data) => data.prevRecordTestStepId === null);
  if (!first) {
    throw new HttpException(`Firt RecordTestStep not found. recordTestCaseId: ${recordTestCase.recordTestCaseId}`, HttpStatus.NOT_FOUND);
  }
  const screenshotUrl = sortedTestStep.push(first);

  let nextId = first.recordTestStepId;
  while (true) {
    const next = recordTestSteps.find((data) => data.prevRecordTestStepId === nextId);
    if (!next) {
      break;
    }

    const isDuplicate = sortedTestStep.some((step) => step.recordTestStepId === next.recordTestStepId);
    if (isDuplicate) {
      throw new HttpException(`Duplicate RecordTestStep. recordTestStepId: ${next.recordTestStepId}`, HttpStatus.BAD_REQUEST);
    }

    sortedTestStep.push(next);
    nextId = next.recordTestStepId;
  }
  return sortedTestStep;
}

export function makeActionBatchExcutor(
  remoteWebDriverService: RemoteWebDriverService,
  organizationId: OrganizationId,
  projectId: ProjectId,
  recordTestCase: RecordTestCase,
  device: Device,
): RemoteWebDriverBatchRequestExecutor {
  const sessionId = recordTestCase.activeSessionId;
  const sessionKey = recordTestCase.activeSessionKey;
  if (!sessionId || !sessionKey) {
    throw new HttpException(`Session not found. sessionId: ${sessionId}`, HttpStatus.NOT_FOUND);
  }
  const activeDeviceId = recordTestCase.activeDeviceId;
  if (!activeDeviceId) {
    throw new HttpException(`Device does not have activeDeviceId. RecordTestCaseId: ${recordTestCase.recordTestCaseId}`, HttpStatus.NOT_FOUND);
  }

  const headers: HeaderRecord = {
    [DoguRemoteDeviceJobIdHeader]: sessionKey,
    [DoguDevicePlatformHeader]: platformTypeFromPlatform(device.platform),
    [DoguDeviceSerialHeader]: device.serial,
    [DoguRequestTimeoutHeader]: '60000',
  };

  const batchExecutor = new RemoteWebDriverBatchRequestExecutor(remoteWebDriverService, {
    organizationId,
    projectId,
    deviceId: device.deviceId,
    deviceSerial: device.serial,
    headers,
    parallel: true,
  });
  return batchExecutor;
}

export async function detechRecordTestStepFromCase(
  manager: EntityManager,
  projectId: ProjectId,
  recordTestCaseId: RecordTestCaseId,
  recordTestStepId: RecordTestCaseId,
): Promise<void> {
  const testStep = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, recordTestStepId } });
  if (!testStep) {
    throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
  }
  const next = await getNextRecordTestStepInCase(manager, projectId, recordTestCaseId, testStep);
  if (!next) {
    return;
  }
  const prev = await getPrevRecordTestStepInCase(manager, projectId, recordTestCaseId, testStep);
  if (prev) {
    await manager.getRepository(RecordTestStep).update({ projectId, recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: prev.recordTestStepId });
  } else {
    await manager.getRepository(RecordTestStep).update({ projectId, recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: null });
  }
  return;
}

export async function getNextRecordTestStepInCase(
  manager: EntityManager, //
  projectId: ProjectId,
  recordTestCaseId: RecordTestCaseId,
  recordTestStep: RecordTestStep,
): Promise<RecordTestStep | null> {
  const next = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, prevRecordTestStepId: recordTestStep.recordTestStepId } });
  if (!next) {
    return null;
  }
  return next;
}

export async function getPrevRecordTestStepInCase(
  manager: EntityManager, //
  projectId: ProjectId,
  recordTestCaseId: RecordTestCaseId,
  recordTestStep: RecordTestStep,
): Promise<RecordTestStep | null> {
  if (!recordTestStep.prevRecordTestStepId) {
    return null;
  }
  const prev = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, recordTestStepId: recordTestStep.prevRecordTestStepId } });
  if (!prev) {
    throw new HttpException(
      `PrevRecordTestStep not found. recordTestStepId: ${recordTestStep.recordTestStepId}, prevRecordTestStepId: ${recordTestStep.prevRecordTestStepId}`,
      HttpStatus.NOT_FOUND,
    );
  }
  return prev;
}

export async function detachRecordTestCaseFromScenario(
  manager: EntityManager, //
  recordTestScenario: RecordTestScenario,
  recordTestCase: RecordTestCase,
): Promise<void> {
  const recordTestScenarioId = recordTestScenario.recordTestScenarioId;
  const recordTestCaseId = recordTestCase.recordTestCaseId;

  const mappingData = await manager
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
      `RecordTestScenarioAndRecordTestCase not found. recordTestScenarioId: ${recordTestScenario.recordTestScenarioId}, recordTestCaseId: ${recordTestCaseId}`,
      HttpStatus.NOT_FOUND,
    );
  }

  await softDeleteRecordTestCaseFromMappingTable(manager, recordTestScenarioId, recordTestCase);
}

// export async function attachRecordTestCaseToScenario(
//   manager: EntityManager, //
//   projectId: ProjectId,
//   recordTestScenarioId: RecordTestScenarioId,
//   dto: AddRecordTestCaseToRecordTestScenarioDto,
// ): Promise<void> {
//   const { recordTestCaseId, prevRecordTestCaseId } = dto;
//   const scenario = await manager.getRepository(RecordTestScenario).findOne({ where: { projectId, recordTestScenarioId } });
//   if (!scenario) {
//     throw new HttpException(`RecordTestScenario not found. recordTestScenarioId: ${recordTestScenarioId}`, HttpStatus.NOT_FOUND);
//   }
//   const testCase = await manager.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId } });
//   if (!testCase) {
//     throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
//   }

//   if (prevRecordTestCaseId) {
//     const prevTestCase = await manager.getRepository(RecordTestCase).findOne({ where: { projectId, recordTestCaseId: prevRecordTestCaseId } });
//     if (!prevTestCase) {
//       throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${prevRecordTestCaseId}`, HttpStatus.NOT_FOUND);
//     }
//   }

//   const mappingData = await manager
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

//   if (mappingData) {
//     await softDeleteRecordTestCaseFromMappingTable(manager, recordTestScenarioId, mappingData.recordTestCase!);
//     await addRecordTestCaseToMappingTable(manager, recordTestScenarioId, mappingData.recordTestCase!, prevRecordTestCaseId);
//   } else {
//     await addRecordTestCaseToMappingTable(manager, recordTestScenarioId, testCase, prevRecordTestCaseId);
//   }
// }

export async function softDeleteRecordTestCaseFromMappingTable(
  manager: EntityManager, //
  recordTestScenarioId: RecordTestScenarioId,
  recordTestCase: RecordTestCase,
): Promise<void> {
  const next = await getNextRecordTestCaseInScenario(manager, recordTestScenarioId, recordTestCase);
  if (!next) {
    await manager.getRepository(RecordTestScenarioAndRecordTestCase).softDelete({ recordTestScenarioId, recordTestCaseId: recordTestCase.recordTestCaseId });
    return;
  }
  const prev = await getPrevRecordTestCaseInScenario(manager, recordTestScenarioId, recordTestCase);
  if (prev) {
    await manager
      .getRepository(RecordTestScenarioAndRecordTestCase)
      .update({ recordTestScenarioId, recordTestCaseId: next.recordTestCaseId }, { prevRecordTestCaseId: prev.recordTestCaseId });
  } else {
    await manager.getRepository(RecordTestScenarioAndRecordTestCase).update({ recordTestScenarioId, recordTestCaseId: next.recordTestCaseId }, { prevRecordTestCaseId: null });
  }
  await manager.getRepository(RecordTestScenarioAndRecordTestCase).softDelete({ recordTestScenarioId, recordTestCaseId: recordTestCase.recordTestCaseId });
}

export async function addRecordTestCaseToMappingTable(
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
    if (originRoot) {
      originRoot.prevRecordTestCaseId = recordTestCase.recordTestCaseId;
      await manager.getRepository(RecordTestScenarioAndRecordTestCase).save(originRoot);
    }
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
      .upsert(castEntity(newMiddle), [`${RecordTestScenarioAndRecordTestCasePropCamel.recordTestScenarioId}`, `${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCaseId}`]);
    oldNext.prevRecordTestCaseId = recordTestCase.recordTestCaseId;
    await manager.getRepository(RecordTestScenarioAndRecordTestCase).save(oldNext);
    return;
  }
}

export async function getNextRecordTestCaseInScenario(
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
    .andWhere(`scenarioAndCase.${RecordTestScenarioAndRecordTestCasePropSnake.prev_record_test_case_id} = :${RecordTestScenarioAndRecordTestCasePropCamel.prevRecordTestCaseId}`, {
      prevRecordTestCaseId: recordTestCase.recordTestCaseId,
    })
    .getOne();
  return next?.recordTestCase ?? null;
}

export async function getPrevRecordTestCaseInScenario(
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
