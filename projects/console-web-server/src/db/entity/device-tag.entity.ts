import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { DeviceAndDeviceTagPropCamel, DeviceAndDeviceTagPropSnake, DeviceTagBase, DeviceTagPropSnake } from '@dogu-private/console';
import { DeviceTagId, DEVICE_AND_DEVICE_TAG_TABLE_NAME, DEVICE_TAG_NAME_MAX_LENGTHC, DEVICE_TAG_TABLE_NAME, OrganizationId } from '@dogu-private/types';
import { ColumnTemplate } from './decorators';
import { Device, DeviceAndDeviceTag, Organization } from './index';

@Entity(DEVICE_TAG_TABLE_NAME)
export class DeviceTag extends BaseEntity implements DeviceTagBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: DeviceTagPropSnake.device_tag_id, unsigned: true })
  deviceTagId!: DeviceTagId;

  @ColumnTemplate.RelationUuid(DeviceTagPropSnake.organization_id)
  organizationId!: OrganizationId;

  @Column({ type: 'character varying', name: DeviceTagPropSnake.name, length: DEVICE_TAG_NAME_MAX_LENGTHC, unique: false, nullable: false })
  name!: string;

  @ColumnTemplate.CreateDate(DeviceTagPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(DeviceTagPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(DeviceTagPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Organization, (organization) => organization.deviceTags, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: DeviceTagPropSnake.organization_id })
  organization!: Organization;

  @ManyToMany(() => Device, { createForeignKeyConstraints: false })
  @JoinTable({
    name: DEVICE_AND_DEVICE_TAG_TABLE_NAME,
    inverseJoinColumn: {
      name: DeviceAndDeviceTagPropSnake.device_id,
      referencedColumnName: DeviceAndDeviceTagPropCamel.deviceId,
    },
    joinColumn: {
      name: DeviceAndDeviceTagPropSnake.device_tag_id,
      referencedColumnName: DeviceAndDeviceTagPropCamel.deviceTagId,
    },
  })
  devices!: Device[];

  @OneToMany(() => DeviceAndDeviceTag, (deviceAndDeviceTag) => deviceAndDeviceTag.deviceTag, { cascade: ['soft-remove'] })
  deviceAndDeviceTags!: DeviceAndDeviceTag[];
}
