import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689761910941 implements MigrationInterface {
  name = 'typeormMigration1689761910941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote" ADD "creator_type" smallint NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "remote" ADD "creator_id" uuid`);
    await queryRunner.query(`ALTER TABLE "remote" ADD "dogu_options" json NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote" DROP COLUMN "dogu_options"`);
    await queryRunner.query(`ALTER TABLE "remote" DROP COLUMN "creator_id"`);
    await queryRunner.query(`ALTER TABLE "remote" DROP COLUMN "creator_type"`);
  }
}
