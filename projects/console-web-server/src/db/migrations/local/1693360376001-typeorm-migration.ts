import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693360376001 implements MigrationInterface {
  name = 'typeormMigration1693360376001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "device_screen_size_x" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "device_screen_size_y" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "bound_x" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "bound_y" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "bound_width" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "bound_height" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "xpath" character varying`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "value" character varying`);
    await queryRunner.query(`DROP TABLE "record_test_step_action_webdriver_click"`);
    await queryRunner.query(`DROP TABLE "record_test_step_action_webdriver_input"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "value"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "xpath"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "bound_height"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "bound_width"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "bound_y"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "bound_x"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "device_screen_size_y"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "device_screen_size_x"`);
  }
}
