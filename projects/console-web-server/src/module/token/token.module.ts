import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../../db/entity/token.entity';
import { TokenController } from '../../module/token/token.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  controllers: [TokenController],
})
export class TokenModule {}
