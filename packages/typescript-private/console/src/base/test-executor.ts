import { OrganizationId, TestExecutorExecutionId, TestExecutorId, TestExecutorType, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

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

export type TestExecutorBase = TestExecutorBaseTraits;
export const TestExecutorPropCamel = propertiesOf<TestExecutorBase>();
export const TestExecutorPropSnake = camelToSnakeCasePropertiesOf<TestExecutorBase>();
