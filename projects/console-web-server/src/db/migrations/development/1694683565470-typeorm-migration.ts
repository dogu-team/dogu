import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1694683565470 implements MigrationInterface {
  name = 'typeormMigration1694683565470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_application" ADD "version_code" bigint NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "routine_device_job" ADD "app_package_name" character varying(256)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_device_job" DROP COLUMN "app_package_name"`);
    await queryRunner.query(`ALTER TABLE "project_application" DROP COLUMN "version_code"`);
  }
}
