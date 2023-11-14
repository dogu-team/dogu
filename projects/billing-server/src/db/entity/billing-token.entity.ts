import { BillingTokenBase } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';

@Entity()
export class BillingToken implements BillingTokenBase {
  @PrimaryColumn('uuid')
  billingTokenId!: string;

  @Column({ type: 'character varying', unique: true })
  token!: string;

  @DateColumn({ nullable: true })
  expiredAt!: Date | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;
}
