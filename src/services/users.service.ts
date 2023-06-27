import { User } from '../entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this._userRepository.find();
  }

  async findById(id: number): Promise<User> {
    return await this._userRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this._userRepository.findOneBy({ email });
    return user;
  }

  async create(payload: Partial<User>): Promise<User> {
    const existingUser = await this._userRepository.findOneBy({
      email: payload.email,
    });

    if (existingUser) {
      throw new BadRequestException(
        `This e-mail, ${payload.email} is already in use, by another user.`,
      );
    }

    const user = this._userRepository.create(payload);
    await this._userRepository.save(user);
    return user;
  }

  async update(id: number, user: Partial<User>): Promise<UpdateResult> {
    const result = await this._userRepository.update({ id }, user);
    return result;
  }
}
