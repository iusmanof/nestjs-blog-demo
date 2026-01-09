import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import PostsService from '../application/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostViewDto } from './post-view.dto';
import PostsQueryRepository from '../infra/posts.query-repository';
import { PostsQueryParams } from './posts.query-params';

@Controller('posts')
class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPosts(@Query() query: PostsQueryParams) {
    return await this.postQueryRepository.getAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') id: string) {
    return await this.postQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get(':postId/comments')
  @HttpCode(HttpStatus.OK)
  async getCommentsForPost(@Param('postId') postId: string) {
    return await this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() dto: CreatePostDto) {
    const post = await this.postsService.create(dto);
    return PostViewDto.mapToView(post);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') id: string, @Body() dto: CreatePostDto) {
    const updatedPost = await this.postsService.update(id, dto);
    if (!updatedPost) {
      throw new NotFoundException(`Post not found`);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    const deletedPost = await this.postsService.delete(id);
    if (!deletedPost) {
      throw new NotFoundException(`Post not found`);
    }
  }
}

export default PostsController;
