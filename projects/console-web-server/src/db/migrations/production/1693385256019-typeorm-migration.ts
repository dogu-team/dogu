import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693385256019 implements MigrationInterface {
  name = 'typeormMigration1693385256019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "device_browser_installation" ("device_browser_installation_id" uuid NOT NULL, "browser_name" character varying(32) NOT NULL, "browser_version" character varying(32) NOT NULL DEFAULT '', "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "device_id" uuid NOT NULL, CONSTRAINT "PK_caba0a32df0d7f1df8628bf92e4" PRIMARY KEY ("device_browser_installation_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_runner" ("device_runner_id" uuid NOT NULL, "is_in_use" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "device_id" uuid NOT NULL, CONSTRAINT "PK_89a05f49c61754dcb3251033c20" PRIMARY KEY ("device_runner_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "routine_device_job_browser" ("routine_device_job_browser_id" uuid NOT NULL, "browser_name" character varying(32) NOT NULL, "browser_version" character varying(32) NOT NULL DEFAULT '', "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "routine_device_job_id" integer NOT NULL, CONSTRAINT "REL_9b8a3e645070e76fbd6a9d7dc9" UNIQUE ("routine_device_job_id"), CONSTRAINT "PK_82680997576dcfe91cc4f6a655d" PRIMARY KEY ("routine_device_job_browser_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "remote_device_job" ADD "device_runner_id" uuid`);
    await queryRunner.query(`ALTER TABLE "routine_device_job" ADD "device_runner_id" uuid`);
    await queryRunner.query(`ALTER TABLE "routine_step" ADD "cwd" character varying NOT NULL DEFAULT ''`);
    await queryRunner.query(
      `ALTER TABLE "device_browser_installation" ADD CONSTRAINT "FK_e4e8f426201278971d05e881ff3" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "remote_device_job" ADD CONSTRAINT "FK_6a1cc04170df57caf14780d5572" FOREIGN KEY ("device_runner_id") REFERENCES "device_runner"("device_runner_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_runner" ADD CONSTRAINT "FK_aa88c51f2673dd40308d9d6ef5b" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "routine_device_job" ADD CONSTRAINT "FK_a2255602060b0505ca93bc61b22" FOREIGN KEY ("device_runner_id") REFERENCES "device_runner"("device_runner_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "routine_device_job_browser" ADD CONSTRAINT "FK_9b8a3e645070e76fbd6a9d7dc95" FOREIGN KEY ("routine_device_job_id") REFERENCES "routine_device_job"("routine_device_job_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_device_job_browser" DROP CONSTRAINT "FK_9b8a3e645070e76fbd6a9d7dc95"`);
    await queryRunner.query(`ALTER TABLE "routine_device_job" DROP CONSTRAINT "FK_a2255602060b0505ca93bc61b22"`);
    await queryRunner.query(`ALTER TABLE "device_runner" DROP CONSTRAINT "FK_aa88c51f2673dd40308d9d6ef5b"`);
    await queryRunner.query(`ALTER TABLE "remote_device_job" DROP CONSTRAINT "FK_6a1cc04170df57caf14780d5572"`);
    await queryRunner.query(`ALTER TABLE "device_browser_installation" DROP CONSTRAINT "FK_e4e8f426201278971d05e881ff3"`);
    await queryRunner.query(`ALTER TABLE "routine_step" DROP COLUMN "cwd"`);
    await queryRunner.query(`ALTER TABLE "routine_device_job" DROP COLUMN "device_runner_id"`);
    await queryRunner.query(`ALTER TABLE "remote_device_job" DROP COLUMN "device_runner_id"`);
    await queryRunner.query(`DROP TABLE "routine_device_job_browser"`);
    await queryRunner.query(`DROP TABLE "device_runner"`);
    await queryRunner.query(`DROP TABLE "device_browser_installation"`);
  }
}
