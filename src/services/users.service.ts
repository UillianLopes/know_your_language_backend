import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _repository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this._repository.find();
  }

  async findById(id: number): Promise<User> {
    const user = await this._repository.findOneBy({ id });
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this._repository.findOneBy({ email });
    return user;
  }

  async create(payload: Partial<User>): Promise<User> {
    const user = this._repository.create(payload);
    await this._repository.save(user);
    return user;
  }

  async update(id: number, user: Partial<User>): Promise<UpdateResult> {
    const result = await this._repository.update({ id }, user);
    return result;
  }
}
