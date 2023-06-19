import { Controller } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('tokens')
export class TokenController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // @Head()
  // async verifyToken(@Query('email') email: string, @Query('type') type: TokenType, @Query('token') token: string): Promise<boolean> {
  //   const repository = this.dataSource.getRepository(Token);
  //   const isValid = await TokenService.isValid(repository, email, type, token);
  //   if (isValid) {
  //     return true;
  //   }
  //   throw new NotFoundException();
  // }
}
