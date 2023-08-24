import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692890018693 implements MigrationInterface {
  name = 'typeormMigration1692890018693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "device_browser" ("device_browser_id" SERIAL NOT NULL, "browser_name" character varying(32) NOT NULL, "browser_version" character varying(32) NOT NULL DEFAULT '', "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "device_id" uuid NOT NULL, CONSTRAINT "PK_96647f59e9a505a9e9150ef5f07" PRIMARY KEY ("device_browser_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_browser" ADD CONSTRAINT "FK_caf110216da7b1c3ad18efcaed9" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device_browser" DROP CONSTRAINT "FK_caf110216da7b1c3ad18efcaed9"`);
    await queryRunner.query(`DROP TABLE "device_browser"`);
  }
}
