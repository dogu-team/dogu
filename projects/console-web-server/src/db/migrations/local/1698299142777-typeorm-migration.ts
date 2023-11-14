import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1698299142777 implements MigrationInterface {
  name = 'TypeormMigration1698299142777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "cloud_device_rental"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cloud_device"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.resolve();
  }
}
