import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691123344350 implements MigrationInterface {
  name = 'typeormMigration1691123344350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "record_test_case" ("record_test_case_id" uuid NOT NULL, "project_id" uuid NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_8ec9aad4639f87966d2795f6c8c" PRIMARY KEY ("record_test_case_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_test_step" ("record_test_step_id" uuid NOT NULL, "project_id" uuid NOT NULL, "name" character varying NOT NULL, "type" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_01eb995745e14cbdd5380b748c7" PRIMARY KEY ("record_test_step_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_test_case_and_record_test_step" ("record_test_case_id" uuid NOT NULL, "record_test_step_id" uuid NOT NULL, "prev_record_test_step_id" uuid, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_c699ed8b61198eff24daef1db62" PRIMARY KEY ("record_test_case_id", "record_test_step_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_test_scenario" ("record_test_scenario_id" uuid NOT NULL, "project_id" uuid NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_1831fa8718004bf950011fa1c2f" PRIMARY KEY ("record_test_scenario_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_test_scenario_and_record_test_case" ("record_test_scenario_id" uuid NOT NULL, "record_test_case_id" uuid NOT NULL, "prev_record_test_case_id" uuid, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_970aedc4193821575e6ba158a5e" PRIMARY KEY ("record_test_scenario_id", "record_test_case_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_case" ADD CONSTRAINT "FK_735ff175c18901b8ad879357bda" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_step" ADD CONSTRAINT "FK_d7152cf317400f79a0c4d024033" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_case_and_record_test_step" ADD CONSTRAINT "FK_15ab5c1316f240c259ddccfea96" FOREIGN KEY ("record_test_case_id") REFERENCES "record_test_case"("record_test_case_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_case_and_record_test_step" ADD CONSTRAINT "FK_43acdc38969a1e62d9da2734a86" FOREIGN KEY ("prev_record_test_step_id") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_case_and_record_test_step" ADD CONSTRAINT "FK_32415acb93efafe7cd3188dd593" FOREIGN KEY ("record_test_step_id") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_scenario" ADD CONSTRAINT "FK_7a2f2628d98fc0088da669b9a8d" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_scenario_and_record_test_case" ADD CONSTRAINT "FK_58e39610d56851179334ca684cb" FOREIGN KEY ("record_test_scenario_id") REFERENCES "record_test_scenario"("record_test_scenario_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_scenario_and_record_test_case" ADD CONSTRAINT "FK_06879265308f2e1f26fd1613fd2" FOREIGN KEY ("prev_record_test_case_id") REFERENCES "record_test_case"("record_test_case_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_scenario_and_record_test_case" ADD CONSTRAINT "FK_97e837a5da46132cc1042205744" FOREIGN KEY ("record_test_case_id") REFERENCES "record_test_case"("record_test_case_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_scenario_and_record_test_case" DROP CONSTRAINT "FK_97e837a5da46132cc1042205744"`);
    await queryRunner.query(`ALTER TABLE "record_test_scenario_and_record_test_case" DROP CONSTRAINT "FK_06879265308f2e1f26fd1613fd2"`);
    await queryRunner.query(`ALTER TABLE "record_test_scenario_and_record_test_case" DROP CONSTRAINT "FK_58e39610d56851179334ca684cb"`);
    await queryRunner.query(`ALTER TABLE "record_test_scenario" DROP CONSTRAINT "FK_7a2f2628d98fc0088da669b9a8d"`);
    await queryRunner.query(`ALTER TABLE "record_test_case_and_record_test_step" DROP CONSTRAINT "FK_32415acb93efafe7cd3188dd593"`);
    await queryRunner.query(`ALTER TABLE "record_test_case_and_record_test_step" DROP CONSTRAINT "FK_43acdc38969a1e62d9da2734a86"`);
    await queryRunner.query(`ALTER TABLE "record_test_case_and_record_test_step" DROP CONSTRAINT "FK_15ab5c1316f240c259ddccfea96"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP CONSTRAINT "FK_d7152cf317400f79a0c4d024033"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP CONSTRAINT "FK_735ff175c18901b8ad879357bda"`);
    await queryRunner.query(`DROP TABLE "record_test_scenario_and_record_test_case"`);
    await queryRunner.query(`DROP TABLE "record_test_scenario"`);
    await queryRunner.query(`DROP TABLE "record_test_case_and_record_test_step"`);
    await queryRunner.query(`DROP TABLE "record_test_step"`);
    await queryRunner.query(`DROP TABLE "record_test_case"`);
  }
}
