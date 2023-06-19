import { DeviceId, OrganizationId } from '@dogu-private/types';
import { BaseEntity, Entity, PrimaryColumn } from 'typeorm';

@Entity('organization_and_group')
export class OrganizationAndGroup extends BaseEntity {
  @PrimaryColumn({ type: 'uuid', name: 'organization_id', nullable: false })
  organizationId!: OrganizationId;

  @PrimaryColumn({ type: 'uuid', name: 'device_id', nullable: false })
  deviceId!: DeviceId;
}
