import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1700548403603 implements MigrationInterface {
  name = 'TypeormMigration1700548403603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "whitelist_domain" ("id" SERIAL NOT NULL, "domain" character varying(255) NOT NULL, CONSTRAINT "UQ_f8c5e647b23e84b823347bcb091" UNIQUE ("domain"), CONSTRAINT "PK_af5dd045c5f679e750ab3b961c9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "whitelist_domain"`);
  }
}
