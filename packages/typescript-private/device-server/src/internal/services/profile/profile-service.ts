import { ProfileMethod, RuntimeInfo, Serial } from '@dogu-private/types';

export type ProfileServices = ProfileService[];

export interface ProfileService {
  profile(serial: Serial, methods: ProfileMethod[]): Promise<Partial<RuntimeInfo>>;
}
