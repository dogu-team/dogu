import { SNS_TYPE, TokenId, UserId, UserSnsId, USER_VERIFICATION_STATUS } from '@dogu-private/types';
import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { UserAndVerificationToken } from '../../db/entity/relations/user-and-verification-token.entity';
import { UserEmailPreference } from '../../db/entity/user-email-preference.entity';
// import { UserGitlab } from '../../db/entity/user-gitlab.entity';
import { UserSns } from '../../db/entity/user-sns.entity';
import { User } from '../../db/entity/user.entity';

export async function createUser(manager: EntityManager, email: string, password: string | null, name: string) {
  let savePassword;
  if (password) {
    savePassword = await bcrypt.hash(password, 10);
  } else {
    savePassword = null;
  }

  const userData = manager.getRepository(User).create({
    email,
    name,
    password: savePassword,
  });
  const user = await manager.getRepository(User).save(userData);
  return user;
}

export async function createSNSUser(manager: EntityManager, userId: UserId, userSnsId: UserSnsId, snsType: SNS_TYPE) {
  const snsUserData = manager.getRepository(UserSns).create({
    userId,
    userSnsId,
    snsType,
  });
  const user = await manager.getRepository(UserSns).save(snsUserData);
  return user;
}

// export async function createUserGitlab(manager: EntityManager, userId: UserId, gitlabUserCreatedData: GitlabUserCreatedData) {
//   const createdGitlabUserData = manager.getRepository(UserGitlab).create({
//     userId,
//     gitlabUserId: gitlabUserCreatedData.userId,
//     gitlabToken: gitlabUserCreatedData.impersonationToken,
//   });
//   await manager.getRepository(UserGitlab).save(createdGitlabUserData);
// }

export async function createUserEmailPreference(manager: EntityManager, userId: UserId, newsletter: boolean) {
  const userEmailPreference = manager.getRepository(UserEmailPreference).create({ userId, newsletter: newsletter ? 1 : 0 });
  await manager.getRepository(UserEmailPreference).save(userEmailPreference);
}

export async function createUserAndVerificationToken(manager: EntityManager, userId: UserId, tokenId: TokenId | null, status: USER_VERIFICATION_STATUS) {
  const createdUserAndVerificationTokenData = manager.getRepository(UserAndVerificationToken).create({
    userId,
    tokenId,
    status,
  });
  const test = await manager.getRepository(UserAndVerificationToken).save(createdUserAndVerificationTokenData);
  return;
}
