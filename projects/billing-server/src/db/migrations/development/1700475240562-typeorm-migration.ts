import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1700475240562 implements MigrationInterface {
  name = 'TypeormMigration1700475240562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_license" ALTER COLUMN "liveTestingRemainingFreeSeconds" SET DEFAULT '3600'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_license" ALTER COLUMN "liveTestingRemainingFreeSeconds" SET DEFAULT '6000'`);
  }
}
