import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { JWTInput } from 'google-auth-library';

export class JWTInputDto implements JWTInput {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  client_id!: string;

  @IsString()
  @IsNotEmpty()
  client_secret!: string;

  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}

class LoadCredentialInfo {
  @IsString()
  @IsNotEmpty()
  client_id!: string;

  @IsString()
  @IsNotEmpty()
  project_id!: string;

  @IsString()
  @IsNotEmpty()
  auth_uri!: string;

  @IsString()
  @IsNotEmpty()
  token_uri!: string;

  @IsString()
  @IsNotEmpty()
  auth_provider_x509_cert_url!: string;

  @IsString()
  @IsNotEmpty()
  client_secret!: string;

  @IsString({ each: true })
  @IsNotEmpty()
  redirect_uris!: string[];
}

export class LoadCredentialDto {
  @ValidateNested()
  @Type(() => LoadCredentialInfo)
  installed!: LoadCredentialInfo;
}

export class ServiceAccountKeyDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  project_id!: string;

  @IsString()
  @IsNotEmpty()
  private_key_id!: string;

  @IsString()
  @IsNotEmpty()
  private_key!: string;

  @IsString()
  @IsNotEmpty()
  client_email!: string;

  @IsString()
  @IsNotEmpty()
  client_id!: string;

  @IsString()
  @IsNotEmpty()
  auth_uri!: string;

  @IsString()
  @IsNotEmpty()
  token_uri!: string;

  @IsString()
  @IsNotEmpty()
  auth_provider_x509_cert_url!: string;

  @IsString()
  @IsNotEmpty()
  client_x509_cert_url!: string;
}
