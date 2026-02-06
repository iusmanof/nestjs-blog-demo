import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePostDto } from './input-dto/create-post.dto';
import { PostsQueryParamsDto } from './input-dto/posts-query-params.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.usecase';
import { PostViewDto } from './view-dto/post-view.dto';
import { GetPostByIdQuery } from '../application/queries/get-posts-by-id.query-handler';
import { GetPostQuery } from '../application/queries/get-posts.query-handler';
import { UpdatePostCommand } from '../application/use-cases/update-post.usecase';
import { DeletePostCommand } from '../application/use-cases/delete-post.usecase';
import { GetCommentsByPostIdQuery } from '../application/queries/get-comments-by-post-id.query-handler';
import { CommentViewDto } from './view-dto/comment-view.dto';
import { CommentsQueryParamsDto } from './input-dto/comments-query-params.dto';
import { UpdateLikeStatusCommand } from '../application/use-cases/update-like-status.usecase';
import { UpdateLikeStatusDto } from './input-dto/update-like-status.dto';
import { JwtAuthGuard } from '../../../../core/guards/bearer/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../../../core/types/authenticated-request.interface';
import { OptionalJwtAuthGuard } from '../../../../core/guards/optional-jwt-auth.guard';

@Controller('posts')
class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() dto: CreatePostDto) {
    return await this.commandBus.execute<CreatePostCommand, PostViewDto>(
      new CreatePostCommand(dto),
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PostViewDto> {
    const userId = req.user?.id;
    return this.queryBus.execute(new GetPostByIdQuery(id, userId));
  }

  @Get(':postId/comments')
  @HttpCode(HttpStatus.OK)
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: CommentsQueryParamsDto,
  ): Promise<CommentViewDto> {
    return await this.queryBus.execute(
      new GetCommentsByPostIdQuery(postId, query),
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPosts(
    @Query() query: PostsQueryParamsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PostViewDto> {
    const userId = req.user?.id;
    return this.queryBus.execute(new GetPostQuery(query, userId));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() dto: CreatePostDto,
  ): Promise<PostViewDto> {
    return this.commandBus.execute(new UpdatePostCommand(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(id));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('postId') postId: string,
    @Body() dto: UpdateLikeStatusDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const userId = req.user?.id;
    const login = req.user?.login;
    return this.commandBus.execute(
      new UpdateLikeStatusCommand(userId, postId, login, dto),
    );
  }
}

export default PostsController;
