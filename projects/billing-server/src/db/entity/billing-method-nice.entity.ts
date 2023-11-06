import { BillingMethodNiceBase, BillingMethodNiceProp } from '@dogu-private/console';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingOrganization } from './billing-organization.entity';

@Entity()
export class BillingMethodNice implements BillingMethodNiceBase {
  @PrimaryColumn('uuid')
  billingMethodNiceId!: string;

  @Column({ type: 'uuid', unique: true })
  billingOrganizationId!: string;

  @Column({ type: 'character varying', nullable: true })
  bid!: string | null;

  @Column({ type: 'character varying', nullable: true })
  cardCode!: string | null;

  @Column({ type: 'character varying', nullable: true })
  cardName!: string | null;

  @Column({ type: 'character varying', nullable: true })
  cardNumberLast4Digits!: string | null;

  @Column({ type: 'character varying', nullable: true })
  expirationYear!: string | null;

  @Column({ type: 'character varying', nullable: true })
  expirationMonth!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  subscribeRegistResponse!: Record<string, unknown> | null;

  @DateColumn({ nullable: true })
  subscribeRegistAt!: Date | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @OneToOne(() => BillingOrganization)
  @JoinColumn({ name: BillingMethodNiceProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;
}
