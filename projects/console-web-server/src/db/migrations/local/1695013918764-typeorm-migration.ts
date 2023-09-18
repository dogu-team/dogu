import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1695013918764 implements MigrationInterface {
  name = 'typeormMigration1695013918764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_device_job" ADD "window_process_id" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_device_job" DROP COLUMN "window_process_id"`);
  }
}
