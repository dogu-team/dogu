import { ChangeLogType } from '@dogu-private/types';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1692440562457 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "change_log" ("change_log_id", "title", "content", "tags") VALUES (gen_random_uuid(), 'Dogu v1.8.0 has been released!🚀',
'Dogu updated to v1.8.0!. Read on to discover what''s new:

1. **Multi device view in running routines**
2. **Update Dogu Agent in console**
3. **Github action integration available. [Documentation](https://docs.dogutech.io/integration/cicd/github)**

Thank you for your continued support!  

Please feel free to reach out to our team on [Dogu Community](https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw) if you have any questions or need assistance.',
'${ChangeLogType.RELEASE},${ChangeLogType.FEATURE}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "change_log" WHERE "title" = 'Dogu v1.8.0 has been released!🚀'`);
  }
}
