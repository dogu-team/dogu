// import { RoutineBase, RoutineLogBase, UserBase } from '@dogu/console';
// import { RoutineId, ROUTINE_CONFIG_URL_MAX_LENGTH, UserId, UUID_LENGTH } from '@dogu-tech/types';
// import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
// import { ColumnTemplate } from './decorators';
// import { Routine } from './routine.entity';
// import { User } from './user.entity';

// @Entity('routine_log')
// export class RoutineLog implements RoutineLogBase {
//   @PrimaryColumn({ type: 'uuid', name: 'routine_id', length: UUID_LENGTH })
//   routineId!: RoutineId;

//   @PrimaryColumn({ type: 'uuid', name: 'actor_id', length: UUID_LENGTH })
//   actorId!: UserId;

//   @ColumnTemplate.CreateDate('created_at')
//   createdAt!: Date;

//   @ManyToOne(() => Routine, { createForeignKeyConstraints: false })
//   @JoinColumn({ name: 'routine_id' })
//   routine?: RoutineBase;

//   @ManyToOne(() => User, { createForeignKeyConstraints: false })
//   @JoinColumn({ name: 'actor_id' })
//   actor!: UserBase;
// }
