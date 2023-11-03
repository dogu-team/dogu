import { TestExecutorBase, TestExecutorPropSnake } from '@dogu-private/console';
import { OrganizationId, TestExecutorExecutionId, TestExecutorId, TestExecutorType, TEST_EXECUTOR_TABLE_NAME, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { TestExecutorWebResponsive } from './test-executor-web-responsive.entity';
import { User } from './user.entity';

@Entity(TEST_EXECUTOR_TABLE_NAME)
export class TestExecutor extends BaseEntity implements TestExecutorBase {
  @PrimaryGeneratedColumn('uuid', { name: TestExecutorPropSnake.test_executor_id })
  testExecutorId!: TestExecutorId;

  @Column({ type: 'character varying', name: TestExecutorPropSnake.type, nullable: false })
  type!: TestExecutorType;

  @ColumnTemplate.RelationUuid(TestExecutorPropSnake.organization_id)
  organizationId!: OrganizationId;

  @Column({ type: 'character varying', name: TestExecutorPropSnake.execution_id, nullable: true })
  executionId!: TestExecutorExecutionId;

  @ColumnTemplate.RelationUuid(TestExecutorPropSnake.creator_id, true)
  creatorId!: UserId;

  @ColumnTemplate.CreateDate(TestExecutorPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.Date(TestExecutorPropSnake.canceled_at, true)
  canceledAt!: Date | null;

  @ColumnTemplate.DeleteDate(TestExecutorPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => TestExecutorWebResponsive, (webResponsive) => webResponsive.testExecutor, { createForeignKeyConstraints: false })
  webResponsives?: TestExecutorWebResponsive[];

  @ManyToOne(() => User, (user) => user.routinePipelines, { createForeignKeyConstraints: false })
  @JoinColumn({ name: TestExecutorPropSnake.creator_id })
  creator?: User;
}
