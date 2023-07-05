import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1688449149402 implements MigrationInterface {
  name = 'typeormMigration1688449149402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_repository" ("project_repository_id" uuid NOT NULL, "project_id" uuid NOT NULL, "repository_type" smallint NOT NULL DEFAULT '0', "url" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "REL_3ddc7a377caff72093d46ca662" UNIQUE ("project_id"), CONSTRAINT "PK_660775941fdf841898886c5c435" PRIMARY KEY ("project_repository_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gitlab_repository_auth" ("gitlab_repository_auth_id" uuid NOT NULL, "project_repository_id" uuid NOT NULL, "token" character varying, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "REL_b98add1eab6b2783835b0af0fe" UNIQUE ("project_repository_id"), CONSTRAINT "PK_cfc9a9afe7bb22ed93c4f226deb" PRIMARY KEY ("gitlab_repository_auth_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "github_repository_auth" ("github_repository_auth_id" uuid NOT NULL, "project_repository_id" uuid NOT NULL, "token" character varying, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "REL_07cab02f0e389feebec20698a4" UNIQUE ("project_repository_id"), CONSTRAINT "PK_5af01569b3948ac08df7fd2dd11" PRIMARY KEY ("github_repository_auth_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_repository" ADD CONSTRAINT "FK_3ddc7a377caff72093d46ca6620" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gitlab_repository_auth" ADD CONSTRAINT "FK_b98add1eab6b2783835b0af0fee" FOREIGN KEY ("project_repository_id") REFERENCES "project_repository"("project_repository_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "github_repository_auth" ADD CONSTRAINT "FK_07cab02f0e389feebec20698a44" FOREIGN KEY ("project_repository_id") REFERENCES "project_repository"("project_repository_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "github_repository_auth" DROP CONSTRAINT "FK_07cab02f0e389feebec20698a44"`);
    await queryRunner.query(`ALTER TABLE "gitlab_repository_auth" DROP CONSTRAINT "FK_b98add1eab6b2783835b0af0fee"`);
    await queryRunner.query(`ALTER TABLE "project_repository" DROP CONSTRAINT "FK_3ddc7a377caff72093d46ca6620"`);
    await queryRunner.query(`DROP TABLE "github_repository_auth"`);
    await queryRunner.query(`DROP TABLE "gitlab_repository_auth"`);
    await queryRunner.query(`DROP TABLE "project_repository"`);
  }
}
