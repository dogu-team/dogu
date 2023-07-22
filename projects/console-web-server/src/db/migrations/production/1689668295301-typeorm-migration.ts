import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689668295301 implements MigrationInterface {
  name = 'typeormMigration1689668295301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "remote_dest_edge" ("remote_dest_id" uuid NOT NULL, "parent_remote_dest_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_0d922fbc45b1e171104f40cf1ec" PRIMARY KEY ("remote_dest_id", "parent_remote_dest_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "remote_dest" ("remote_dest_id" uuid NOT NULL, "remote_device_job_id" uuid NOT NULL, "name" character varying(256) NOT NULL, "state" smallint NOT NULL DEFAULT '1', "index" integer NOT NULL, "type" smallint NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "local_in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "local_completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_6e83ee2bc29752db1dd9ecff2c7" PRIMARY KEY ("remote_dest_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "remote_dest_edge" ADD CONSTRAINT "FK_c3bd2b8b170e07b81f696398b58" FOREIGN KEY ("remote_dest_id") REFERENCES "remote_dest"("remote_dest_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "remote_dest" ADD CONSTRAINT "FK_ff7a19adceb00d59ad53a3e1f03" FOREIGN KEY ("remote_device_job_id") REFERENCES "remote_device_job"("remote_device_job_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "remote_dest"`);
    await queryRunner.query(`DROP TABLE "remote_dest_edge"`);
  }
}
