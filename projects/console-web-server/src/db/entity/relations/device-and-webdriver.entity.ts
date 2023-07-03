import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DeviceAndWebDriverBase, DeviceAndWebDriverPropSnake } from '@dogu-private/console';
import { DeviceId, DeviceWebDriverId, DEVICE_AND_WEBDRIVER_TABLE_NAME, WebDriverSessionId } from '@dogu-private/types';
import { ColumnTemplate } from '../decorators';
import { Device } from '../device.entity';

@Entity(DEVICE_AND_WEBDRIVER_TABLE_NAME)
export class DeviceAndWebDriver extends BaseEntity implements DeviceAndWebDriverBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: DeviceAndWebDriverPropSnake.device_web_driver_id, unsigned: true })
  deviceWebDriverId!: DeviceWebDriverId;

  @ColumnTemplate.RelationUuid(DeviceAndWebDriverPropSnake.session_id)
  sessionId!: WebDriverSessionId;

  @ColumnTemplate.RelationUuid(DeviceAndWebDriverPropSnake.device_id)
  deviceId!: DeviceId;

  @ColumnTemplate.CreateDate(DeviceAndWebDriverPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(DeviceAndWebDriverPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(DeviceAndWebDriverPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Device, { createForeignKeyConstraints: false })
  @JoinColumn({ name: DeviceAndWebDriverPropSnake.device_id })
  device!: Device;
}
