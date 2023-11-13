import { OrganizationId, TestExecutorExecutionId, TestExecutorId, TestExecutorType, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { google } from '@google-cloud/run/build/protos/protos';

import { TestExecutorWebResponsiveBaseTraits } from '..';

export interface TestExecutionBaseRelationTraits {
  testExecutorWebResponsives?: TestExecutorWebResponsiveBaseTraits[];
}

export interface TestExecutorBaseTraits {
  testExecutorId: TestExecutorId;
  type: TestExecutorType;
  organizationId: OrganizationId;
  executionId: TestExecutorExecutionId;
  creatorId: UserId | null;
  createdAt: Date;
  canceledAt: Date | null;
  deletedAt: Date | null;
}

export interface TestExecutorBaseWithExecution {
  execution?: google.cloud.run.v2.IExecution;
}

export type TestExecutorBase = TestExecutorBaseTraits & TestExecutionBaseRelationTraits & TestExecutorBaseWithExecution;
export const TestExecutorPropCamel = propertiesOf<TestExecutorBase>();
export const TestExecutorPropSnake = camelToSnakeCasePropertiesOf<TestExecutorBase>();
