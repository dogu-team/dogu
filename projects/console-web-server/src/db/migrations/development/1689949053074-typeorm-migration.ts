import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689949053074 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE remote_device_job RENAME COLUMN state TO session_state;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE remote_device_job RENAME COLUMN session_state TO state;`);
  }
}
