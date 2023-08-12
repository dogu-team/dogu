import { ChangeLogType } from '@dogu-private/types';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1691756463240 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "change_log" ("change_log_id", "title", "content", "tags") VALUES (gen_random_uuid(), 'Dogu v1.7.0 has been released!🚀',
'Dogu updated to v1.7.0 packed with new features and enhancements to elevate your experience. Read on to discover what''s new:

1. **Slack Integration for Dogu Cloud**
2. **Playwright Support (Experimental)**
3. **Remote Testing with Gamium - iOS Support**

For detailed information, check out the [Dogu Documentation](https://docs.dogutech.io).

Thank you for your continued support!  

Please feel free to reach out to our team on [Dogu Community](https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw) if you have any questions or need assistance.',
'${ChangeLogType.RELEASE}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "change_log" WHERE "title" = 'Dogu v1.7.0 has been released!🚀'`);
  }
}
