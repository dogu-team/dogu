import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692891633569 implements MigrationInterface {
  name = 'typeormMigration1692891633569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device_browser" ADD "is_installed" smallint NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device_browser" DROP COLUMN "is_installed"`);
  }
}
