import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1698824725762 implements MigrationInterface {
  name = 'TypeormMigration1698824725762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "billing_history_and_billing_subscription_plan" ("billing_history_id" uuid NOT NULL, "billing_subscription_plan_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_8007532025f67f8c66cdf988028" PRIMARY KEY ("billing_history_id", "billing_subscription_plan_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_coupon" ("billing_coupon_id" uuid NOT NULL, "code" character varying NOT NULL, "monthly_discount_percent" integer, "monthly_apply_count" integer, "yearly_discount_percent" integer, "yearly_apply_count" integer, "remaining_available_count" integer, "expired_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_00fad1b7bdccd28013dafc534dd" UNIQUE ("code"), CONSTRAINT "PK_a61c816a89f179c2d208267fdc3" PRIMARY KEY ("billing_coupon_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_info_and_billing_coupon" ("billing_info_id" uuid NOT NULL, "billing_coupon_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_a578bb8e2086cd74a06486582a1" PRIMARY KEY ("billing_info_id", "billing_coupon_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_method_nice" ("billing_method_nice_id" uuid NOT NULL, "billing_info_id" uuid NOT NULL, "bid" character varying, "card_code" character varying, "card_name" character varying, "card_no_last_4" character varying, "subscribe_regist_response" jsonb, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_72a21a92aa304ec99eb11bf00ba" UNIQUE ("billing_info_id"), CONSTRAINT "REL_72a21a92aa304ec99eb11bf00b" UNIQUE ("billing_info_id"), CONSTRAINT "PK_2a604a826dc51af43eebfcb67f7" PRIMARY KEY ("billing_method_nice_id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TABLE "billing_subscription_plan_source" ("billing_subscription_plan_source_id" uuid NOT NULL, "category" "public"."billing_subscription_plan_source_category_enum" NOT NULL, "type" "public"."billing_subscription_plan_source_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_subscription_plan_source_currency_enum" NOT NULL, "period" "public"."billing_subscription_plan_source_period_enum" NOT NULL, "price" integer NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_b1860552f86d82d9820e63b9056" PRIMARY KEY ("billing_subscription_plan_source_id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TABLE "billing_subscription_plan" ("billing_subscription_plan_id" uuid NOT NULL, "category" "public"."billing_subscription_plan_category_enum" NOT NULL, "type" "public"."billing_subscription_plan_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_subscription_plan_currency_enum" NOT NULL, "period" "public"."billing_subscription_plan_period_enum" NOT NULL, "price" integer NOT NULL, "billing_info_id" uuid NOT NULL, "billing_subscription_plan_source_id" uuid, "billing_coupon_id" uuid, "billing_coupon_remaining_apply_count" integer, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_71611a3d9184fc21f967d877dda" PRIMARY KEY ("billing_subscription_plan_id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_info_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(
      `CREATE TABLE "billing_info" ("billing_info_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "category" "public"."billing_info_category_enum" NOT NULL, "first_purchased_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_02682383281a29986ac89aa69e9" UNIQUE ("organization_id"), CONSTRAINT "PK_6f82c51808b988f12f5451f8c6c" PRIMARY KEY ("billing_info_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_history" ("billing_history_id" uuid NOT NULL, "purchased_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "billing_info_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_3e91d91b4ccdf090182706f299e" PRIMARY KEY ("billing_history_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_info_and_billing_promotion" ("billing_info_id" uuid NOT NULL, "billing_promotion_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_afbf32206fac07023b0def1ec7d" PRIMARY KEY ("billing_info_id", "billing_promotion_id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_promotion_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_promotion_type_enum" AS ENUM('first-purchase')`);
    await queryRunner.query(
      `CREATE TABLE "billing_promotion" ("billing_promition_id" uuid NOT NULL, "category" "public"."billing_promotion_category_enum" NOT NULL, "type" "public"."billing_promotion_type_enum" NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_f50ddd57fcafa27dae09579d18d" PRIMARY KEY ("billing_promition_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`,
    );
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_cd0c7c2b1bdf73a3f6056794533"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_9bb949e96c085f35b8bf0577d05" PRIMARY KEY ("billing_token_id")`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "UQ_6de2bb73f339d5b3a7bb85009e1" UNIQUE ("token")`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP CONSTRAINT "UQ_9087bbbdf76af0a0eff9736722a"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "organization_id"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "organization_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD CONSTRAINT "UQ_9087bbbdf76af0a0eff9736722a" UNIQUE ("organization_id")`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ALTER COLUMN "live_testing_remaining_free_seconds" SET DEFAULT '10800'`);
    await queryRunner.query(`CREATE INDEX "IDX_6f69921b52404dcec88383af39" ON "billing_history_and_billing_subscription_plan" ("billing_history_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_7f3a9b1877ea3ed8c988ccb8a5" ON "billing_history_and_billing_subscription_plan" ("billing_subscription_plan_id") `);
    await queryRunner.query(
      `ALTER TABLE "billing_method_nice" ADD CONSTRAINT "FK_72a21a92aa304ec99eb11bf00ba" FOREIGN KEY ("billing_info_id") REFERENCES "billing_info"("billing_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan" ADD CONSTRAINT "FK_e47c7377373e996838e863a44fa" FOREIGN KEY ("billing_info_id") REFERENCES "billing_info"("billing_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan" ADD CONSTRAINT "FK_c82f88a7bce43653fd6a2b9347d" FOREIGN KEY ("billing_coupon_id") REFERENCES "billing_coupon"("billing_coupon_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan" ADD CONSTRAINT "FK_8932a67864f495f76f1c507bb31" FOREIGN KEY ("billing_subscription_plan_source_id") REFERENCES "billing_subscription_plan_source"("billing_subscription_plan_source_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history" ADD CONSTRAINT "FK_5d2a63af01a4c3c4c963778dd65" FOREIGN KEY ("billing_info_id") REFERENCES "billing_info"("billing_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
    await queryRunner.query(`ALTER TABLE "billing_history" DROP CONSTRAINT "FK_5d2a63af01a4c3c4c963778dd65"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" DROP CONSTRAINT "FK_8932a67864f495f76f1c507bb31"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" DROP CONSTRAINT "FK_c82f88a7bce43653fd6a2b9347d"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" DROP CONSTRAINT "FK_e47c7377373e996838e863a44fa"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" DROP CONSTRAINT "FK_72a21a92aa304ec99eb11bf00ba"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7f3a9b1877ea3ed8c988ccb8a5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6f69921b52404dcec88383af39"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ALTER COLUMN "live_testing_remaining_free_seconds" SET DEFAULT '300000000'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP CONSTRAINT "UQ_9087bbbdf76af0a0eff9736722a"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "organization_id"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "organization_id" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD CONSTRAINT "UQ_9087bbbdf76af0a0eff9736722a" UNIQUE ("organization_id")`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "UQ_6de2bb73f339d5b3a7bb85009e1"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_9bb949e96c085f35b8bf0577d05"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_cd0c7c2b1bdf73a3f6056794533" PRIMARY KEY ("billing_token_id", "token")`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`,
    );
    await queryRunner.query(`DROP TABLE "billing_promotion"`);
    await queryRunner.query(`DROP TYPE "public"."billing_promotion_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_promotion_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_info_and_billing_promotion"`);
    await queryRunner.query(`DROP TABLE "billing_history"`);
    await queryRunner.query(`DROP TABLE "billing_info"`);
    await queryRunner.query(`DROP TYPE "public"."billing_info_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_subscription_plan"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_subscription_plan_source"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_method_nice"`);
    await queryRunner.query(`DROP TABLE "billing_info_and_billing_coupon"`);
    await queryRunner.query(`DROP TABLE "billing_coupon"`);
    await queryRunner.query(`DROP TABLE "billing_history_and_billing_subscription_plan"`);
  }
}
