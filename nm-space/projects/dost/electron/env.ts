import { IsNotEmpty, IsString } from 'class-validator';

export class Env {
  @IsString()
  @IsNotEmpty()
  DOGU_APPUPDATE_PROVIDER!: string;

  @IsString()
  @IsNotEmpty()
  DOGU_APPUPDATE_URL!: string;

  @IsString()
  @IsNotEmpty()
  DOGU_APPUPDATE_SUBPATH!: string;

  @IsString()
  @IsNotEmpty()
  DOGU_APPUPDATE_REGION!: string;
}
