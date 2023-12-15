import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1702369930790 implements MigrationInterface {
  name = 'TypeormMigration1702369930790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "webTestAutomationRemainingFreeSeconds" integer NOT NULL DEFAULT '3600'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "webTestAutomationParallelCount" integer NOT NULL DEFAULT '1'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "mobileAppTestAutomationRemainingFreeSeconds" integer NOT NULL DEFAULT '3600'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "mobileAppTestAutomationParallelCount" integer NOT NULL DEFAULT '1'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "mobileGameTestAutomationRemainingFreeSeconds" integer NOT NULL DEFAULT '3600'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "mobileGameTestAutomationParallelCount" integer NOT NULL DEFAULT '1'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "selfDeviceBrowserCount" integer NOT NULL DEFAULT '1'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "selfDeviceMobileCount" integer NOT NULL DEFAULT '1'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "selfDeviceMobileCount"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "selfDeviceBrowserCount"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "mobileGameTestAutomationParallelCount"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "mobileGameTestAutomationRemainingFreeSeconds"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "mobileAppTestAutomationParallelCount"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "mobileAppTestAutomationRemainingFreeSeconds"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "webTestAutomationParallelCount"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "webTestAutomationRemainingFreeSeconds"`);
  }
}
