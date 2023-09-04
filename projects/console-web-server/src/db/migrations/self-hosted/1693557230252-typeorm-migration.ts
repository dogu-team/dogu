import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693557230252 implements MigrationInterface {
  name = 'typeormMigration1693557230252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_action" DROP CONSTRAINT "FK_240d52a68333ed3fb6c03494bff"`);
    await queryRunner.query(`ALTER TABLE "record_action" DROP CONSTRAINT "FK_3e0bceeefb7797d995ea19e29fd"`);
    await queryRunner.query(`ALTER TABLE "record_device_job" DROP CONSTRAINT "FK_26c8514cfcb7eeff2cc22edf81e"`);
    await queryRunner.query(`ALTER TABLE "record_pipeline" DROP CONSTRAINT "FK_1a3e5b176749c35e134b3ec5269"`);
    await queryRunner.query(`ALTER TABLE "record_pipeline" DROP CONSTRAINT "FK_63ec9a8684b5148eff9405806c5"`);

    await queryRunner.query(`DROP TABLE "record_action"`);
    await queryRunner.query(`DROP TABLE "record_device_job"`);
    await queryRunner.query(`DROP TABLE "record_pipeline"`);

    await queryRunner.query(
      `CREATE TABLE "record_pipeline" ("record_pipeline_id" uuid NOT NULL, "project_id" uuid NOT NULL, "record_test_scenario_id" uuid NOT NULL, "state" smallint NOT NULL DEFAULT '1', "index" integer NOT NULL, "creator_type" smallint NOT NULL DEFAULT '0', "creator_id" uuid, "canceler_id" uuid, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_341f5be7cdf13cb7377eb205be2" UNIQUE ("index"), CONSTRAINT "PK_35d02117a368b52fae5ee0eb6ec" PRIMARY KEY ("record_pipeline_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_step_action" ("record_step_action_id" uuid NOT NULL, "record_case_action_id" uuid NOT NULL, "record_test_step_id" uuid NOT NULL, "state" smallint NOT NULL DEFAULT '1', "index" integer NOT NULL, "type" smallint NOT NULL DEFAULT '0', "record_test_step_info" json NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_a9f9305ae0ea2548fc29829a9c2" PRIMARY KEY ("record_step_action_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_case_action" ("record_case_action_id" uuid NOT NULL, "record_device_job_id" uuid NOT NULL, "state" smallint NOT NULL DEFAULT '1', "index" integer NOT NULL, "record_test_case_id" uuid NOT NULL, "record_test_case_info" json NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_6ddb68df77b80dae4b2f31d1368" PRIMARY KEY ("record_case_action_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_device_job" ("record_device_job_id" uuid NOT NULL, "record_pipeline_id" uuid NOT NULL, "session_id" uuid, "device_runner_id" uuid, "state" smallint NOT NULL DEFAULT '1', "device_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "device_info" json NOT NULL, CONSTRAINT "UQ_d562800b5c731cf154ccf4eb9af" UNIQUE ("session_id"), CONSTRAINT "PK_b60b3163458339a39261a6402c2" PRIMARY KEY ("record_device_job_id"))`,
    );

    await queryRunner.query(`ALTER TABLE "record_test_scenario" ADD "last_index" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "record_test_scenario" ADD CONSTRAINT "UQ_bd1c6bb1db53d453872254db3a7" UNIQUE ("last_index")`);

    await queryRunner.query(
      `ALTER TABLE "record_pipeline" ADD CONSTRAINT "FK_63ec9a8684b5148eff9405806c5" FOREIGN KEY ("record_test_scenario_id") REFERENCES "record_test_scenario"("record_test_scenario_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_pipeline" ADD CONSTRAINT "FK_1a3e5b176749c35e134b3ec5269" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_step_action" ADD CONSTRAINT "FK_5b0412f86308b9759f92badf23a" FOREIGN KEY ("record_case_action_id") REFERENCES "record_case_action"("record_case_action_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_step_action" ADD CONSTRAINT "FK_5b0fb37bafe98d230febdf5b711" FOREIGN KEY ("record_test_step_id") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_case_action" ADD CONSTRAINT "FK_06a0e5acce98ca8c27a383eecfb" FOREIGN KEY ("record_device_job_id") REFERENCES "record_device_job"("record_device_job_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_case_action" ADD CONSTRAINT "FK_548c1b3f272a25fab4cd02fa313" FOREIGN KEY ("record_test_case_id") REFERENCES "record_test_case"("record_test_case_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_device_job" ADD CONSTRAINT "FK_26c8514cfcb7eeff2cc22edf81e" FOREIGN KEY ("record_pipeline_id") REFERENCES "record_pipeline"("record_pipeline_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_device_job" ADD CONSTRAINT "FK_a6d3ab46bca2d249dc56a78b39c" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_device_job" DROP CONSTRAINT "FK_a6d3ab46bca2d249dc56a78b39c"`);
    await queryRunner.query(`ALTER TABLE "record_device_job" DROP CONSTRAINT "FK_26c8514cfcb7eeff2cc22edf81e"`);
    await queryRunner.query(`ALTER TABLE "record_case_action" DROP CONSTRAINT "FK_548c1b3f272a25fab4cd02fa313"`);
    await queryRunner.query(`ALTER TABLE "record_case_action" DROP CONSTRAINT "FK_06a0e5acce98ca8c27a383eecfb"`);
    await queryRunner.query(`ALTER TABLE "record_step_action" DROP CONSTRAINT "FK_5b0fb37bafe98d230febdf5b711"`);
    await queryRunner.query(`ALTER TABLE "record_step_action" DROP CONSTRAINT "FK_5b0412f86308b9759f92badf23a"`);
    await queryRunner.query(`ALTER TABLE "record_pipeline" DROP CONSTRAINT "FK_1a3e5b176749c35e134b3ec5269"`);
    await queryRunner.query(`ALTER TABLE "record_pipeline" DROP CONSTRAINT "FK_63ec9a8684b5148eff9405806c5"`);

    await queryRunner.query(`ALTER TABLE "record_test_scenario" DROP CONSTRAINT "UQ_bd1c6bb1db53d453872254db3a7"`);
    await queryRunner.query(`ALTER TABLE "record_test_scenario" DROP COLUMN "last_index"`);

    await queryRunner.query(`DROP TABLE "record_device_job"`);
    await queryRunner.query(`DROP TABLE "record_case_action"`);
    await queryRunner.query(`DROP TABLE "record_step_action"`);
    await queryRunner.query(`DROP TABLE "record_pipeline"`);
  }
}
