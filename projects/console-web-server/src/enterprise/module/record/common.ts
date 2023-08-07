import { RecordTestCaseResponse } from '@dogu-private/console';
import { RecordTestStepResponse } from '@dogu-private/console/src/dto/record/record-test-step.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RecordTestCase } from '../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../db/entity/record-test-scenario.entity';

export function getSortedRecordTestCases(recordTestScenario: RecordTestScenario): RecordTestCaseResponse[] {
  const mappingData = recordTestScenario.recordTestScenarioAndRecordTestCases ?? [];
  if (mappingData.length === 0) {
    return [];
  }

  const sortedTestCase: RecordTestCaseResponse[] = [];

  const first = mappingData.find((data) => data.recordTestCase?.recordTestCaseId === null);
  if (!first) {
    throw new HttpException(`Firt RecordTestCase not found. recordTestScenarioId: ${recordTestScenario.recordTestScenarioId}`, HttpStatus.NOT_FOUND);
  }
  const sortedSteps = getSortedRecordTestSteps(first.recordTestCase!);
  sortedTestCase.push({
    ...first.recordTestCase!,
    recordTestSteps: sortedSteps,
  });

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
    sortedTestCase.push({
      ...next.recordTestCase!,
      recordTestSteps: sortedSteps,
    });
    nextId = next.recordTestCaseId;
  }

  return sortedTestCase;
}

export function getSortedRecordTestSteps(recordTestCase: RecordTestCase): RecordTestStepResponse[] {
  const mappingData = recordTestCase.recordTestCaseAndRecordTestSteps ?? [];
  if (mappingData.length === 0) {
    return [];
  }

  const sortedTestStep: RecordTestStepResponse[] = [];
  const first = mappingData.find((data) => data.recordTestStep?.recordTestStepId === null);
  if (!first) {
    throw new HttpException(`Firt RecordTestStep not found. recordTestCaseId: ${recordTestCase.recordTestCaseId}`, HttpStatus.NOT_FOUND);
  }
  sortedTestStep.push(first.recordTestStep!);

  let nextId = first.recordTestStepId;
  while (true) {
    const next = mappingData.find((data) => data.prevRecordTestStepId === nextId);
    if (!next) {
      break;
    }

    const isDuplicate = sortedTestStep.some((step) => step.recordTestStepId === next.recordTestStepId);
    if (isDuplicate) {
      throw new HttpException(`Duplicate RecordTestStep. recordTestStepId: ${next.recordTestStepId}`, HttpStatus.BAD_REQUEST);
    }

    sortedTestStep.push(next.recordTestStep!);
    nextId = next.recordTestStepId;
  }

  return sortedTestStep;
}
