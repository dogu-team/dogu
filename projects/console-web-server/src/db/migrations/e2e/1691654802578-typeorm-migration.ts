import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691654802578 implements MigrationInterface {
  name = 'typeormMigration1691654802578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "last_change_log_seen_at" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "change_log_user_reaction" DROP COLUMN "reaction_type"`);
    await queryRunner.query(`ALTER TABLE "change_log_user_reaction" ADD "reaction_type" smallint NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "change_log_user_reaction" DROP COLUMN "reaction_type"`);
    await queryRunner.query(`ALTER TABLE "change_log_user_reaction" ADD "reaction_type" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "last_change_log_seen_at" SET DEFAULT ('now'::text)::timestamp(3) with time zone`);
  }
}
