import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1694498462209 implements MigrationInterface {
  name = 'typeormMigration1694498462209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_application" ADD "is_latest" smallint NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_application" DROP COLUMN "is_latest"`);
  }
}
