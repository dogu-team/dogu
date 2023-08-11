import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691722318903 implements MigrationInterface {
  name = 'typeormMigration1691722318903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "record_test_step_action" ("record_test_step_action_id" uuid NOT NULL, "record_test_step_id" uuid NOT NULL, "type" smallint NOT NULL DEFAULT '0', "screenshot_url" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_8adc8f434a4ebeb94727b5504d6" PRIMARY KEY ("record_test_step_action_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_test_step_action_webdriver_click" ("record_test_step_action_webdriver_click_id" uuid NOT NULL, "record_test_step_action_id" uuid NOT NULL, "screen_size_x" smallint NOT NULL, "screen_size_y" smallint NOT NULL, "screen_position_x" smallint NOT NULL, "screen_position_y" smallint NOT NULL, "xpath" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_76a81cdc89af6b64182d0645559" PRIMARY KEY ("record_test_step_action_webdriver_click_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "type"`);

    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_device_screen_size" character varying`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_session_id" uuid`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_session_key" uuid`);

    await queryRunner.query(
      `ALTER TABLE "record_test_step_action" ADD CONSTRAINT "FK_d34116c16d4e52a3b9199f78f32" FOREIGN KEY ("record_test_step_id") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_step_action_webdriver_click" ADD CONSTRAINT "FK_484a40dd8f276bcfb7569d15f42" FOREIGN KEY ("record_test_step_action_id") REFERENCES "record_test_step_action"("record_test_step_action_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_click" DROP CONSTRAINT "FK_484a40dd8f276bcfb7569d15f42"`);
    await queryRunner.query(`ALTER TABLE "record_test_step_action" DROP CONSTRAINT "FK_d34116c16d4e52a3b9199f78f32"`);

    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_session_key"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_session_id"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_device_screen_size"`);

    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "type" smallint NOT NULL DEFAULT '0'`);
    await queryRunner.query(`DROP TABLE "record_test_step_action_webdriver_click"`);
    await queryRunner.query(`DROP TABLE "record_test_step_action"`);
  }
}
