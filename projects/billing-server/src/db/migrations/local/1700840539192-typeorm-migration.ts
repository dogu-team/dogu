import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1700840539192 implements MigrationInterface {
  name = 'TypeormMigration1700840539192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" ADD "name" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" DROP CONSTRAINT "FK_d3f6af8c6caf12c9824a2c723e2"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_info" DROP CONSTRAINT "FK_e93d1b91b4959f087a3fd2cbda7"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" DROP CONSTRAINT "FK_66867dcca26b0a7aa5b4de0e75f"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" DROP CONSTRAINT "PK_a702dc53dd82855daf54e7b2cc6"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" DROP COLUMN "billingSubscriptionPlanSourceId"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" ADD "billingSubscriptionPlanSourceId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" ADD CONSTRAINT "PK_a702dc53dd82855daf54e7b2cc6" PRIMARY KEY ("billingSubscriptionPlanSourceId")`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" ALTER COLUMN "billingOrganizationId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" DROP COLUMN "billingSubscriptionPlanSourceId"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" ADD "billingSubscriptionPlanSourceId" integer`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_info" DROP COLUMN "billingSubscriptionPlanSourceId"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_info" ADD "billingSubscriptionPlanSourceId" integer`);
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_source" ADD CONSTRAINT "FK_66867dcca26b0a7aa5b4de0e75f" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_history" ADD CONSTRAINT "FK_d3f6af8c6caf12c9824a2c723e2" FOREIGN KEY ("billingSubscriptionPlanSourceId") REFERENCES "billing_subscription_plan_source"("billingSubscriptionPlanSourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_info" ADD CONSTRAINT "FK_e93d1b91b4959f087a3fd2cbda7" FOREIGN KEY ("billingSubscriptionPlanSourceId") REFERENCES "billing_subscription_plan_source"("billingSubscriptionPlanSourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_info" DROP CONSTRAINT "FK_e93d1b91b4959f087a3fd2cbda7"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" DROP CONSTRAINT "FK_d3f6af8c6caf12c9824a2c723e2"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" DROP CONSTRAINT "FK_66867dcca26b0a7aa5b4de0e75f"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_info" DROP COLUMN "billingSubscriptionPlanSourceId"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_info" ADD "billingSubscriptionPlanSourceId" uuid`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" DROP COLUMN "billingSubscriptionPlanSourceId"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" ADD "billingSubscriptionPlanSourceId" uuid`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" ALTER COLUMN "billingOrganizationId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" DROP CONSTRAINT "PK_a702dc53dd82855daf54e7b2cc6"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" DROP COLUMN "billingSubscriptionPlanSourceId"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" ADD "billingSubscriptionPlanSourceId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" ADD CONSTRAINT "PK_a702dc53dd82855daf54e7b2cc6" PRIMARY KEY ("billingSubscriptionPlanSourceId")`);
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_source" ADD CONSTRAINT "FK_66867dcca26b0a7aa5b4de0e75f" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_info" ADD CONSTRAINT "FK_e93d1b91b4959f087a3fd2cbda7" FOREIGN KEY ("billingSubscriptionPlanSourceId") REFERENCES "billing_subscription_plan_source"("billingSubscriptionPlanSourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_history" ADD CONSTRAINT "FK_d3f6af8c6caf12c9824a2c723e2" FOREIGN KEY ("billingSubscriptionPlanSourceId") REFERENCES "billing_subscription_plan_source"("billingSubscriptionPlanSourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" DROP COLUMN "name"`);
  }
}
