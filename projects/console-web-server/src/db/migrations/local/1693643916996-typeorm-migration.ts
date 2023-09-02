import { ChangeLogType } from '@dogu-private/types';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693643916996 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "change_log" ("change_log_id", "title", "content", "tags") VALUES (gen_random_uuid(), 'Dogu v1.10.0 has been released!🚀',
'Dogu updated to v1.10.0! Read on to discover what''s new:

1. **Support Bitbucket integration with a project**
3. **Jenkins plugin and GitHub Action integration with routine**
2. **Project template - Web, Mobile app, Game, and Custom**

Thank you for your continued support!  
For more details, please visit our [blog post](https://blog.dogutech.io/dogu_v1-10-0_updates)!  

Please feel free to reach out to our team on [Dogu Community](https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw) if you have any questions or need assistance.',
'${ChangeLogType.RELEASE},${ChangeLogType.FEATURE}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "change_log" WHERE "title" = 'Dogu v1.10.0 has been released!🚀'`);
  }
}
