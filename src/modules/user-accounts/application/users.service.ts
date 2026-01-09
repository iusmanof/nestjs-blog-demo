import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import UsersRepository from '../infra/users.repository';
import { UserDocument } from '../domain/user.entity';

@Injectable()
class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    return await this.usersRepository.create(dto);
  }

  async delete(id: string): Promise<void> {
    const isDeleted = await this.usersRepository.delete(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }
  }
}

export default UsersService;
