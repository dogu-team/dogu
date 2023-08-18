import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692345752402 implements MigrationInterface {
  name = 'typeormMigration1692345752402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "screenshot_url"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "video_screen_position_x"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "video_screen_position_y"`);

    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" RENAME COLUMN "video_screen_size_x" TO "device_screen_size_x"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" RENAME COLUMN "video_screen_size_y" TO "device_screen_size_y"`);

    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "bound_x" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "bound_y" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "bound_width" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "bound_height" smallint NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "bound_height"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "bound_width"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "bound_y"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP COLUMN "bound_x"`);

    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" RENAME COLUMN "device_screen_size_x" TO "video_screen_size_x"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" RENAME COLUMN "device_screen_size_y" TO "video_screen_size_y"`);

    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "video_screen_position_x" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" ADD "video_screen_position_y" smallint NOT NULL`);

    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "screenshot_url" character varying NOT NULL`);
  }
}
