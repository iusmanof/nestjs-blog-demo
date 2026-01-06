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
} from '@nestjs/common';
import PostsService from '../application/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';

@Controller('posts')
class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':postId/comments')
  @HttpCode(HttpStatus.OK)
  getCommentsForPost(@Param('postId') postId: string) {
    return this.postsService.findByPostId(postId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllPosts() {
    return this.postsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPost(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getPostById(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updatePost(@Param('id') id: string, @Body() dto: CreatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}

export default PostsController;
