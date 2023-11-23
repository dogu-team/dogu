import { BillingMethodPaddleBase, BillingMethodPaddleProp } from '@dogu-private/console';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';

@Entity()
export class BillingMethodPaddle implements BillingMethodPaddleBase {
  @PrimaryColumn('uuid')
  billingMethodPaddleId!: string;

  @Column({ type: 'uuid', unique: true })
  billingOrganizationId!: string;

  @Column({ type: 'character varying', nullable: true })
  customerId!: string | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @OneToOne(() => BillingOrganization)
  @JoinColumn({ name: BillingMethodPaddleProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;
}
