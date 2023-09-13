import { MigrationInterface, QueryRunner } from 'typeorm';
import { TokenService } from '../../../module/token/token.service';
import { User } from '../../entity/user.entity';

export class typeormMigration1694593550551 implements MigrationInterface {
  name = 'typeormMigration1694593550551';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_email_preference" ADD "token" character varying NOT NULL DEFAULT ''`);
    const users = await queryRunner.manager.getRepository(User).find();

    for (const uses of users) {
      const emailToken = TokenService.createEmailUnsubscribeToken();
      await queryRunner.query(`UPDATE "user_email_preference" SET "token" = $1 WHERE "user_id" = $2`, [emailToken, uses.userId]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_email_preference" DROP COLUMN "token"`);
  }
}
