// @Entity('token')
// export class BillingApiToken implements BillingApiTokenBase {
//   @PrimaryColumn('uuid', { name: BillingApiTokenPropSnake.billing_api_token_id })
//   billingApiTokenId!: string;

//   @PrimaryColumn({ type: 'character varying', name: BillingApiTokenPropSnake.token })
//   token!: string;

//   @ColumnTemplate.CreateDate(BillingApiTokenPropSnake.created_at)
//   createdAt!: Date;

//   @ColumnTemplate.Date(BillingApiTokenPropSnake.expired_at, true)
//   expiredAt!: Date | null;

//   @ColumnTemplate.DeleteDate(BillingApiTokenPropSnake.deleted_at)
//   deletedAt!: Date | null;
// }
