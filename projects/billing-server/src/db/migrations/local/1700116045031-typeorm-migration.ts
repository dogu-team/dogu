import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1700116045031 implements MigrationInterface {
  name = 'TypeormMigration1700116045031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_license" ALTER COLUMN "liveTestingRemainingFreeSeconds" SET DEFAULT '6000'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_license" ALTER COLUMN "liveTestingRemainingFreeSeconds" SET DEFAULT '10800'`);
  }
}
