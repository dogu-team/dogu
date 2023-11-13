import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1699856625705 implements MigrationInterface {
  name = 'TypeormMigration1699856625705';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "test_executor_web_responsive" ("test_executor_web_responsive_id" SERIAL NOT NULL, "test_executor_id" uuid NOT NULL, "url" character varying NOT NULL, "snapshot_count" integer NOT NULL DEFAULT '0', "vendors" character varying(255) array NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_d702aba1b4a5aea39d6ac053f9c" PRIMARY KEY ("test_executor_web_responsive_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "test_executor" ("test_executor_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "organization_id" uuid NOT NULL, "execution_id" character varying, "creator_id" uuid, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "canceled_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_205d52376142c04396cc110f539" PRIMARY KEY ("test_executor_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "test_executor"`);
    await queryRunner.query(`DROP TABLE "test_executor_web_responsive"`);
  }
}
