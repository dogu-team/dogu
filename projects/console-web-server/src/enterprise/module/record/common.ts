import { HttpException, HttpStatus } from '@nestjs/common';
import { RecordTestCase } from '../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../db/entity/record-test-scenario.entity';
import { RecordTestStep } from '../../../db/entity/record-test-step.entity';

export function getSortedRecordTestCases(recordTestScenario: RecordTestScenario): RecordTestCase[] {
  const mappingData = recordTestScenario.recordTestScenarioAndRecordTestCases ?? [];
  if (mappingData.length === 0) {
    return [];
  }

  const sortedTestCase: RecordTestCase[] = [];

  const first = mappingData.find((data) => data.recordTestCase?.recordTestCaseId === null);
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
