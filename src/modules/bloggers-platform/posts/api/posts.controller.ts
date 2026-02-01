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
} from '@nestjs/common';
import { CreatePostDto } from './input-dto/create-post.dto';
import { PostsQueryParamsDto } from './input-dto/posts-query-params.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.usecase';
import { Types } from 'mongoose';
import { PostViewDto } from './view-dto/post-view.dto';
import { GetPostByIdQuery } from '../application/queries/get-posts-by-id.query-handler';
import { GetPostQuery } from '../application/queries/get-posts.query-handler';
import { UpdatePostCommand } from '../application/use-cases/update-post.usecase';
import { DeletePostCommand } from '../application/use-cases/delete-post.usecase';
import { GetCommentsByPostIdQuery } from '../application/queries/get-comments-by-post-id.query-handler';
import { CommentViewDto } from './view-dto/comment-view.dto';
import { CommentsQueryParamsDto } from './input-dto/comments-query-params.dto';

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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') id: Types.ObjectId): Promise<PostViewDto> {
    return this.queryBus.execute(new GetPostByIdQuery(id));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPosts(@Query() query: PostsQueryParamsDto): Promise<PostViewDto> {
    return this.queryBus.execute(new GetPostQuery(query));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: Types.ObjectId,
    @Body() dto: CreatePostDto,
  ): Promise<PostViewDto> {
    return this.commandBus.execute(new UpdatePostCommand(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: Types.ObjectId): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(id));
  }

  @Get(':postId/comments')
  @HttpCode(HttpStatus.OK)
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: CommentsQueryParamsDto,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute(new GetCommentsByPostIdQuery(postId, query));
  }
}

export default PostsController;
