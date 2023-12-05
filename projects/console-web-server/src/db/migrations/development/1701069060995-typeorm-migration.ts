import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1701069060995 implements MigrationInterface {
  name = 'TypeormMigration1701069060995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization_application" ("organization_application_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "creator_id" uuid, "creator_type" smallint NOT NULL DEFAULT '0', "name" character varying NOT NULL, "icon_file_name" character varying, "file_name" character varying NOT NULL, "file_extension" character varying NOT NULL, "file_size" bigint NOT NULL, "package" character varying NOT NULL, "version" character varying NOT NULL, "version_code" bigint NOT NULL DEFAULT '0', "is_latest" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_6605d9fc1ac298955e66f8c71ef" PRIMARY KEY ("organization_application_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_application" ADD CONSTRAINT "FK_76c6f47b5cddef7f84dfdedba06" FOREIGN KEY ("creator_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_application" ADD CONSTRAINT "FK_fc1d1a3dfc03ed9c4ec3e6b3a8d" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_application" DROP CONSTRAINT "FK_fc1d1a3dfc03ed9c4ec3e6b3a8d"`);
    await queryRunner.query(`ALTER TABLE "organization_application" DROP CONSTRAINT "FK_76c6f47b5cddef7f84dfdedba06"`);
    await queryRunner.query(`DROP TABLE "organization_application"`);
  }
}
