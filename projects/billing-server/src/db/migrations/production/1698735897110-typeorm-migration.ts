import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1698735897110 implements MigrationInterface {
  name = 'TypeormMigration1698735897110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."cloud_subscription_plan_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."cloud_subscription_plan_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TABLE "cloud_subscription_plan" ("cloud_subscription_plan_id" uuid NOT NULL, "type" "public"."cloud_subscription_plan_type_enum" NOT NULL, "period" "public"."cloud_subscription_plan_period_enum" NOT NULL, "cloud_license_id" uuid NOT NULL, "billing_coupon_id" uuid, "billing_coupon_remaining_apply_count" integer, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_51901c3c211833a12772a778214" PRIMARY KEY ("cloud_subscription_plan_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_method_nice" ("billing_method_nice_id" uuid NOT NULL, "currency" character varying NOT NULL, "bid" character varying, "cloud_license_id" uuid, "self_hosted_license_id" uuid, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "REL_eab8204d05a76d1f0e1be9a6e1" UNIQUE ("cloud_license_id"), CONSTRAINT "REL_3a88cfafe01229342bbe99a04e" UNIQUE ("self_hosted_license_id"), CONSTRAINT "PK_2a604a826dc51af43eebfcb67f7" PRIMARY KEY ("billing_method_nice_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_coupon" ("billing_coupon_id" uuid NOT NULL, "code" character varying NOT NULL, "monthly_discount_percent" integer, "monthly_apply_count" integer, "yearly_discount_percent" integer, "yearly_apply_count" integer, "remaining_available_count" integer, "expired_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_00fad1b7bdccd28013dafc534dd" UNIQUE ("code"), CONSTRAINT "PK_a61c816a89f179c2d208267fdc3" PRIMARY KEY ("billing_coupon_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "first_billing_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "first_billing_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_cd0c7c2b1bdf73a3f6056794533"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_9bb949e96c085f35b8bf0577d05" PRIMARY KEY ("billing_token_id")`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "UQ_6de2bb73f339d5b3a7bb85009e1" UNIQUE ("token")`);
    await queryRunner.query(
      `ALTER TABLE "cloud_subscription_plan" ADD CONSTRAINT "FK_c28e16ddd9660bd92daf8590536" FOREIGN KEY ("cloud_license_id") REFERENCES "cloud_license"("cloud_license_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_method_nice" ADD CONSTRAINT "FK_eab8204d05a76d1f0e1be9a6e19" FOREIGN KEY ("cloud_license_id") REFERENCES "cloud_license"("cloud_license_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_method_nice" ADD CONSTRAINT "FK_3a88cfafe01229342bbe99a04e2" FOREIGN KEY ("self_hosted_license_id") REFERENCES "self_hosted_license"("self_hosted_license_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_method_nice" DROP CONSTRAINT "FK_3a88cfafe01229342bbe99a04e2"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" DROP CONSTRAINT "FK_eab8204d05a76d1f0e1be9a6e19"`);
    await queryRunner.query(`ALTER TABLE "cloud_subscription_plan" DROP CONSTRAINT "FK_c28e16ddd9660bd92daf8590536"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "UQ_6de2bb73f339d5b3a7bb85009e1"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_9bb949e96c085f35b8bf0577d05"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_cd0c7c2b1bdf73a3f6056794533" PRIMARY KEY ("billing_token_id", "token")`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "first_billing_at"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "first_billing_at"`);
    await queryRunner.query(`DROP TABLE "billing_coupon"`);
    await queryRunner.query(`DROP TABLE "billing_method_nice"`);
    await queryRunner.query(`DROP TABLE "cloud_subscription_plan"`);
    await queryRunner.query(`DROP TYPE "public"."cloud_subscription_plan_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."cloud_subscription_plan_type_enum"`);
  }
}
