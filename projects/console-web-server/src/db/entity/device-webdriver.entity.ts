import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DeviceWebDriverBase, DeviceWebDriverPropSnake } from '@dogu-private/console';
import { DeviceId, DeviceWebDriverId, DEVICE_WEBDRIVER_TABLE_NAME, WebDriverSessionId } from '@dogu-private/types';
import { ColumnTemplate } from './decorators';
import { Device } from './index';

@Entity(DEVICE_WEBDRIVER_TABLE_NAME)
export class DeviceWebDriver extends BaseEntity implements DeviceWebDriverBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: DeviceWebDriverPropSnake.device_web_driver_id, unsigned: true })
  deviceWebDriverId!: DeviceWebDriverId;

  @ColumnTemplate.RelationUuid(DeviceWebDriverPropSnake.session_id)
  sessionId!: WebDriverSessionId;

  @ColumnTemplate.RelationUuid(DeviceWebDriverPropSnake.device_id)
  deviceId!: DeviceId;

  @ColumnTemplate.CreateDate(DeviceWebDriverPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(DeviceWebDriverPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(DeviceWebDriverPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Device, { createForeignKeyConstraints: false })
  @JoinColumn({ name: DeviceWebDriverPropSnake.device_id })
  device!: Device;
}
