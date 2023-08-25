import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692676231162 implements MigrationInterface {
  name = 'typeormMigration1692676231162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" ADD "is_virtual" smallint NOT NULL DEFAULT '0'`);

    await queryRunner.query(`ALTER TABLE "device" ALTER COLUMN "serial" SET DATA TYPE varchar(128)`);

    await queryRunner.query(`ALTER TABLE "device" ADD "serial_unique" character varying(128) NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "is_virtual"`);

    await queryRunner.query(`ALTER TABLE "device" ALTER COLUMN "serial" SET DATA TYPE varchar(64)`);

    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "serial_unique"`);
  }
}
