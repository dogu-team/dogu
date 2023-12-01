import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1701399405401 implements MigrationInterface {
  name = 'TypeormMigration1701399405401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blocked_domain" ("id" SERIAL NOT NULL, "domain" character varying(255) NOT NULL, CONSTRAINT "UQ_3bb6785b7872c6af48ae763bd30" UNIQUE ("domain"), CONSTRAINT "PK_0be486e3580fc34a89c7223488f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permitted_domain" ("id" SERIAL NOT NULL, "domain" character varying(255) NOT NULL, CONSTRAINT "UQ_3afad4d7819571eb9e8373c30e5" UNIQUE ("domain"), CONSTRAINT "PK_427834917e96504110cf29156e1" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "permitted_domain"`);
    await queryRunner.query(`DROP TABLE "blocked_domain"`);
  }
}
