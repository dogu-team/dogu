import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1698840413741 implements MigrationInterface {
  name = 'TypeormMigration1698840413741';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" DROP CONSTRAINT "FK_e47c7377373e996838e863a44fa"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" DROP CONSTRAINT "FK_72a21a92aa304ec99eb11bf00ba"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP CONSTRAINT "FK_6f69921b52404dcec88383af396"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP CONSTRAINT "FK_7f3a9b1877ea3ed8c988ccb8a5f"`);
    await queryRunner.query(`ALTER TABLE "billing_history" DROP CONSTRAINT "FK_5d2a63af01a4c3c4c963778dd65"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6f69921b52404dcec88383af39"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7f3a9b1877ea3ed8c988ccb8a5"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" RENAME COLUMN "billing_info_id" TO "billing_organization_id"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" RENAME COLUMN "billing_info_id" TO "billing_organization_id"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" RENAME CONSTRAINT "UQ_72a21a92aa304ec99eb11bf00ba" TO "UQ_558fae40877c69162910f46bfa5"`);
    await queryRunner.query(`ALTER TABLE "billing_history" RENAME COLUMN "billing_info_id" TO "billing_organization_id"`);
    await queryRunner.query(`CREATE TYPE "public"."billing_organization_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(
      `CREATE TABLE "billing_organization" ("billing_organization_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "category" "public"."billing_organization_category_enum" NOT NULL, "first_purchased_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_7104e5fa10ad9a9db1291409e4d" UNIQUE ("organization_id"), CONSTRAINT "PK_3400907d538fe1d159167e0d274" PRIMARY KEY ("billing_organization_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_organization_and_billing_coupon" ("billing_organization_id" uuid NOT NULL, "billing_coupon_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_656d4d2187356c52cd30593f83e" PRIMARY KEY ("billing_organization_id", "billing_coupon_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_organization_and_billing_promotion" ("billing_organization_id" uuid NOT NULL, "billing_promotion_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_b983ef4ca002de2f0ea188e80f5" PRIMARY KEY ("billing_organization_id", "billing_promotion_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" ADD "billing_organization_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`,
    );
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_6f69921b52404dcec88383af39" ON "billing_history_and_billing_subscription_plan" ("billing_history_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_7f3a9b1877ea3ed8c988ccb8a5" ON "billing_history_and_billing_subscription_plan" ("billing_subscription_plan_id") `);
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan" ADD CONSTRAINT "FK_023c251af3f1a8ae43c2104666b" FOREIGN KEY ("billing_organization_id") REFERENCES "billing_organization"("billing_organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_method_nice" ADD CONSTRAINT "FK_558fae40877c69162910f46bfa5" FOREIGN KEY ("billing_organization_id") REFERENCES "billing_organization"("billing_organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history" ADD CONSTRAINT "FK_96d91370b72acda0eeb1cd4177c" FOREIGN KEY ("billing_organization_id") REFERENCES "billing_organization"("billing_organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD CONSTRAINT "FK_6f69921b52404dcec88383af396" FOREIGN KEY ("billing_history_id") REFERENCES "billing_history"("billing_history_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD CONSTRAINT "FK_7f3a9b1877ea3ed8c988ccb8a5f" FOREIGN KEY ("billing_subscription_plan_id") REFERENCES "billing_subscription_plan"("billing_subscription_plan_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP CONSTRAINT "FK_7f3a9b1877ea3ed8c988ccb8a5f"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP CONSTRAINT "FK_6f69921b52404dcec88383af396"`);
    await queryRunner.query(`ALTER TABLE "billing_history" DROP CONSTRAINT "FK_96d91370b72acda0eeb1cd4177c"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" DROP CONSTRAINT "FK_558fae40877c69162910f46bfa5"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" DROP CONSTRAINT "FK_023c251af3f1a8ae43c2104666b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7f3a9b1877ea3ed8c988ccb8a5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6f69921b52404dcec88383af39"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" DROP COLUMN "billing_organization_id"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`,
    );
    await queryRunner.query(`DROP TABLE "billing_organization_and_billing_promotion"`);
    await queryRunner.query(`DROP TABLE "billing_organization_and_billing_coupon"`);
    await queryRunner.query(`DROP TABLE "billing_organization"`);
    await queryRunner.query(`DROP TYPE "public"."billing_organization_category_enum"`);
    await queryRunner.query(`ALTER TABLE "billing_history" RENAME COLUMN "billing_organization_id" TO "billing_info_id"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" RENAME CONSTRAINT "UQ_558fae40877c69162910f46bfa5" TO "UQ_72a21a92aa304ec99eb11bf00ba"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" RENAME COLUMN "billing_organization_id" TO "billing_info_id"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" RENAME COLUMN "billing_organization_id" TO "billing_info_id"`);
    await queryRunner.query(`CREATE INDEX "IDX_7f3a9b1877ea3ed8c988ccb8a5" ON "billing_history_and_billing_subscription_plan" ("billing_subscription_plan_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_6f69921b52404dcec88383af39" ON "billing_history_and_billing_subscription_plan" ("billing_history_id") `);
    await queryRunner.query(
      `ALTER TABLE "billing_history" ADD CONSTRAINT "FK_5d2a63af01a4c3c4c963778dd65" FOREIGN KEY ("billing_info_id") REFERENCES "billing_info"("billing_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD CONSTRAINT "FK_7f3a9b1877ea3ed8c988ccb8a5f" FOREIGN KEY ("billing_subscription_plan_id") REFERENCES "billing_subscription_plan"("billing_subscription_plan_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD CONSTRAINT "FK_6f69921b52404dcec88383af396" FOREIGN KEY ("billing_history_id") REFERENCES "billing_history"("billing_history_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_method_nice" ADD CONSTRAINT "FK_72a21a92aa304ec99eb11bf00ba" FOREIGN KEY ("billing_info_id") REFERENCES "billing_info"("billing_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan" ADD CONSTRAINT "FK_e47c7377373e996838e863a44fa" FOREIGN KEY ("billing_info_id") REFERENCES "billing_info"("billing_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
