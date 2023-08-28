import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693221304423 implements MigrationInterface {
  name = 'typeormMigration1693221304423';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" ADD "type" smallint NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "type"`);
  }
}
