import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1700739130567 implements MigrationInterface {
  name = 'TypeormMigration1700739130567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "billing_method_paddle" ("billingMethodPaddleId" uuid NOT NULL, "billingOrganizationId" uuid NOT NULL, "customerId" character varying, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_13d7e7c128db2e0a46468788ae5" UNIQUE ("billingOrganizationId"), CONSTRAINT "REL_13d7e7c128db2e0a46468788ae" UNIQUE ("billingOrganizationId"), CONSTRAINT "PK_d96fec77beb3f4de53fffd0ed8a" PRIMARY KEY ("billingMethodPaddleId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_organization_billingmethod_enum" AS ENUM('nice', 'paddle')`);
    await queryRunner.query(`ALTER TABLE "billing_organization" ADD "billingMethod" "public"."billing_organization_billingmethod_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_history_method_enum" RENAME TO "billing_history_method_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."billing_history_method_enum" AS ENUM('nice', 'paddle')`);
    await queryRunner.query(
      `ALTER TABLE "billing_history" ALTER COLUMN "method" TYPE "public"."billing_history_method_enum" USING "method"::"text"::"public"."billing_history_method_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_history_method_enum_old"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ALTER COLUMN "liveTestingRemainingFreeSeconds" SET DEFAULT '3600'`);
    await queryRunner.query(
      `ALTER TABLE "billing_method_paddle" ADD CONSTRAINT "FK_13d7e7c128db2e0a46468788ae5" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_method_paddle" DROP CONSTRAINT "FK_13d7e7c128db2e0a46468788ae5"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ALTER COLUMN "liveTestingRemainingFreeSeconds" SET DEFAULT '6000'`);
    await queryRunner.query(`CREATE TYPE "public"."billing_history_method_enum_old" AS ENUM('nice')`);
    await queryRunner.query(
      `ALTER TABLE "billing_history" ALTER COLUMN "method" TYPE "public"."billing_history_method_enum_old" USING "method"::"text"::"public"."billing_history_method_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_history_method_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_history_method_enum_old" RENAME TO "billing_history_method_enum"`);
    await queryRunner.query(`ALTER TABLE "billing_organization" DROP COLUMN "billingMethod"`);
    await queryRunner.query(`DROP TYPE "public"."billing_organization_billingmethod_enum"`);
    await queryRunner.query(`DROP TABLE "billing_method_paddle"`);
  }
}
