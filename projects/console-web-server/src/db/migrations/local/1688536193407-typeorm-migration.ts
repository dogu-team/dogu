import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1688536193407 implements MigrationInterface {
  name = 'typeormMigration1688536193407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization_key" ("organization_key_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "key" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_0e48453b83b464bfbab05ed194b" PRIMARY KEY ("organization_key_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_key"`);
  }
}
