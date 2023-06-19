import { UserVisitBase, UserVisitPropCamel, UserVisitPropSnake } from '@dogu-private/console';
import { OrganizationId, UserId, USER_VISIT_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity(USER_VISIT_TABLE_NAME)
export class UserVisit extends BaseEntity implements UserVisitBase {
  @PrimaryColumn({ type: 'uuid', name: UserVisitPropSnake.user_id, nullable: false })
  userId!: UserId;

  @PrimaryColumn({ type: 'uuid', name: UserVisitPropSnake.organization_id, nullable: false })
  organizationId!: OrganizationId;

  // @ColumnTemplate.RelationUuid(VisitPropSnake.project_id, true)
  // projectId!: ProjectId | null;

  @ColumnTemplate.CreateDate(UserVisitPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(UserVisitPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(UserVisitPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.userVisits, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({
    name: UserVisitPropSnake.user_id, //
    referencedColumnName: UserVisitPropCamel.userId,
  })
  user?: User;

  @ManyToOne(() => Organization, (organization) => organization.userVisits, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({
    name: UserVisitPropSnake.organization_id, //
    referencedColumnName: UserVisitPropCamel.organizationId,
  })
  organization?: Organization;
}
