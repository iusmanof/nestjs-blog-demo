import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { UserDbType } from '../domain/user-db.type';
import { CreateUserDto } from '../api/input-dto/create-user.dto';
import type { UserModelType } from '../domain/user.entity';

@Injectable()
class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
  ) {}

  create(dto: UserDbType): UserDocument {
    const createDto: CreateUserDto = {
      login: dto.login,
      email: dto.email,
      password: dto.passwordHash,
    };
    return this.userModel.createInstance(createDto);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async deleteAll() {
    await this.userModel.deleteMany({});
  }

  async save(user: UserDocument) {
    await user.save();
  }
}

export default UsersRepository;
