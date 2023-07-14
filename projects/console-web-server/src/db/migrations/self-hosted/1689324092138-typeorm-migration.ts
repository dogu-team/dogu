import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689324092138 implements MigrationInterface {
  name = 'typeormMigration1689324092138';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote_device_job" ADD "in_progress_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "remote_device_job" ADD "completed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`DROP TABLE "remote_webdriver"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote_device_job" DROP COLUMN "completed_at"`);
    await queryRunner.query(`ALTER TABLE "remote_device_job" DROP COLUMN "in_progress_at"`);
  }
}
