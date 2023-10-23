import { ChangeLogType } from '@dogu-private/types';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1698050794638 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "change_log" ("change_log_id", "title", "content", "tags") VALUES (gen_random_uuid(), 'Dogu v2.1.0 has been released!🚀',
''Dogu has been updated to v2.1.0! Read on to discover what''s new:

1. **Live testing with Cloud device farm is now on beta!**
2. **Dogu Studio UI has been improved**
3. **Organization list page has been removed**

Thank you for your continued support!  

Please feel free to reach out to our team on [Dogu Community](https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw) if you have any questions or need assistance.',
'${ChangeLogType.ANNOUNCEMENT},${ChangeLogType.RELEASE}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "change_log" WHERE "title" = 'Dogu v2.1.0 has been released!🚀'`);
  }
}
