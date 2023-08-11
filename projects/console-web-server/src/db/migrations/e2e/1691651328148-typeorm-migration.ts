import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691651328148 implements MigrationInterface {
  name = 'typeormMigration1691651328148';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "last_change_log_seen_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(
      `ALTER TABLE "change_log_user_reaction" ADD CONSTRAINT "FK_a0b20238be688edc4f2c00e75bb" FOREIGN KEY ("change_log_id") REFERENCES "change_log"("change_log_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "change_log_user_reaction" ADD CONSTRAINT "FK_a82ac1103a933ce77cc42709d20" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "change_log_user_reaction" DROP CONSTRAINT "FK_a82ac1103a933ce77cc42709d20"`);
    await queryRunner.query(`ALTER TABLE "change_log_user_reaction" DROP CONSTRAINT "FK_a0b20238be688edc4f2c00e75bb"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_change_log_seen_at"`);
  }
}
