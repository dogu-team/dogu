import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1696589377345 implements MigrationInterface {
  name = 'typeormMigration1696589377345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization" ADD "shareable" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "device" ADD "memory" character varying(32) NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "device" ADD "location" character varying(256)`);
    await queryRunner.query(`ALTER TABLE "device" ADD "usage_state" character varying(32) NOT NULL DEFAULT 'available'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "usage_state"`);
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "location"`);
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "memory"`);
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "shareable"`);
  }
}
