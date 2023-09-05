import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693907649189 implements MigrationInterface {
  name = 'typeormMigration1693907649189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" ADD "display_error" character varying(64) NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "display_error"`);
  }
}
