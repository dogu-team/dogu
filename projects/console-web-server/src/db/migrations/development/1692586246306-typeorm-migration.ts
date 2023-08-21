import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692586246306 implements MigrationInterface {
  name = 'typeormMigration1692586246306';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "last_accessed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_accessed_at"`);
  }
}
