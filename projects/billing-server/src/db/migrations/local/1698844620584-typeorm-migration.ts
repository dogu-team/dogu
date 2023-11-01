import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1698844620584 implements MigrationInterface {
  name = 'TypeormMigration1698844620584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP CONSTRAINT "FK_6f69921b52404dcec88383af396"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP CONSTRAINT "FK_7f3a9b1877ea3ed8c988ccb8a5f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6f69921b52404dcec88383af39"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7f3a9b1877ea3ed8c988ccb8a5"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_7f3a9b1877ea3ed8c988ccb8a5" ON "billing_history_and_billing_subscription_plan" ("billing_subscription_plan_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_6f69921b52404dcec88383af39" ON "billing_history_and_billing_subscription_plan" ("billing_history_id") `);
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD CONSTRAINT "FK_7f3a9b1877ea3ed8c988ccb8a5f" FOREIGN KEY ("billing_subscription_plan_id") REFERENCES "billing_subscription_plan"("billing_subscription_plan_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD CONSTRAINT "FK_6f69921b52404dcec88383af396" FOREIGN KEY ("billing_history_id") REFERENCES "billing_history"("billing_history_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
