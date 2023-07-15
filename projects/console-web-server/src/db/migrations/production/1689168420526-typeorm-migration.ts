import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689168420526 implements MigrationInterface {
  name = 'typeormMigration1689168420526';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "remote" ("remote_id" uuid NOT NULL, "device_id" uuid NOT NULL, "type" smallint NOT NULL DEFAULT '0', "heartbeat" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_b90ce83ce98a675e110014b5d51" PRIMARY KEY ("remote_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "remote_webdriver_info" ("remote_web_driver_info_id" uuid NOT NULL, "remote_id" uuid NOT NULL, "session_id" uuid NOT NULL, "browser_name" character varying, "browser_version" character varying, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_3dbf7fcb1cdbedcd17602a901b0" UNIQUE ("session_id"), CONSTRAINT "PK_e9edb818f4fee020d5f654d5dc9" PRIMARY KEY ("remote_web_driver_info_id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "remote" ADD CONSTRAINT "FK_8b0e535513a18fbe4f893305d9f" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "remote_webdriver_info" ADD CONSTRAINT "FK_451fe5867c99eabcd53017129ba" FOREIGN KEY ("remote_id") REFERENCES "remote"("remote_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "remote_webdriver_info"`);
    await queryRunner.query(`DROP TABLE "remote"`);
  }
}
