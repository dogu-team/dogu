import { LiveSessionBase, LiveSessionPropCamel, LiveSessionPropSnake } from '@dogu-private/console';
import { DeviceId, LiveSessionId, LiveSessionState, OrganizationId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';
import { Organization } from './organization.entity';

export const LIVE_SESSION_TABLE_NAME = 'live_session';

@Entity(LIVE_SESSION_TABLE_NAME)
export class LiveSession implements LiveSessionBase {
  @PrimaryColumn({ type: 'uuid', name: LiveSessionPropSnake.live_session_id, nullable: false })
  liveSessionId!: LiveSessionId;

  @ColumnTemplate.RelationUuid(LiveSessionPropSnake.organization_id)
  organizationId!: OrganizationId;

  @ColumnTemplate.RelationUuid(LiveSessionPropSnake.device_id)
  deviceId!: DeviceId;

  @Column({ type: 'enum', name: LiveSessionPropSnake.state, enum: LiveSessionState, default: LiveSessionState.CREATED, nullable: false })
  state!: LiveSessionState;

  @ColumnTemplate.Date(LiveSessionPropSnake.close_wait_at, true)
  @Type(() => Date)
  @IsOptional()
  closeWaitAt!: Date | null;

  @ColumnTemplate.Date(LiveSessionPropSnake.closed_at, true)
  @Type(() => Date)
  @IsOptional()
  closedAt!: Date | null;

  @ColumnTemplate.CreateDate(LiveSessionPropSnake.created_at)
  @Type(() => Date)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(LiveSessionPropSnake.updated_at)
  @Type(() => Date)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(LiveSessionPropSnake.deleted_at)
  @Type(() => Date)
  @IsOptional()
  deletedAt!: Date | null;

  @ManyToOne(() => Organization, (organization) => organization.liveSessions, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: LiveSessionPropSnake.organization_id, referencedColumnName: LiveSessionPropCamel.organizationId })
  organization?: Organization;

  @ManyToOne(() => Device, (device) => device.liveSessions, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: LiveSessionPropSnake.device_id, referencedColumnName: LiveSessionPropCamel.deviceId })
  device?: Device;
}
