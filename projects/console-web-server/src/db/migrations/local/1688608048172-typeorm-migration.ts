import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1688608048172 implements MigrationInterface {
  name = 'typeormMigration1688608048172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_scm" ("project_scm_id" uuid NOT NULL, "project_id" uuid NOT NULL, "type" smallint NOT NULL DEFAULT '0', "url" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_60734f767a902afbc534fae2807" PRIMARY KEY ("project_scm_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_scm_github_auth" ("project_scm_github_auth_id" uuid NOT NULL, "project_scm_id" uuid NOT NULL, "token" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_a2ff0b992989276944770bd0d7d" PRIMARY KEY ("project_scm_github_auth_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_scm_gitlab_auth" ("project_scm_gitlab_auth_id" uuid NOT NULL, "project_scm_id" uuid NOT NULL, "token" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_3a6597447b141647e4d80f4e2b4" PRIMARY KEY ("project_scm_gitlab_auth_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_scm" ADD CONSTRAINT "FK_b15c91377e14c140cd3b65c8da6" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_scm_github_auth" ADD CONSTRAINT "FK_e323fd7969670980579dc6dedf0" FOREIGN KEY ("project_scm_id") REFERENCES "project_scm"("project_scm_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_scm_gitlab_auth" ADD CONSTRAINT "FK_4636bc9466a23ab5bd53db7233d" FOREIGN KEY ("project_scm_id") REFERENCES "project_scm"("project_scm_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_scm_gitlab_auth" DROP CONSTRAINT "FK_4636bc9466a23ab5bd53db7233d"`);
    await queryRunner.query(`ALTER TABLE "project_scm_github_auth" DROP CONSTRAINT "FK_e323fd7969670980579dc6dedf0"`);
    await queryRunner.query(`ALTER TABLE "project_scm" DROP CONSTRAINT "FK_b15c91377e14c140cd3b65c8da6"`);
    await queryRunner.query(`DROP TABLE "project_scm_gitlab_auth"`);
    await queryRunner.query(`DROP TABLE "project_scm_github_auth"`);
    await queryRunner.query(`DROP TABLE "project_scm"`);
  }
}
