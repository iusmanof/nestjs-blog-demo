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
import { CreateUserDto } from './input-dto/create-user.dto';
import { UsersQueryRepository } from '../infra/users.query-repository';
import { UsersQueryParamsDto } from './input-dto/users-query-params.dto';
import { UserViewDto } from './view-dto/user-view.dto';

@Controller('users')
class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUsers(@Query() query: UsersQueryParamsDto) {
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
