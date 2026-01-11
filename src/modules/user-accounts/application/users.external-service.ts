import UsersRepository from '../infra/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
class UsersExternalService {
  constructor(private readonly usersRepository: UsersRepository) {}
}

export default UsersExternalService;
