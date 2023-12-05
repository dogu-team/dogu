import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1701690643252 implements MigrationInterface {
  name = 'TypeormMigration1701690643252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_pipeline" ADD "repository" text NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_pipeline" DROP COLUMN "repository"`);
  }
}
