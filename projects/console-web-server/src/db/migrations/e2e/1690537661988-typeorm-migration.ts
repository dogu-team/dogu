import { DeepPartial, MigrationInterface, QueryRunner } from 'typeorm';
import { v4 } from 'uuid';
import { TokenService } from '../../../module/token/token.service';
import { PersonalAccessToken } from '../../entity/personal-access-token.entity';
import { Token } from '../../entity/token.entity';
import { User } from '../../entity/user.entity';

export class typeormMigration1690537661988 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.manager.getRepository(User).find();

    for (const user of users) {
      const newTokenData: DeepPartial<Token> = {
        token: TokenService.createPersonalAccessToken(),
        expiredAt: null,
      };

      const pat = await queryRunner.manager.getRepository(PersonalAccessToken).findOne({ where: { userId: user.userId } });
      if (pat) continue;

      const tokenData = queryRunner.manager.getRepository(Token).create(newTokenData);
      const token = await queryRunner.manager.getRepository(Token).save(tokenData);

      const data = {
        personal_access_token_id: v4(),
        user_id: user.userId,
        token_id: token.tokenId,
      };

      await queryRunner.query(
        `INSERT INTO personal_access_token (personal_access_token_id, user_id, token_id )
           VALUES ($1, $2, $3)`,
        [data.personal_access_token_id, data.user_id, data.token_id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
