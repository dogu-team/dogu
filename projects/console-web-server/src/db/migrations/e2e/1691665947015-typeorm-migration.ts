import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691665947015 implements MigrationInterface {
  name = 'typeormMigration1691665947015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "change_log" ADD "tags" character varying NOT NULL DEFAULT 'announcement'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "change_log" DROP COLUMN "tags"`);
  }
}
