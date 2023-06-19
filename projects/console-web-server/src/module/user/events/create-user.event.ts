import { User } from '../../../db/entity/user.entity';

export class UserCreatedEvent {
  constructor(user: User) {
    this.user = user;
  }
  static readonly EVENT_NAME = 'user.created';
  user: User;
}
