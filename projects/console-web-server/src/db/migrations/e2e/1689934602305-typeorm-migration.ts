import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689934602305 implements MigrationInterface {
  name = 'typeormMigration1689934602305';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "remote" ADD CONSTRAINT "FK_b541145b0c77fed182591784e1d" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "remote" DROP CONSTRAINT "FK_b541145b0c77fed182591784e1d"`);
  }
}
