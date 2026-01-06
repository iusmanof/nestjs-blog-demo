import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
class UserService {
  findAll() {
    return {
      pagesCount: 0,
      page: 0,
      pageSize: 0,
      totalCount: 0,
      items: [
        {
          id: 'string',
          login: 'string',
          email: 'string',
          createdAt: '2026-01-06T11:36:13.731Z',
        },
      ],
    };
  }

  create(dto: CreateUserDto) {
    return `${dto.login}`;
  }

  delete(id: string) {
    return `dto/${id}`;
  }
}

export default UserService;
