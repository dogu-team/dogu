import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1688371135596 implements MigrationInterface {
  name = 'typeormMigration1688371135596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "dest" ALTER COLUMN "name" SET DATA TYPE varchar(256)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "dest" ALTER COLUMN "name" SET DATA TYPE varchar(64)');
  }
}
