import { UsersQueryParamsDto } from '../../api/input-dto/users-query-params.dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../infra/users.query-repository';
import { UserPaginatedViewDto } from '../../dto/user-paginated.view.dto';
import { UserViewDto } from '../../api/view-dto/user-view.dto';

export class GetUsersQuery {
  constructor(public queryParams: UsersQueryParamsDto) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  async execute(
    query: GetUsersQuery,
  ): Promise<UserPaginatedViewDto<UserViewDto>> {
    const { items, totalCount } = await this.usersQueryRepository.getAll(
      query.queryParams,
    );

    return UserPaginatedViewDto.mapToView({
      items: items.map(UserViewDto.mapToView),
      page: query.queryParams.pageNumber,
      pageSize: query.queryParams.pageSize,
      totalCount,
    });
  }
}
