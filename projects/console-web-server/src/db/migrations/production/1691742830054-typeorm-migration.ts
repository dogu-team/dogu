import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691742830054 implements MigrationInterface {
  name = 'typeormMigration1691742830054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote_device_job" ADD "web_driver_se_cdp" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote_device_job" DROP COLUMN "web_driver_se_cdp"`);
  }
}
