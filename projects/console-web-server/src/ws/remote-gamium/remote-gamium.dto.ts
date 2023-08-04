import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RemoteGamiumDto {
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @IsNotEmpty()
  @IsNumber()
  port!: number;
}
