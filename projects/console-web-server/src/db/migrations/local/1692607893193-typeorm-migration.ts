import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692607893193 implements MigrationInterface {
  name = 'typeormMigration1692607893193';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" ADD "is_virtual" smallint NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "is_virtual"`);
  }
}
