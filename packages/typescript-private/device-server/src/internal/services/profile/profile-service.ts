import { ProfileMethod, RuntimeInfo } from '@dogu-private/types';

export type ProfileServices = ProfileService[];

export interface ProfileService {
  profile(methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>>;
}
