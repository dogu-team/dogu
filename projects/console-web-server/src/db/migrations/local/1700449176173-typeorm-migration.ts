import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../../entity/user.entity';

export class TypeormMigration1700449176173 implements MigrationInterface {
  name = 'TypeormMigration1700449176173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "unique_email" character varying(100)`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_6bbdd0876d5b5a1bd3b79971602" UNIQUE ("unique_email")`);

    const users = await queryRunner.manager.getRepository(User).find();
    for (const user of users) {
      await queryRunner.query(`UPDATE "user" SET "unique_email" = $1 WHERE "user_id" = $2`, [user.email, user.userId]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_6bbdd0876d5b5a1bd3b79971602"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "unique_email"`);
  }
}
