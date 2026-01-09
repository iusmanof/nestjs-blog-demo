import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { UserViewDto } from '../api/user-view.dto';
import { UsersQueryParams } from '../api/users-query.params';
import { UserPaginatedViewDto } from '../api/user-paginated.view.dto';
import { SortDirection } from '../../../core/dto/base.query-params.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getAll(query: UsersQueryParams) {
    const filter: any = {};
    const orConditions: any[] = [];

    if (query.searchLoginTerm) {
      orConditions.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      orConditions.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    const totalCount = await this.userModel.countDocuments(filter);

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortDirection === SortDirection.Asc ? 1 : -1;

    const users = await this.userModel
      .find(filter)
      .sort({ [sortField]: sortOrder, _id: 1 })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const items = users.map(UserViewDto.mapToView);

    return UserPaginatedViewDto.mapToView<UserViewDto>({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }
}
