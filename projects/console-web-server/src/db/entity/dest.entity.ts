import { DestBase, DestPropSnake } from '@dogu-private/console';
import { DestId, DEST_NAME_MAX_LENGT, DEST_STATE, DEST_TABLE_NAME, DEST_TYPE, RoutineStepId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { DestEdge } from './relations/dest-edge.entity';
import { RoutineStep } from './step.entity';

@Entity(DEST_TABLE_NAME)
export class Dest extends BaseEntity implements DestBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: DestPropSnake.dest_id, unsigned: true })
  destId!: DestId;

  @Column({ name: DestPropSnake.routine_step_id, type: 'int', unsigned: true, nullable: false })
  routineStepId!: RoutineStepId;

  @Column({ type: 'character varying', name: DestPropSnake.name, length: DEST_NAME_MAX_LENGT, nullable: false })
  name!: string;

  @Column({ type: 'smallint', name: DestPropSnake.state, default: DEST_STATE.PENDING, unsigned: true, nullable: false })
  state!: DEST_STATE;

  @Column({ type: 'int', name: DestPropSnake.index, unsigned: true, nullable: false })
  index!: number;

  @Column({ type: 'smallint', name: DestPropSnake.type, unsigned: true, nullable: false })
  type!: DEST_TYPE;

  @ColumnTemplate.CreateDate(DestPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.Date(DestPropSnake.local_in_progress_at, true)
  localInProgressAt!: Date | null;

  @ColumnTemplate.Date(DestPropSnake.local_completed_at, true)
  localCompletedAt!: Date | null;

  @ColumnTemplate.UpdateDate(DestPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(DestPropSnake.deleted_at)
  deletedAt!: Date | null;

  /**
   * @description received from client's local time
   */
  @ColumnTemplate.Date(DestPropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  /**
   * @description received from client's local time
   */
  @ColumnTemplate.Date(DestPropSnake.completed_at, true)
  completedAt!: Date | null;

  @OneToMany(() => DestEdge, (destEdge) => destEdge.dest, { cascade: ['soft-remove'] })
  destEdges?: DestEdge[];

  @ManyToOne(() => RoutineStep, (step) => step.dests, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: `${DestPropSnake.routine_step_id}` })
  routineStep?: RoutineStep;

  children?: Dest[];
}
