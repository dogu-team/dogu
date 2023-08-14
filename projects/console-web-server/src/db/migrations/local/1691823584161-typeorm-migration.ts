import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691823584161 implements MigrationInterface {
  name = 'typeormMigration1691823584161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "record_test_step_action_webdriver_click" ("record_test_step_action_webdriver_click_id" uuid NOT NULL, "record_test_step_id" uuid NOT NULL, "screen_size_x" smallint NOT NULL, "screen_size_y" smallint NOT NULL, "screen_position_x" smallint NOT NULL, "screen_position_y" smallint NOT NULL, "xpath" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_76a81cdc89af6b64182d0645559" PRIMARY KEY ("record_test_step_action_webdriver_click_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "record_test_case_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "prev_record_test_step_id" uuid`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "device_serial" character varying`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "screenshot_url" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_device_serial" character varying`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_device_screen_size_x" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_device_screen_size_y" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_session_id" uuid`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_session_key" uuid`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "package_name" character varying`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "browser_name" character varying`);
    await queryRunner.query(
      `ALTER TABLE "record_test_step" ADD CONSTRAINT "FK_d1f5c496ee02409bb9c0a864993" FOREIGN KEY ("record_test_case_id") REFERENCES "record_test_case"("record_test_case_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_step" ADD CONSTRAINT "FK_41d66319d9b0e35d3a08180fa10" FOREIGN KEY ("prev_record_test_step_id") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_step_action_webdriver_click" ADD CONSTRAINT "FK_66e7b9d95cdbd10c3815aa64cea" FOREIGN KEY ("record_test_step_id") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP CONSTRAINT "FK_66e7b9d95cdbd10c3815aa64cea"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP CONSTRAINT "FK_41d66319d9b0e35d3a08180fa10"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP CONSTRAINT "FK_d1f5c496ee02409bb9c0a864993"`);

    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "browser_name"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "package_name"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_session_key"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_session_id"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_device_screen_size_y"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_device_screen_size_x"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_device_serial"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "screenshot_url"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "device_serial"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "prev_record_test_step_id"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "record_test_case_id"`);

    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "name" character varying NOT NULL`);
    await queryRunner.query(`DROP TABLE "record_test_step_action_webdriver_click"`);
  }
}
