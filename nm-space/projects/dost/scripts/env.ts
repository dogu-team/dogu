import { PreloadDeviceServerEnv } from '@dogu-private/dost-children';
import { EnvLoader } from '@dogu-tech/env-tools';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Env } from '../electron/env';

export class DeployEnv {
  @IsString()
  @IsNotEmpty()
  DOGU_APPLE_API_KEY_ID!: string;

  @IsString()
  @IsNotEmpty()
  DOGU_APPLE_API_ISSUER_ID!: string;

  @IsString()
  @IsNotEmpty()
  DOGU_APPLE_API_PRIVATEKEY!: string;

  @IsString()
  @IsNotEmpty()
  DOGU_GITHUB_TOKEN!: string;

  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID?: string;

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY?: string;
}

export const env = new EnvLoader(DeployEnv, {
  printable: console,
  workingDir: process.cwd(),
  dotEnvConfigOptions: {
    path: '.env.deploy-secret',
  },
}).loadSync();

export const dostEnv = new EnvLoader(Env, {
  printable: console,
  workingDir: process.cwd(),
  dotEnvConfigOptions: {
    path: '.env.dost',
  },
}).loadSync();

export const deviceServerEnv = new EnvLoader(PreloadDeviceServerEnv, {
  printable: console,
  workingDir: process.cwd(),
  dotEnvConfigOptions: {
    path: '.env.device-server',
  },
}).loadSync();
