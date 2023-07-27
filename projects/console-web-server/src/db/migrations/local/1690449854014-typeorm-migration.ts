import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1690449854014 implements MigrationInterface {
  name = 'typeormMigration1690449854014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_step" ALTER COLUMN "run" TYPE VARCHAR;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_step" ALTER COLUMN "run" TYPE VARCHAR(512);`);
  }
}
