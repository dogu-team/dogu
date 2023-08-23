import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692674294301 implements MigrationInterface {
  name = 'typeormMigration1692674294301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "record_test_step_action_webdriver_input" ("record_test_step_action_webdriver_input_id" uuid NOT NULL, "record_test_step_id" uuid NOT NULL, "device_screen_size_x" smallint NOT NULL, "device_screen_size_y" smallint NOT NULL, "value" character varying NOT NULL, "bound_x" smallint NOT NULL, "bound_y" smallint NOT NULL, "bound_width" smallint NOT NULL, "bound_height" smallint NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_1bfebf9a9a3c7f2878445e08312" PRIMARY KEY ("record_test_step_action_webdriver_input_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_step_action_webdriver_input" ADD CONSTRAINT "FK_4dd487384defc736600c536b0fa" FOREIGN KEY ("record_test_step_id") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step_action_webdriver_input" DROP CONSTRAINT "FK_4dd487384defc736600c536b0fa"`);
    await queryRunner.query(`DROP TABLE "record_test_step_action_webdriver_input"`);
  }
}
