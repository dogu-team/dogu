import { BillingHistoryBase, BillingHistoryProp, BillingMethod } from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';

@Entity()
export class BillingHistory implements BillingHistoryBase {
  @PrimaryColumn('uuid')
  billingHistoryId!: string;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @DateColumn()
  purchasedAt!: Date;

  @Column({ type: 'enum', enum: BillingMethod })
  method!: BillingMethod;

  @Column({ type: 'jsonb', nullable: true })
  niceSubscribePaymentsResponse!: Record<string, unknown> | null;

  @Column({ type: 'jsonb' })
  previewResponse!: Record<string, unknown>;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization)
  @JoinColumn({ name: BillingHistoryProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;
}
