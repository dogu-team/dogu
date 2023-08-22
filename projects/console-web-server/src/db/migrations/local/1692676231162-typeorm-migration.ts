import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692676231162 implements MigrationInterface {
  name = 'typeormMigration1692676231162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" ADD "serial_unique" character varying(64) NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "serial_unique"`);
  }
}
