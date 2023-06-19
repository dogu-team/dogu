import { HostBase, HostPropCamel, HostPropSnake } from '@dogu-private/console';
import { HostConnectionState, HostId, HOST_NAME_MAX_LENGTH, HOST_TABLE_NAME, HOST_WORKSPACE_PATH_MAX_LENGTH, OrganizationId, Platform, TokenId, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';
import { Organization } from './organization.entity';
import { Token } from './token.entity';
import { User } from './user.entity';

@Entity(HOST_TABLE_NAME)
export class Host extends BaseEntity implements HostBase {
  @PrimaryGeneratedColumn('uuid', { name: HostPropSnake.host_id })
  hostId!: HostId;

  @ColumnTemplate.RelationUuid(HostPropSnake.organization_id)
  organizationId!: OrganizationId;

  @Column({ type: 'uuid', name: HostPropSnake.creator_id, unique: false, nullable: false })
  creatorId!: UserId;

  @Column({ type: 'character varying', name: HostPropSnake.name, length: HOST_NAME_MAX_LENGTH, unique: false, nullable: false })
  name!: string;

  @Column({ type: 'smallint', name: HostPropSnake.platform, default: Platform.PLATFORM_UNSPECIFIED, nullable: false })
  platform!: Platform;

  @Column({ type: 'character varying', name: HostPropSnake.root_workspace, length: HOST_WORKSPACE_PATH_MAX_LENGTH, unique: false, default: '', nullable: false })
  rootWorkspace!: string;

  @Column({ type: 'smallint', name: HostPropSnake.connection_state, default: HostConnectionState.HOST_CONNECTION_STATE_DISCONNECTED, nullable: false })
  connectionState!: HostConnectionState;

  @Column({ type: 'int', name: HostPropSnake.device_server_port, default: 0, nullable: false })
  deviceServerPort!: number;

  @ColumnTemplate.RelationUuid(HostPropSnake.token_id)
  tokenId!: TokenId;

  @ColumnTemplate.Date(HostPropSnake.heartbeat, true)
  heartbeat!: Date | null;

  @ColumnTemplate.CreateDate(HostPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(HostPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(HostPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Organization, (organization) => organization.hosts, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: HostPropSnake.organization_id })
  organization!: Organization;

  @OneToMany(() => Device, (device) => device.host)
  devices?: Device[];

  @OneToOne(() => Device, (device) => device.host)
  hostDevice?: Device;

  @ManyToOne(() => User, (user) => user.hosts, { createForeignKeyConstraints: false })
  @JoinColumn({ name: HostPropSnake.creator_id })
  creator?: User;

  @OneToOne(() => Token, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION', cascade: ['soft-remove'] })
  @JoinColumn({ name: HostPropSnake.token_id, referencedColumnName: HostPropCamel.tokenId })
  token?: Token;
}
