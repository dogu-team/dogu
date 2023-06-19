import { ProfileMethodKind } from '../../protocol/generated/tsproto/outer/profile/profile_method';

export const ProfileMethodAllKinds: ProfileMethodKind[] = [];

for (const kind in ProfileMethodKind) {
  if (isNaN(parseInt(kind))) {
    const kindEnum: ProfileMethodKind = ProfileMethodKind[kind as keyof typeof ProfileMethodKind];
    ProfileMethodAllKinds.push(kindEnum);
  }
}
