import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import UsersService from '../application/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersQueryRepository } from '../infra/users.query-repository';
import { UsersQueryParams } from './users-query.params';
import { UserViewDto } from './user-view.dto';

@Controller('users')
class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUsers(@Query() query: UsersQueryParams) {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return UserViewDto.mapToView(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}

export default UserController;
