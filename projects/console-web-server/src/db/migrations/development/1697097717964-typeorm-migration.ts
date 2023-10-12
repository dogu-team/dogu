import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1697097717964 implements MigrationInterface {
  name = 'typeormMigration1697097717964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "live_session" DROP COLUMN "heartbeat"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "live_session" ADD "heartbeat" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
  }
}
