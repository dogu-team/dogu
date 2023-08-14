import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691565687652 implements MigrationInterface {
  name = 'typeormMigration1691565687652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_slack_remote" ("project_id" uuid NOT NULL, "channel_id" character varying NOT NULL, "on_success" smallint NOT NULL, "on_failure" smallint NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_6be3565dc48953b340513e8b1bc" PRIMARY KEY ("project_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_slack_routine" ("project_id" uuid NOT NULL, "routine_id" uuid NOT NULL, "channel_id" character varying NOT NULL, "on_success" smallint NOT NULL, "on_failure" smallint NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_47fb82bfd23b8f29b78dde80de5" PRIMARY KEY ("project_id", "routine_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "project_routine_slack"`);
    await queryRunner.query(`DROP TABLE "project_remote_slack"`);
  }
}
