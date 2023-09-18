import { ChangeLogType } from '@dogu-private/types';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1695037777473 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "change_log" ("change_log_id", "title", "content", "tags") VALUES (gen_random_uuid(), 'Dogu v2.0.0 has been released!🚀',
'Dogu has been updated to v2.0.0! Read on to discover what''s new:

1. **Manage app with latest build version and Routine utilization**
2. **Apply licenses for Self-Hosted Dogu**
3. **Browser video records in routine result report**
4. **Browser runners in host device**

Thank you for your continued support!  
For more details, please visit our [blog post](https://blog.dogutech.io/dogu_v2-0-0_updates)!  

Please feel free to reach out to our team on [Dogu Community](https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw) if you have any questions or need assistance.',
'${ChangeLogType.RELEASE},${ChangeLogType.FEATURE}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "change_log" WHERE "title" = 'Dogu v2.0.0 has been released!🚀'`);
  }
}
