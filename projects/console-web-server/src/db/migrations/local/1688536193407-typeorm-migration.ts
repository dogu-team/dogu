import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1688536193407 implements MigrationInterface {
  name = 'typeormMigration1688536193407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization_key" ("organization_key_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "key" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_0e48453b83b464bfbab05ed194b" PRIMARY KEY ("organization_key_id"))`,
    );
    await queryRunner.query(
      `WITH RECURSIVE random_string(organization_id, string, level) AS (
        SELECT o.organization_id, '', 0 FROM organization AS o
        UNION ALL
        SELECT
            rs.organization_id,
            rs.string || 
                SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' 
                FROM (floor(random() * 62 + 1)::integer) FOR 1),
            rs.level + 1
        FROM random_string AS rs
        WHERE rs.level < 32
    ),
    insert_candidates AS (
        SELECT r.organization_id, r.string
        FROM random_string AS r
        WHERE r.level = 32
        AND NOT EXISTS (
            SELECT 1 FROM organization_key ok
            WHERE ok.organization_id = r.organization_id
        )
    )
    INSERT INTO organization_key(organization_key_id, organization_id, key, created_at, updated_at)
    SELECT uuid_generate_v4(), ic.organization_id, ic.string, NOW(), NOW()
    FROM insert_candidates AS ic;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_key"`);
  }
}
