import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689059705506 implements MigrationInterface {
  name = 'typeormMigration1689059705506';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" ADD "max_parallel_jobs" smallint NOT NULL DEFAULT '1'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "max_parallel_jobs"`);
  }
}
