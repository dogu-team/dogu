import { ProfileMethod, RuntimeInfo, Serial } from '@dogu-private/types';
import { FilledPrintable } from '@dogu-tech/common';

export type ProfileServices = ProfileService[];

export interface ProfileService {
  profile(serial: Serial, methods: ProfileMethod[], logger: FilledPrintable): Promise<Partial<RuntimeInfo>>;
}
