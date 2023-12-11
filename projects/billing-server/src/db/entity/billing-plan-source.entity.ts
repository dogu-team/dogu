import { BillingCategory, BillingCurrency, BillingPeriod, BillingPlanSourceBase, BillingPlanSourceProp, BillingPlanType } from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';

export const BillingPlanSourceTableName = 'billing_plan_source';

@Entity(BillingPlanSourceTableName)
export class BillingPlanSource implements BillingPlanSourceBase {
  @PrimaryColumn({ type: 'integer' })
  billingPlanSourceId!: number;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', enum: BillingPlanType })
  type!: BillingPlanType;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'integer' })
  option!: number;

  @Column({ type: 'enum', enum: BillingCurrency })
  currency!: BillingCurrency;

  @Column({ type: 'enum', enum: BillingPeriod })
  period!: BillingPeriod;

  @Column({ type: 'double precision' })
  originPrice!: number;

  @Column({ type: 'uuid', nullable: true })
  billingOrganizationId!: string | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization, (billingOrganization) => billingOrganization.billingPlanSources)
  @JoinColumn({ name: BillingPlanSourceProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;
}
