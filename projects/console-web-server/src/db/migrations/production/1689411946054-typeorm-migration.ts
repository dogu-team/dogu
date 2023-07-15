import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689411946054 implements MigrationInterface {
  name = 'typeormMigration1689411946054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote_device_job" ALTER COLUMN "session_id" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote_device_job" ALTER COLUMN "session_id" SET NOT NULL`);
  }
}
