import { DeviceServerEnv } from '@dogu-private/dost-children';
import { loadEnvLazySync } from '@dogu-tech/env-tools';

export const env = loadEnvLazySync(DeviceServerEnv);
