import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1696561519343 implements MigrationInterface {
  name = 'typeormMigration1696561519343';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_visit"`);

    const changeLogContent = `We are planning to revise the organization policy to enhance the user experience with Dogu.
      
Starting now, certain actions related to organizations will be subject to restrictions:

1. Users will no longer be able to create multiple organizations.
2. Deleting organizations will be disabled.
3. Upon accepting an invitation, users will automatically leave their previous organization.

The upcoming changes to the organization policy are as follows:

1. Organization list page will be removed.

We will notify you via email once the update is fully implemented.

If you have any questions or require assistance, please don''t hesitate to reach out to our team on the [Dogu Community Slack](https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw).`;

    await queryRunner.query(`UPDATE "change_log" SET "content" = '${changeLogContent}' WHERE "title" = 'Organization policy will be changed'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_visit" ("user_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_640e493c0bd7f7b950838445fe0" PRIMARY KEY ("user_id", "organization_id"))`,
    );
  }
}
