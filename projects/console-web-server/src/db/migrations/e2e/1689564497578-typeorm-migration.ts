import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689564497578 implements MigrationInterface {
  name = 'typeormMigration1689564497578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization" ADD "is_tutorial_completed" smallint NOT NULL DEFAULT '0'`);
    await queryRunner.query(`UPDATE "organization" SET "is_tutorial_completed" = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "is_tutorial_completed"`);
  }
}
