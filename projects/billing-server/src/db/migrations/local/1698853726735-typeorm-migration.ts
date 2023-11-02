import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1698853726735 implements MigrationInterface {
  name = 'TypeormMigration1698853726735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_organization_used_billing_coupon" DROP CONSTRAINT "PK_84fd839753ecefee0cc78bc2bf0"`);
    await queryRunner.query(
      `ALTER TABLE "billing_organization_used_billing_coupon" ADD CONSTRAINT "PK_4637389ea4f7602fa3740fdfa04" PRIMARY KEY ("billingOrganizationId", "billingCouponId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_organization_used_billing_coupon" DROP CONSTRAINT "PK_4637389ea4f7602fa3740fdfa04"`);
    await queryRunner.query(`ALTER TABLE "billing_organization_used_billing_coupon" ADD CONSTRAINT "PK_84fd839753ecefee0cc78bc2bf0" PRIMARY KEY ("billingOrganizationId")`);
  }
}
