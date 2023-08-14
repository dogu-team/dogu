import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691997040073 implements MigrationInterface {
  name = 'typeormMigration1691997040073';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "screen_position_x"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "screen_size_x"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "screen_size_y"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "screen_position_y"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "video_screen_size_x" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "video_screen_size_y" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "video_screen_position_x" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "video_screen_position_y" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ALTER COLUMN "active_device_screen_size_x" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ALTER COLUMN "active_device_screen_size_y" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_case" ALTER COLUMN "active_device_screen_size_y" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ALTER COLUMN "active_device_screen_size_x" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "video_screen_position_y"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "video_screen_position_x"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "video_screen_size_y"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "video_screen_size_x"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "screen_position_y" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "screen_size_y" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "screen_size_x" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "screen_position_x" smallint NOT NULL`);
  }
}
