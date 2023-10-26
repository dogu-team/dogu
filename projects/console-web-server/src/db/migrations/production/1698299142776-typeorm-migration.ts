import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1698299142776 implements MigrationInterface {
  name = 'TypeormMigration1698299142776';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dogu_license" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."dogu_license_type_enum"`);
    await queryRunner.query(`ALTER TABLE "dogu_license" DROP COLUMN "company_name"`);
    await queryRunner.query(`ALTER TABLE "dogu_license" DROP CONSTRAINT "UQ_8b159e96f99aac4c5ecb16eadf0"`);
    await queryRunner.query(`ALTER TABLE "dogu_license" DROP COLUMN "token"`);
    await queryRunner.query(`ALTER TABLE "dogu_license" DROP COLUMN "organization_id"`);
    await queryRunner.query(`ALTER TABLE "dogu_license" ADD "license_key" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dogu_license" DROP COLUMN "license_key"`);
    await queryRunner.query(`ALTER TABLE "dogu_license" ADD "organization_id" character varying`);
    await queryRunner.query(`ALTER TABLE "dogu_license" ADD "token" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "dogu_license" ADD CONSTRAINT "UQ_8b159e96f99aac4c5ecb16eadf0" UNIQUE ("token")`);
    await queryRunner.query(`ALTER TABLE "dogu_license" ADD "company_name" character varying`);
    await queryRunner.query(`CREATE TYPE "public"."dogu_license_type_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`ALTER TABLE "dogu_license" ADD "type" "public"."dogu_license_type_enum" NOT NULL`);
  }
}
