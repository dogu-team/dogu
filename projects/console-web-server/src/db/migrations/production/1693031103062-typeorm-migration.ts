import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693031103062 implements MigrationInterface {
  name = 'typeormMigration1693031103062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_scm_bitbucket_auth" ("project_scm_github_auth_id" uuid NOT NULL, "project_scm_id" uuid NOT NULL, "token" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_37ac0fa79e08b57b79d4f145e6a" PRIMARY KEY ("project_scm_github_auth_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "project_scm_bitbucket_auth"`);
  }
}
