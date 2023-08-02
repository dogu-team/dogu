import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1690964986546 implements MigrationInterface {
  name = 'typeormMigration1690964986546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "record_test_scenario" ("record_test_scenario_id" uuid NOT NULL, "project_id" uuid NOT NULL, "creator_id" uuid, "name" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_1831fa8718004bf950011fa1c2f" PRIMARY KEY ("record_test_scenario_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_test_case" ("record_test_case_id" uuid NOT NULL, "prev_record_test_case_id" uuid NOT NULL, "record_test_scenario_id" uuid NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "prevRecordTestCaseId" uuid, "recordTestScenarioId" uuid, CONSTRAINT "PK_8ec9aad4639f87966d2795f6c8c" PRIMARY KEY ("record_test_case_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_test_step" ("record_test_step_id" uuid NOT NULL, "prev_record_test_step_id" uuid NOT NULL, "record_test_case_id" uuid NOT NULL, "name" character varying NOT NULL, "type" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "prevRecordTestStepId" uuid, "recordTestStepId" uuid, CONSTRAINT "PK_01eb995745e14cbdd5380b748c7" PRIMARY KEY ("record_test_step_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_scenario" ADD CONSTRAINT "FK_7a2f2628d98fc0088da669b9a8d" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_case" ADD CONSTRAINT "FK_7ca9dd7f79c60c47d043b8b6fd6" FOREIGN KEY ("prevRecordTestCaseId") REFERENCES "record_test_case"("record_test_case_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_case" ADD CONSTRAINT "FK_5e0e091f0fe2d486c2b1ee0c5c5" FOREIGN KEY ("recordTestScenarioId") REFERENCES "record_test_scenario"("record_test_scenario_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_step" ADD CONSTRAINT "FK_730bdb6ae031dd938c9902cead3" FOREIGN KEY ("prevRecordTestStepId") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_step" ADD CONSTRAINT "FK_20d8cb0c743b3fd877ab3f033b0" FOREIGN KEY ("recordTestStepId") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP CONSTRAINT "FK_20d8cb0c743b3fd877ab3f033b0"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP CONSTRAINT "FK_730bdb6ae031dd938c9902cead3"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP CONSTRAINT "FK_5e0e091f0fe2d486c2b1ee0c5c5"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP CONSTRAINT "FK_7ca9dd7f79c60c47d043b8b6fd6"`);
    await queryRunner.query(`ALTER TABLE "record_test_scenario" DROP CONSTRAINT "FK_7a2f2628d98fc0088da669b9a8d"`);
    await queryRunner.query(`DROP TABLE "record_test_step"`);
    await queryRunner.query(`DROP TABLE "record_test_case"`);
    await queryRunner.query(`DROP TABLE "record_test_scenario"`);
  }
}
