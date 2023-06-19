import { AddTeamUserDtoBase, CreateTeamDtoBase, FindTeamsDtoBase, UpdateTeamDtoBase } from '@dogu-private/console';
import { TEAM_NAME_MAX_LENGTH, TEAM_NAME_MIN_LENGTH, UserId, USER_ID_MAX_LENGTH } from '@dogu-private/types';
import { IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { PageDto } from '../../../common/dto/pagination/page.dto';

export class CreateTeamDto implements CreateTeamDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(TEAM_NAME_MIN_LENGTH)
  @MaxLength(TEAM_NAME_MAX_LENGTH)
  name!: string;
}

export class UpdateTeamDto implements UpdateTeamDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(TEAM_NAME_MIN_LENGTH)
  @MaxLength(TEAM_NAME_MAX_LENGTH)
  name!: string;
}

export class FindTeamsDto extends PageDto implements FindTeamsDtoBase {
  @IsOptional()
  @IsString()
  keyword = '';
}

export class AddTeamUserDto implements AddTeamUserDtoBase {
  @IsNotEmpty()
  @IsString()
  @Length(USER_ID_MAX_LENGTH)
  userId!: UserId;
}
