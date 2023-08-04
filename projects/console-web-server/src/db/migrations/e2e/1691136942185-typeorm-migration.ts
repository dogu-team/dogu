import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691136942185 implements MigrationInterface {
  name = 'typeormMigration1691136942185';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_application" ADD "creator_type" smallint NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "project_application" DROP CONSTRAINT "FK_6d5ee33558d3362d2d0af334bbb"`);
    await queryRunner.query(`ALTER TABLE "project_application" ALTER COLUMN "creator_id" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "project_application" ADD CONSTRAINT "FK_6d5ee33558d3362d2d0af334bbb" FOREIGN KEY ("creator_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_application" DROP CONSTRAINT "FK_6d5ee33558d3362d2d0af334bbb"`);
    await queryRunner.query(`ALTER TABLE "project_application" ALTER COLUMN "creator_id" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "project_application" ADD CONSTRAINT "FK_6d5ee33558d3362d2d0af334bbb" FOREIGN KEY ("creator_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "project_application" DROP COLUMN "creator_type"`);
  }
}
