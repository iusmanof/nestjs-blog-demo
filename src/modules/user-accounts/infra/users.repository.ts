import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { UserDbType } from '../domain/user-db.type';

@Injectable()
class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: UserDbType): Promise<UserDocument> {
    const user = new this.userModel({
      login: dto.login,
      email: dto.email,
      passwordHash: dto.passwordHash,
    });

    return user.save();
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
