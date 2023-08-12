import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691647515494 implements MigrationInterface {
  name = 'typeormMigration1691647515494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "change_log_user_reaction" ("change_log_user_reaction_id" uuid NOT NULL, "change_log_id" uuid NOT NULL, "user_id" uuid NOT NULL, "reaction_type" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_30132a8fc5e8bfa9bf605966b30" PRIMARY KEY ("change_log_user_reaction_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "change_log" ("change_log_id" uuid NOT NULL, "title" character varying NOT NULL, "content" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_32dbb889af98a71f31e0c27dd37" PRIMARY KEY ("change_log_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "change_log"`);
    await queryRunner.query(`DROP TABLE "change_log_user_reaction"`);
  }
}
