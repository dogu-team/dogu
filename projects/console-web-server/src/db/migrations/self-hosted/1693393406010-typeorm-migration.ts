import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693393406010 implements MigrationInterface {
  name = 'typeormMigration1693393406010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "record_pipeline" ("record_pipeline_id" uuid NOT NULL, "project_id" uuid NOT NULL, "record_test_scenario_id" uuid NOT NULL, "state" smallint NOT NULL DEFAULT '1', "creator_type" smallint NOT NULL DEFAULT '0', "creator_id" uuid, "canceler_id" uuid, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_35d02117a368b52fae5ee0eb6ec" PRIMARY KEY ("record_pipeline_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_device_job" ("record_device_job_id" uuid NOT NULL, "record_pipeline_id" uuid NOT NULL, "state" smallint NOT NULL DEFAULT '1', "device_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "device_info" json NOT NULL, CONSTRAINT "PK_b60b3163458339a39261a6402c2" PRIMARY KEY ("record_device_job_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_action" ("record_action_id" uuid NOT NULL, "record_device_job_id" uuid NOT NULL, "record_test_step_id" uuid NOT NULL, "state" smallint NOT NULL DEFAULT '1', "index" integer NOT NULL, "type" smallint NOT NULL DEFAULT '0', "action_info" json NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_8867fca82ed69d8c0d600d1d0d6" PRIMARY KEY ("record_action_id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "record_pipeline" ADD CONSTRAINT "FK_63ec9a8684b5148eff9405806c5" FOREIGN KEY ("record_test_scenario_id") REFERENCES "record_test_scenario"("record_test_scenario_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_pipeline" ADD CONSTRAINT "FK_1a3e5b176749c35e134b3ec5269" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_device_job" ADD CONSTRAINT "FK_26c8514cfcb7eeff2cc22edf81e" FOREIGN KEY ("record_pipeline_id") REFERENCES "record_pipeline"("record_pipeline_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_action" ADD CONSTRAINT "FK_3e0bceeefb7797d995ea19e29fd" FOREIGN KEY ("record_device_job_id") REFERENCES "record_device_job"("record_device_job_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_action" ADD CONSTRAINT "FK_240d52a68333ed3fb6c03494bff" FOREIGN KEY ("record_test_step_id") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_action" DROP CONSTRAINT "FK_240d52a68333ed3fb6c03494bff"`);
    await queryRunner.query(`ALTER TABLE "record_action" DROP CONSTRAINT "FK_3e0bceeefb7797d995ea19e29fd"`);
    await queryRunner.query(`ALTER TABLE "record_device_job" DROP CONSTRAINT "FK_26c8514cfcb7eeff2cc22edf81e"`);
    await queryRunner.query(`ALTER TABLE "record_pipeline" DROP CONSTRAINT "FK_1a3e5b176749c35e134b3ec5269"`);
    await queryRunner.query(`ALTER TABLE "record_pipeline" DROP CONSTRAINT "FK_63ec9a8684b5148eff9405806c5"`);

    await queryRunner.query(`DROP TABLE "record_action"`);
    await queryRunner.query(`DROP TABLE "record_device_job"`);
    await queryRunner.query(`DROP TABLE "record_pipeline"`);
  }
}
