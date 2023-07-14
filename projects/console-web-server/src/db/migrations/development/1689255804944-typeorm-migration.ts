import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689255804944 implements MigrationInterface {
  name = 'typeormMigration1689255804944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote" DROP CONSTRAINT "FK_8b0e535513a18fbe4f893305d9f"`);
    await queryRunner.query(
      `CREATE TABLE "remote_device_job" ("remote_device_job_id" uuid NOT NULL, "remote_id" uuid NOT NULL, "device_id" uuid NOT NULL, "session_id" uuid NOT NULL, "state" smallint NOT NULL DEFAULT '1', "interval_timeout" integer NOT NULL DEFAULT '300000', "last_interval_time" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_07ffe651ae850e4a837f41f5ff4" UNIQUE ("session_id"), CONSTRAINT "PK_a26df3ea5fe980bc22b6a19b0eb" PRIMARY KEY ("remote_device_job_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "remote" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "remote" DROP COLUMN "heartbeat"`);
    await queryRunner.query(`ALTER TABLE "remote_webdriver_info" DROP CONSTRAINT "UQ_3dbf7fcb1cdbedcd17602a901b0"`);
    await queryRunner.query(`ALTER TABLE "remote_webdriver_info" DROP COLUMN "session_id"`);
    await queryRunner.query(`ALTER TABLE "remote" ADD "project_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "remote_device_job" ADD CONSTRAINT "FK_e1c057e70acc925cd42a7862941" FOREIGN KEY ("remote_id") REFERENCES "remote"("remote_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "remote_device_job" ADD CONSTRAINT "FK_68694d8463f5b738011be05c2ec" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote_device_job" DROP CONSTRAINT "FK_68694d8463f5b738011be05c2ec"`);
    await queryRunner.query(`ALTER TABLE "remote_device_job" DROP CONSTRAINT "FK_e1c057e70acc925cd42a7862941"`);
    await queryRunner.query(`ALTER TABLE "remote" DROP COLUMN "project_id"`);
    await queryRunner.query(`ALTER TABLE "remote_webdriver_info" ADD "session_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "remote_webdriver_info" ADD CONSTRAINT "UQ_3dbf7fcb1cdbedcd17602a901b0" UNIQUE ("session_id")`);
    await queryRunner.query(`ALTER TABLE "remote" ADD "heartbeat" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "remote" ADD "device_id" uuid NOT NULL`);
    await queryRunner.query(`DROP TABLE "remote_device_job"`);
    await queryRunner.query(
      `ALTER TABLE "remote" ADD CONSTRAINT "FK_8b0e535513a18fbe4f893305d9f" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
