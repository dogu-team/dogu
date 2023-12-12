import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1702367350535 implements MigrationInterface {
  name = 'TypeormMigration1702367350535';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."billing_coupon_plantype_enum" RENAME TO "billing_coupon_plantype_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."billing_coupon_plantype_enum" AS ENUM('live-testing', 'web-test-automation', 'mobile-app-test-automation', 'mobile-game-test-automation', 'self-device-farm-browser', 'self-device-farm-mobile')`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_coupon" ALTER COLUMN "planType" TYPE "public"."billing_coupon_plantype_enum" USING "planType"::"text"::"public"."billing_coupon_plantype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_coupon_plantype_enum_old"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_plan_source_type_enum" RENAME TO "billing_plan_source_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."billing_plan_source_type_enum" AS ENUM('live-testing', 'web-test-automation', 'mobile-app-test-automation', 'mobile-game-test-automation', 'self-device-farm-browser', 'self-device-farm-mobile')`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_source" ALTER COLUMN "type" TYPE "public"."billing_plan_source_type_enum" USING "type"::"text"::"public"."billing_plan_source_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_plan_source_type_enum_old"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_plan_history_type_enum" RENAME TO "billing_plan_history_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."billing_plan_history_type_enum" AS ENUM('live-testing', 'web-test-automation', 'mobile-app-test-automation', 'mobile-game-test-automation', 'self-device-farm-browser', 'self-device-farm-mobile')`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_history" ALTER COLUMN "type" TYPE "public"."billing_plan_history_type_enum" USING "type"::"text"::"public"."billing_plan_history_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_plan_history_type_enum_old"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_plan_info_type_enum" RENAME TO "billing_plan_info_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."billing_plan_info_type_enum" AS ENUM('live-testing', 'web-test-automation', 'mobile-app-test-automation', 'mobile-game-test-automation', 'self-device-farm-browser', 'self-device-farm-mobile')`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_info" ALTER COLUMN "type" TYPE "public"."billing_plan_info_type_enum" USING "type"::"text"::"public"."billing_plan_info_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_plan_info_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_info_type_enum_old" AS ENUM('live-testing')`);
    await queryRunner.query(
      `ALTER TABLE "billing_plan_info" ALTER COLUMN "type" TYPE "public"."billing_plan_info_type_enum_old" USING "type"::"text"::"public"."billing_plan_info_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_plan_info_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_plan_info_type_enum_old" RENAME TO "billing_plan_info_type_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_history_type_enum_old" AS ENUM('live-testing')`);
    await queryRunner.query(
      `ALTER TABLE "billing_plan_history" ALTER COLUMN "type" TYPE "public"."billing_plan_history_type_enum_old" USING "type"::"text"::"public"."billing_plan_history_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_plan_history_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_plan_history_type_enum_old" RENAME TO "billing_plan_history_type_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_source_type_enum_old" AS ENUM('live-testing')`);
    await queryRunner.query(
      `ALTER TABLE "billing_plan_source" ALTER COLUMN "type" TYPE "public"."billing_plan_source_type_enum_old" USING "type"::"text"::"public"."billing_plan_source_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_plan_source_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_plan_source_type_enum_old" RENAME TO "billing_plan_source_type_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."billing_coupon_plantype_enum_old" AS ENUM('live-testing')`);
    await queryRunner.query(
      `ALTER TABLE "billing_coupon" ALTER COLUMN "planType" TYPE "public"."billing_coupon_plantype_enum_old" USING "planType"::"text"::"public"."billing_coupon_plantype_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_coupon_plantype_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_coupon_plantype_enum_old" RENAME TO "billing_coupon_plantype_enum"`);
  }
}
