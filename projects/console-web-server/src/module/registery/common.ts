import { SNS_TYPE, TokenId, UserId, UserSnsId, USER_VERIFICATION_STATUS } from '@dogu-private/types';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';

import { UserAndVerificationToken } from '../../db/entity/relations/user-and-verification-token.entity';
import { UserEmailPreference } from '../../db/entity/user-email-preference.entity';
import { UserSns } from '../../db/entity/user-sns.entity';
import { User } from '../../db/entity/user.entity';
import { FeatureConfig } from '../../feature.config';
import { TokenService } from '../token/token.service';

export function createUniqueEmail(email: string): string {
  // remove dot and plus from email
  const [local, domain] = email.split('@');
  const localWithoutDot = local.replace(/\./g, '');
  const localWithoutPlus = localWithoutDot.split('+')[0];
  const uniqueEmail = `${localWithoutPlus}@${domain}`;
  return uniqueEmail;
}

export async function createUser(manager: EntityManager, email: string, password: string | null, name: string): Promise<User> {
  let savePassword;
  if (password) {
    savePassword = await bcrypt.hash(password, 10);
  } else {
    savePassword = null;
  }

  let isRootUser = false;
  if (FeatureConfig.get('licenseModule') === 'self-hosted') {
    const rootUser = await manager.getRepository(User).findOne({
      where: {
        isRoot: true,
      },
    });

    if (!rootUser) {
      isRootUser = true;
    }
  }

  const isTutorialCompleted = FeatureConfig.get('licenseModule') === 'cloud' ? 1 : 0;
  const uniqueEmail = createUniqueEmail(email);

  const sameUniqueEmailUser = await manager.getRepository(User).findOne({
    where: {
      uniqueEmail,
    },
  });

  if (sameUniqueEmailUser) {
    throw new ConflictException('User with same email already exists');
  }

  const userData = manager.getRepository(User).create({
    email,
    uniqueEmail,
    name,
    password: savePassword,
    isRoot: isRootUser,
    isTutorialCompleted,
  });
  const user = await manager.getRepository(User).save(userData);
  return user;
}

export async function createSNSUser(manager: EntityManager, userId: UserId, userSnsId: UserSnsId, snsType: SNS_TYPE): Promise<UserSns> {
  const snsUserData = manager.getRepository(UserSns).create({
    userId,
    userSnsId,
    snsType,
  });
  const user = await manager.getRepository(UserSns).save(snsUserData);
  return user;
}

export async function createUserEmailPreference(manager: EntityManager, userId: UserId, newsletter: boolean): Promise<void> {
  const token = TokenService.createEmailUnsubscribeToken();
  const userEmailPreference = manager.getRepository(UserEmailPreference).create({ userId, newsletter: newsletter ? 1 : 0, token });
  await manager.getRepository(UserEmailPreference).save(userEmailPreference);
}

export async function createUserAndVerificationToken(manager: EntityManager, userId: UserId, tokenId: TokenId | null, status: USER_VERIFICATION_STATUS): Promise<void> {
  const createdUserAndVerificationTokenData = manager.getRepository(UserAndVerificationToken).create({
    userId,
    tokenId,
    status,
  });
  const test = await manager.getRepository(UserAndVerificationToken).save(createdUserAndVerificationTokenData);
  return;
}
