import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691230012792 implements MigrationInterface {
  name = 'typeormMigration1691230012792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization_slack" ("organization_id" uuid NOT NULL, "authed_user_id" character varying NOT NULL, "scope" character varying NOT NULL, "access_token" character varying NOT NULL, "bot_user_id" character varying NOT NULL, "team_id" character varying NOT NULL, "team_name" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_9434f2fd9eaab4fd12434483b4d" PRIMARY KEY ("organization_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_slack" ADD CONSTRAINT "FK_9434f2fd9eaab4fd12434483b4d" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_slack" DROP CONSTRAINT "FK_9434f2fd9eaab4fd12434483b4d"`);

    await queryRunner.query(`DROP TABLE "organization_slack"`);
  }
}
