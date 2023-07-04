import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1688453746409 implements MigrationInterface {
  name = 'typeormMigration1688453746409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_repository" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "project_repository" ADD "repository_url" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "project_repository" ADD "config_file_path" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_repository" DROP COLUMN "config_file_path"`);
    await queryRunner.query(`ALTER TABLE "project_repository" DROP COLUMN "repository_url"`);
    await queryRunner.query(`ALTER TABLE "project_repository" ADD "url" character varying NOT NULL`);
  }
}
