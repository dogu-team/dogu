import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1690978192163 implements MigrationInterface {
  name = 'typeormMigration1690978192163';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "record_test_scenario" ("record_test_scenario_id" uuid NOT NULL, "project_id" uuid NOT NULL, "creator_id" uuid NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_1831fa8718004bf950011fa1c2f" PRIMARY KEY ("record_test_scenario_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_test_step" ("record_test_step_id" uuid NOT NULL, "prev_record_test_step_id" uuid NOT NULL, "record_test_case_id" uuid NOT NULL, "name" character varying NOT NULL, "type" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_01eb995745e14cbdd5380b748c7" PRIMARY KEY ("record_test_step_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "record_test_case" ("record_test_case_id" uuid NOT NULL, "prev_record_test_case_id" uuid NOT NULL, "record_test_scenario_id" uuid NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_8ec9aad4639f87966d2795f6c8c" PRIMARY KEY ("record_test_case_id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "record_test_scenario" ADD CONSTRAINT "FK_7a2f2628d98fc0088da669b9a8d" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_step" ADD CONSTRAINT "FK_41d66319d9b0e35d3a08180fa10" FOREIGN KEY ("prev_record_test_step_id") REFERENCES "record_test_step"("record_test_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_step" ADD CONSTRAINT "FK_d1f5c496ee02409bb9c0a864993" FOREIGN KEY ("record_test_case_id") REFERENCES "record_test_case"("record_test_case_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_case" ADD CONSTRAINT "FK_64010f8074fea03c46f9c91cde8" FOREIGN KEY ("prev_record_test_case_id") REFERENCES "record_test_case"("record_test_case_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_case" ADD CONSTRAINT "FK_672fc3e225599b20ea9c2555e26" FOREIGN KEY ("record_test_scenario_id") REFERENCES "record_test_scenario"("record_test_scenario_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP CONSTRAINT "FK_672fc3e225599b20ea9c2555e26"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP CONSTRAINT "FK_64010f8074fea03c46f9c91cde8"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP CONSTRAINT "FK_d1f5c496ee02409bb9c0a864993"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP CONSTRAINT "FK_41d66319d9b0e35d3a08180fa10"`);
    await queryRunner.query(`ALTER TABLE "record_test_scenario" DROP CONSTRAINT "FK_7a2f2628d98fc0088da669b9a8d"`);

    await queryRunner.query(`DROP TABLE "record_test_case"`);
    await queryRunner.query(`DROP TABLE "record_test_step"`);
    await queryRunner.query(`DROP TABLE "record_test_scenario"`);
  }
}
