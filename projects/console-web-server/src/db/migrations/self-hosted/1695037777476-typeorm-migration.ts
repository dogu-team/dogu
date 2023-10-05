import { ChangeLogType } from '@dogu-private/types';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1695037777476 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "change_log" ("change_log_id", "title", "content", "tags") VALUES (gen_random_uuid(), 'Organization policy will be changed',
'We are planning to change the organization policy to make it easier to use Dogu.  
From now on, creating and deleting organizations will be restricted.  

And organization policy will be changed on next update as follows:

1. Multiple organizations will not be allowed.
3. Deleting organization will not be allowed.
2. After accepting the invitation, the user will leave the previous organization.
4. After leaving the organization, the user will join the default organization.

We''ll send you an email again when the update is fully ready.

Please feel free to reach out to our team on [Dogu Community](https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw) if you have any questions or need assistance.',
'${ChangeLogType.ANNOUNCEMENT}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "change_log" WHERE "title" = 'Organization policy will be changed'`);
  }
}
