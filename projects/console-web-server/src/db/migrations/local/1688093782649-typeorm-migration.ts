import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1688093782649 implements MigrationInterface {
  name = 'typeormMigration1688093782649';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "host" ADD "agent_version" character varying(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "host" DROP COLUMN "agent_version"`);
  }
}
