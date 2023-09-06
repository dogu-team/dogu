import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693978757187 implements MigrationInterface {
  name = 'typeormMigration1693978757187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_device_job" ADD "app_version" character varying(128)`);
    await queryRunner.query(`ALTER TABLE "routine_device_job" ADD "browser_name" character varying(128)`);
    await queryRunner.query(`ALTER TABLE "routine_device_job" ADD "browser_version" character varying(128)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_device_job" DROP COLUMN "browser_version"`);
    await queryRunner.query(`ALTER TABLE "routine_device_job" DROP COLUMN "browser_name"`);
    await queryRunner.query(`ALTER TABLE "routine_device_job" DROP COLUMN "app_version"`);
  }
}
