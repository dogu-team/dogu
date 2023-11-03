import { TestExecutorId, TestExecutorWebResponsiveId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export type TestExecutorWebResponsiveSnapshots = {
  [display: string]: string;
};

export interface TestExecutorWebResponsiveBaseTraits {
  testExecutorWebResponsiveId: TestExecutorWebResponsiveId;
  testExecutorId: TestExecutorId;
  url: string;
  snapshotCount: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export type TestExecutorWebResponsiveBase = TestExecutorWebResponsiveBaseTraits;
export const TestExecutorWebResponsivePropCamel = propertiesOf<TestExecutorWebResponsiveBase>();
export const TestExecutorWebResponsivePropSnake = camelToSnakeCasePropertiesOf<TestExecutorWebResponsiveBase>();
