import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../core/guards/bearer/jwt-auth.guard';
import { UpdateCommentLikeStatusCommand } from '../application/use-cases/update-comment-like-status.usecase';
import { UpdateCommentLikeStatusDto } from './input-dto/update-comment-like-status.dto';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.usecase';
import { UpdateCommentDto } from './input-dto/update-comment.dto';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.usecase';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query-handler';

@Controller('comments')
class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentLikeStatusDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(commentId, dto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateCommentCommand(commentId, dto));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('commentId') commentId: string): Promise<any> {
    return this.commandBus.execute(new DeleteCommentCommand(commentId));
  }

  @Get(':commentId')
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Param('commentId') commentId: string): Promise<any> {
    return this.queryBus.execute(new GetCommentByIdQuery(commentId));
  }
}

export default CommentsController;
