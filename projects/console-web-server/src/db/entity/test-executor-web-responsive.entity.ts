import { TestExecutorWebResponsiveBaseTraits, TestExecutorWebResponsivePropSnake } from '@dogu-private/console';
import { Vendor } from '@dogu-private/device-data';
import { TestExecutorId, TestExecutorWebResponsiveId, TestExecutorWebResponsiveUrl, TEST_EXECUTOR_WEB_RESPONSIVE_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { TestExecutor } from './test-executor.entity';

@Entity(TEST_EXECUTOR_WEB_RESPONSIVE_TABLE_NAME)
export class TestExecutorWebResponsive extends BaseEntity implements TestExecutorWebResponsiveBaseTraits {
  @PrimaryGeneratedColumn('increment', { name: TestExecutorWebResponsivePropSnake.test_executor_web_responsive_id })
  testExecutorWebResponsiveId!: TestExecutorWebResponsiveId;

  @ColumnTemplate.RelationUuid(TestExecutorWebResponsivePropSnake.test_executor_id)
  testExecutorId!: TestExecutorId;

  @Column({ type: 'character varying', name: TestExecutorWebResponsivePropSnake.url, nullable: false })
  url!: TestExecutorWebResponsiveUrl;

  @Column({ type: 'integer', name: TestExecutorWebResponsivePropSnake.snapshot_count, default: 0 })
  snapshotCount!: number;

  @Column({ type: 'varchar', name: TestExecutorWebResponsivePropSnake.vendors, nullable: false, array: true, length: 255 })
  vendors!: Vendor[];

  @ColumnTemplate.CreateDate(TestExecutorWebResponsivePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(TestExecutorWebResponsivePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => TestExecutor, (testExecutor) => testExecutor.testExecutorWebResponsives, { createForeignKeyConstraints: false })
  @JoinColumn({ name: TestExecutorWebResponsivePropSnake.test_executor_id })
  testExecutor?: TestExecutor;
}
