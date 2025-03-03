import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/auth/create-user.dto';

export interface User {
  id: string;
  userName: string;
  email: string;
  password: string;
  role: string;
  mobile: string;
  address: string;
  city: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = {
      id: (this.users.length + 1).toString(),
      ...createUserDto,
    };
    this.users.push(user);
    return user;
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User> {
    const user = this.users.find(
      (u) => u.email === emailOrUsername || u.userName === emailOrUsername,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
