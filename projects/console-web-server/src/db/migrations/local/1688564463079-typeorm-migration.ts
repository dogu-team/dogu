import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1688564463079 implements MigrationInterface {
  name = 'typeormMigration1688564463079';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "device_and_webdriver" ("device_web_driver_id" SERIAL NOT NULL, "session_id" uuid NOT NULL, "device_id" uuid NOT NULL, "heartbeat" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_652d905f0b613f52fbe7eecf564" PRIMARY KEY ("device_web_driver_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "device_and_webdriver"`);
  }
}
