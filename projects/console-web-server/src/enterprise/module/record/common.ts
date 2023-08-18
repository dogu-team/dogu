import { RecordTestCaseBase, RecordTestCaseResponse, RecordTestScenarioBase, RecordTestStepResponse } from '@dogu-private/console';
import { OrganizationId, platformTypeFromPlatform, ProjectId } from '@dogu-private/types';
import { DoguDevicePlatformHeader, DoguDeviceSerialHeader, DoguRemoteDeviceJobIdHeader, DoguRequestTimeoutHeader, HeaderRecord } from '@dogu-tech/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Device } from '../../../db/entity/device.entity';
import { RecordTestCase } from '../../../db/entity/record-test-case.entity';
import { RemoteWebDriverBatchRequestExecutor } from '../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import { RemoteWebDriverService } from '../../../module/remote/remote-webdriver/remote-webdriver.service';

export function getSortedRecordTestCases(recordTestScenario: RecordTestScenarioBase): RecordTestCaseBase[] {
  return [];

  // const mappingData = recordTestScenario.recordTestScenarioAndRecordTestCases ?? [];
  // if (mappingData.length === 0) {
  //   return [];
  // }

  // const sortedTestCase: RecordTestCaseBase[] = [];

  // const first = mappingData.find((data) => data.recordTestCase?.recordTestCaseId === null);
  // if (!first) {
  //   throw new HttpException(`Firt RecordTestCase not found. recordTestScenarioId: ${recordTestScenario.recordTestScenarioId}`, HttpStatus.NOT_FOUND);
  // }

  // const sortedSteps = getSortedRecordTestSteps(first.recordTestCase!);
  // first.recordTestCase!.recordTestSteps = sortedSteps;
  // sortedTestCase.push(first.recordTestCase!);

  // let nextId = first.recordTestCaseId;
  // while (true) {
  //   const next = mappingData.find((data) => data.prevRecordTestCaseId === nextId);
  //   if (!next) {
  //     break;
  //   }
  //   const isDuplicate = sortedTestCase.some((step) => step.recordTestCaseId === next.recordTestCaseId);
  //   if (isDuplicate) {
  //     throw new HttpException(`Duplicate RecordTestCase found. recordTestCaseId: ${next.recordTestCaseId}`, HttpStatus.BAD_REQUEST);
  //   }

  //   const sortedSteps = getSortedRecordTestSteps(next.recordTestCase!);
  //   next.recordTestCase!.recordTestSteps = sortedSteps;
  //   sortedTestCase.push(next.recordTestCase!);
  //   nextId = next.recordTestCaseId;
  // }

  // const caseResponses: RecordTestCaseResponse[] = [];

  // for (const testCase of sortedTestCase) {
  // }

  // return sortedTestCase;
}

export function getSortedRecordTestSteps(recordTestCase: RecordTestCaseResponse): RecordTestStepResponse[] {
  const recordTestSteps = recordTestCase.recordTestSteps ?? [];
  if (recordTestSteps.length === 0) {
    return [];
  }

  const sortedTestStep: RecordTestStepResponse[] = [];
  const first = recordTestSteps.find((data) => data.prevRecordTestStepId === null);
  if (!first) {
    throw new HttpException(`Firt RecordTestStep not found. recordTestCaseId: ${recordTestCase.recordTestCaseId}`, HttpStatus.NOT_FOUND);
  }
  sortedTestStep.push(first);

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
  const activeDeviceSerial = recordTestCase.activeDeviceSerial;
  if (!activeDeviceSerial) {
    throw new HttpException(`Device does not have activeDeviceSerial. RecordTestCaseId: ${recordTestCase.recordTestCaseId}`, HttpStatus.NOT_FOUND);
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
