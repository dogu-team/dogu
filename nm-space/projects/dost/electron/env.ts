import { IsString } from 'class-validator';

export class Env {
  @IsString()
  DOGU_APPUPDATE_PROVIDER = '';

  @IsString()
  DOGU_APPUPDATE_URL = '';

  @IsString()
  DOGU_APPUPDATE_SUBPATH = '';

  @IsString()
  DOGU_APPUPDATE_REGION = '';
}
