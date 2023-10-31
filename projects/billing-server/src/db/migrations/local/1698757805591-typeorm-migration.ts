import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1698757805591 implements MigrationInterface {
  name = 'TypeormMigration1698757805591';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."cloud_subscription_plan_custom_option_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."cloud_subscription_plan_custom_option_currency_enum" AS ENUM('KRW')`);
    await queryRunner.query(`CREATE TYPE "public"."cloud_subscription_plan_custom_option_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TABLE "cloud_subscription_plan_custom_option" ("cloud_subscription_plan_custom_option_id" uuid NOT NULL, "type" "public"."cloud_subscription_plan_custom_option_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."cloud_subscription_plan_custom_option_currency_enum" NOT NULL, "period" "public"."cloud_subscription_plan_custom_option_period_enum" NOT NULL, "price" integer NOT NULL, "cloud_license_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_aaf15de70186a631c394b6c8b9b" PRIMARY KEY ("cloud_subscription_plan_custom_option_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_promotion" ("billing_promition_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_f50ddd57fcafa27dae09579d18d" PRIMARY KEY ("billing_promition_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_history" ("billing_history_id" uuid NOT NULL, "message" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_3e91d91b4ccdf090182706f299e" PRIMARY KEY ("billing_history_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "billing_method_nice" DROP COLUMN "currency"`);
    await queryRunner.query(`ALTER TABLE "cloud_subscription_plan" ADD "option" integer NOT NULL`);
    await queryRunner.query(`CREATE TYPE "public"."cloud_subscription_plan_currency_enum" AS ENUM('KRW')`);
    await queryRunner.query(`ALTER TABLE "cloud_subscription_plan" ADD "currency" "public"."cloud_subscription_plan_currency_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cloud_subscription_plan" ADD "price" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "cloud_subscription_plan_custom_option" ADD CONSTRAINT "FK_2963c96a4e6735f95eb2c61fe91" FOREIGN KEY ("cloud_license_id") REFERENCES "cloud_license"("cloud_license_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_subscription_plan_custom_option" DROP CONSTRAINT "FK_2963c96a4e6735f95eb2c61fe91"`);
    await queryRunner.query(`ALTER TABLE "cloud_subscription_plan" DROP COLUMN "price"`);
    await queryRunner.query(`ALTER TABLE "cloud_subscription_plan" DROP COLUMN "currency"`);
    await queryRunner.query(`DROP TYPE "public"."cloud_subscription_plan_currency_enum"`);
    await queryRunner.query(`ALTER TABLE "cloud_subscription_plan" DROP COLUMN "option"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" ADD "currency" character varying NOT NULL`);
    await queryRunner.query(`DROP TABLE "billing_history"`);
    await queryRunner.query(`DROP TABLE "billing_promotion"`);
    await queryRunner.query(`DROP TABLE "cloud_subscription_plan_custom_option"`);
    await queryRunner.query(`DROP TYPE "public"."cloud_subscription_plan_custom_option_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."cloud_subscription_plan_custom_option_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."cloud_subscription_plan_custom_option_type_enum"`);
  }
}
