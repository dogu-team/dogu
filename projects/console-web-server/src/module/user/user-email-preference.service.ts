import { UserId } from '@dogu-private/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserEmailPreference } from '../../db/entity';
import { EmailService } from '../email/email.service';
import { UpdateUserEmailPreferenceDto } from './dto/user-email-preference.dto';

@Injectable()
export class UserEmailPreferenceService {
  constructor(
    private readonly emailService: EmailService,
    @InjectDataSource()
    private readonly dataSoure: DataSource,
  ) {}

  async updateEmailPreference(userId: UserId, dto: UpdateUserEmailPreferenceDto): Promise<void> {
    const { newsletter } = dto;
    const repository = this.dataSoure.getRepository(UserEmailPreference);
    const currentPrerefence = await repository.findOne({ where: { userId }, relations: ['user'] });

    if (currentPrerefence) {
      const value: Partial<UserEmailPreference> = { newsletter };
      const updatedPreference = Object.assign(currentPrerefence, value);

      await repository.save(updatedPreference);
    } else {
      throw new NotFoundException(`UserEmailPreference not found. userId: ${userId}`);
    }
  }
}
