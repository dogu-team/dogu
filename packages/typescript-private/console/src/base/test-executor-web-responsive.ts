import { Vendor } from '@dogu-private/device-data';
import { TestExecutorId, TestExecutorWebResponsiveId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export type TestExecutorWebResponsiveSnapshot = {
  vendors: Vendor[];
  images: {
    [display: string]: string;
  };
};

export type TestExecutorWebResponsiveSnapshotMap = {
  [url: string]: TestExecutorWebResponsiveSnapshot;
};

export interface TestExecutorWebResponsiveBaseTraits {
  testExecutorWebResponsiveId: TestExecutorWebResponsiveId;
  testExecutorId: TestExecutorId;
  url: string;
  snapshotCount: number;
  vendors: Vendor[];
  createdAt: Date;
  deletedAt: Date | null;
}

export type TestExecutorWebResponsiveBase = TestExecutorWebResponsiveBaseTraits;
export const TestExecutorWebResponsivePropCamel = propertiesOf<TestExecutorWebResponsiveBase>();
export const TestExecutorWebResponsivePropSnake = camelToSnakeCasePropertiesOf<TestExecutorWebResponsiveBase>();
