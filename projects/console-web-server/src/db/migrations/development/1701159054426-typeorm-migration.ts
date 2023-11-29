import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1701159054426 implements MigrationInterface {
  name = 'TypeormMigration1701159054426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."organization_scm_type_enum" AS ENUM('git')`);
    await queryRunner.query(`CREATE TYPE "public"."organization_scm_service_type_enum" AS ENUM('github', 'bitbucket', 'gitlab')`);
    await queryRunner.query(
      `CREATE TABLE "organization_scm" ("organization_scm_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "type" "public"."organization_scm_type_enum" NOT NULL, "service_type" "public"."organization_scm_service_type_enum" NOT NULL, "url" character varying NOT NULL, "token" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_e47884a7b8fa3f6bf21998b3fa9" PRIMARY KEY ("organization_scm_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_scm" ADD CONSTRAINT "FK_e723374e54579f4aa54951dc80d" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_scm" DROP CONSTRAINT "FK_e723374e54579f4aa54951dc80d"`);
    await queryRunner.query(`DROP TABLE "organization_scm"`);
    await queryRunner.query(`DROP TYPE "public"."organization_scm_service_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."organization_scm_type_enum"`);
  }
}
