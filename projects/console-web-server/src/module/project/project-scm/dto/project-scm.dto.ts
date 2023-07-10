import { UpdateProjectGitDtoBase } from '@dogu-private/console';
import { PROJECT_SCM_TYPE } from '@dogu-private/types';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateProjectGitDto implements UpdateProjectGitDtoBase {
  @IsNotEmpty()
  @IsEnum(PROJECT_SCM_TYPE)
  service!: PROJECT_SCM_TYPE;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  token!: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => {
    try {
      const inputUrl = value.trim().replace(/\/+$/, '');
      const url = new URL(inputUrl);
      const pathname = url.pathname;
      if (pathname === '' || pathname === '/') {
        throw new HttpException(`Invalid URL. url: ${value}`, HttpStatus.BAD_REQUEST);
      }
      return `${url.protocol}//${url.host}${url.pathname}`;
    } catch (e) {
      throw new HttpException(`Invalid URL. url: ${value}`, HttpStatus.BAD_REQUEST);
    }
  })
  url!: string;
}
