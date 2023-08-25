import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692676231163 implements MigrationInterface {
  name = 'typeormMigration1692676231163';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "device" SET "serial_unique" = "serial"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "device" SET "serial_unique" = ''`);
  }
}
