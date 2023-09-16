import { MigrationInterface, QueryRunner } from 'typeorm';
import { FEATURE_CONFIG } from '../../../feature.config';
import { User } from '../../entity/user.entity';

export class typeormMigration1694764981553 implements MigrationInterface {
  name = 'typeormMigration1694764981553';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "is_root" boolean NOT NULL DEFAULT false`);
    if (FEATURE_CONFIG.get('licenseModule') === 'self-hosted') {
      const firstCreatedUser = await queryRunner.manager.getRepository(User).createQueryBuilder('user').orderBy('user.createdAt', 'ASC').limit(1).getOne();
      if (firstCreatedUser) {
        await queryRunner.manager.getRepository(User).update(firstCreatedUser.userId, { isRoot: true });
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_root"`);
  }
}
