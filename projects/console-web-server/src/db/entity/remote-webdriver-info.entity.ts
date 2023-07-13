import { RemoteWebDriverInfoBase, RemoteWebDriverInfoPropSnake } from '@dogu-private/console';
import { RemotePropCamel } from '@dogu-private/console/src/base/remote';
import { RemoteId, RemoteWebDriverInfoId, REMOTE_WEBDRIVER_INFO_TABLE_NAME, WebDriverSessionId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Remote } from './remote.entity';

@Entity(REMOTE_WEBDRIVER_INFO_TABLE_NAME)
export class RemoteWebDriverInfo extends BaseEntity implements RemoteWebDriverInfoBase {
  @PrimaryColumn({ type: 'uuid', name: RemoteWebDriverInfoPropSnake.remote_web_driver_info_id })
  remoteWebDriverInfoId!: RemoteWebDriverInfoId;

  @ColumnTemplate.RelationUuid(RemoteWebDriverInfoPropSnake.remote_id)
  remoteId!: RemoteId;

  @Column({ type: 'uuid', name: RemoteWebDriverInfoPropSnake.session_id, nullable: false, unique: true })
  sessionId!: WebDriverSessionId;

  @Column({ type: 'character varying', name: `${RemoteWebDriverInfoPropSnake.browser_name}`, nullable: true })
  browserName!: string | null;

  @Column({ type: 'character varying', name: `${RemoteWebDriverInfoPropSnake.browser_version}`, nullable: true })
  browserVersion!: string | null;

  @ColumnTemplate.CreateDate(RemoteWebDriverInfoPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RemoteWebDriverInfoPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RemoteWebDriverInfoPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Remote, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RemoteWebDriverInfoPropSnake.remote_id, referencedColumnName: RemotePropCamel.remoteId })
  remote?: Remote;
}
