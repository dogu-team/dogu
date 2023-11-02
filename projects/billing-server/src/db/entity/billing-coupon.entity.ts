import { BillingCouponBase, BillingCouponType } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from './util/decorators';

@Entity()
export class BillingCoupon implements BillingCouponBase {
  @PrimaryColumn('uuid')
  billingCouponId!: string;

  @Column({ type: 'character varying', unique: true })
  code!: string;

  @Column({ type: 'enum', enum: BillingCouponType, default: 'basic' })
  type!: BillingCouponType;

  @Column({ type: 'integer', nullable: true })
  monthlyDiscountPercent!: number | null;

  @Column({ type: 'integer', nullable: true })
  monthlyApplyCount!: number | null;

  @Column({ type: 'integer', nullable: true })
  yearlyDiscountPercent!: number | null;

  @Column({ type: 'integer', nullable: true })
  yearlyApplyCount!: number | null;

  @Column({ type: 'integer', nullable: true })
  remainingAvailableCount!: number | null;

  @DateColumn({ nullable: true })
  expiredAt!: Date | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;
}
