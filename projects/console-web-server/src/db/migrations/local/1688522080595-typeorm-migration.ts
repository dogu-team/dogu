import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1688522080595 implements MigrationInterface {
  name = 'typeormMigration1688522080595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_repository" DROP CONSTRAINT "REL_3ddc7a377caff72093d46ca662"`);
    await queryRunner.query(`ALTER TABLE "github_repository_auth" DROP CONSTRAINT "REL_07cab02f0e389feebec20698a4"`);
    await queryRunner.query(`ALTER TABLE "gitlab_repository_auth" DROP CONSTRAINT "REL_b98add1eab6b2783835b0af0fe"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gitlab_repository_auth" ADD CONSTRAINT "REL_b98add1eab6b2783835b0af0fe" UNIQUE ("project_repository_id")`);
    await queryRunner.query(`ALTER TABLE "github_repository_auth" ADD CONSTRAINT "REL_07cab02f0e389feebec20698a4" UNIQUE ("project_repository_id")`);
    await queryRunner.query(`ALTER TABLE "project_repository" ADD CONSTRAINT "REL_3ddc7a377caff72093d46ca662" UNIQUE ("project_id")`);
  }
}
