import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692887440099 implements MigrationInterface {
  name = 'typeormMigration1692887440099';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "routine_device_job_browser" ("routine_device_job_browser_id" SERIAL NOT NULL, "browser_name" character varying(32) NOT NULL, "browser_version" character varying(32) NOT NULL DEFAULT '', "platform_name" character varying(32) NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "routine_device_job_id" integer NOT NULL, CONSTRAINT "REL_9b8a3e645070e76fbd6a9d7dc9" UNIQUE ("routine_device_job_id"), CONSTRAINT "PK_82680997576dcfe91cc4f6a655d" PRIMARY KEY ("routine_device_job_browser_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "routine_device_job_browser" ADD CONSTRAINT "FK_9b8a3e645070e76fbd6a9d7dc95" FOREIGN KEY ("routine_device_job_id") REFERENCES "routine_device_job"("routine_device_job_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_device_job_browser" DROP CONSTRAINT "FK_9b8a3e645070e76fbd6a9d7dc95"`);
    await queryRunner.query(`DROP TABLE "routine_device_job_browser"`);
  }
}
