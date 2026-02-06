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
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './input-dto/create-user.dto';
import { UsersQueryParamsDto } from './input-dto/users-query-params.dto';
import { BasicAuthGuard } from '../../../core/guards/basic/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/create-user.usecase';
import { DeleteUserCommand } from '../application/use-cases/delete-user.usecase';
import { GetUsersQuery } from '../application/queries/get-users.query-handler';

@UseGuards(BasicAuthGuard)
@Controller('users')
class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto) {
    return this.commandBus.execute<CreateUserCommand, CreateUserDto>(
      new CreateUserCommand(dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUsers(@Query() query: UsersQueryParamsDto) {
    return this.queryBus.execute(new GetUsersQuery(query));
  }
}

export default UserController;
