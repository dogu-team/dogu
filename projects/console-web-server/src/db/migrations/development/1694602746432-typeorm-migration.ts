import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1694602746432 implements MigrationInterface {
  name = 'typeormMigration1694602746432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."dogu_license_type_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(
      `CREATE TABLE "dogu_license" ("dogu_license_id" uuid NOT NULL, "type" "public"."dogu_license_type_enum" NOT NULL, "token" character varying NOT NULL, "organization_id" character varying, "company_name" character varying, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_8b159e96f99aac4c5ecb16eadf0" UNIQUE ("token"), CONSTRAINT "PK_7c40543375626635e3d3f0be0db" PRIMARY KEY ("dogu_license_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dogu_license"`);
    await queryRunner.query(`DROP TYPE "public"."dogu_license_type_enum"`);
  }
}
