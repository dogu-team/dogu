// import { LogBase } from '@dogu-private/console';
// import { LogId, LOG_CONTENTS_MAX_LENGTH, RoutineStepId } from '@dogu-private/types';
// import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// import { ColumnTemplate } from './decorators';

// @Entity('log')
// export class Log extends BaseEntity implements LogBase {
//   @PrimaryGeneratedColumn('uuid', { name: 'log_id' })
//   logId!: LogId;

//   @ColumnTemplate.RelationUuid('step_id')
//   stepId!: RoutineStepId;

//   @Column({ type: 'character varying', name: 'content', length: LOG_CONTENTS_MAX_LENGTH, nullable: false })
//   content!: string;

//   @ColumnTemplate.CreateDate('created_at')
//   createdAt!: Date;
// }
