import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692191971614 implements MigrationInterface {
  name = 'typeormMigration1692191971614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "host" ADD "architecture" smallint NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "host" DROP COLUMN "architecture"`);
  }
}
