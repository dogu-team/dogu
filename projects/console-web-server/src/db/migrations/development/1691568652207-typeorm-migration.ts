import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691568652207 implements MigrationInterface {
  name = 'typeormMigration1691568652207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_slack_remote" ADD CONSTRAINT "FK_c7040f5cc6ff41ae7d5ef99f97c" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_slack_routine" ADD CONSTRAINT "FK_3550d59c856897035535c71d015" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_slack_routine" DROP CONSTRAINT "FK_3550d59c856897035535c71d015"`);
    await queryRunner.query(`ALTER TABLE "project_slack_remote" DROP CONSTRAINT "FK_c7040f5cc6ff41ae7d5ef99f97c"`);
  }
}
