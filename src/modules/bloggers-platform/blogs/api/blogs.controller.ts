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
import BlogsService from '../application/blogs.service';
import { CreateBlogDto } from './input-dto/create-blog.dto';
import { CreatePostForBlogDto } from '../../posts/api/input-dto/create-post-for-blog.dto';
import BlogsQueryRepository from '../infra/blogs.query-repository';
import PostsQueryRepository from '../../posts/infra/posts.query-repository';
import PostsService from '../../posts/application/posts.service';
import { PostsQueryParamsDto } from '../../posts/api/input-dto/posts-query-params.dto';
import { BlogsQueryParamsDto } from './input-dto/blogs-query-params.dto';

@Controller('blogs')
class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly blogQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllBlogs(@Query() query: BlogsQueryParamsDto) {
    return this.blogQueryRepository.getAll(query);
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getBlogById(@Param('id') id: string) {
    return this.blogQueryRepository.getByIdOrNotFoundFail(id);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() dto: CreateBlogDto) {
    return await this.blogsService.create(dto);
  }
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() dto: CreateBlogDto) {
    const updatedBlog = await this.blogsService.update(id, dto);
    if (!updatedBlog) {
      throw new NotFoundException('Blog not found');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    const deletedBlog = await this.blogsService.delete(id);
    if (!deletedBlog) {
      throw new NotFoundException('Blog not found');
    }
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  getAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: PostsQueryParamsDto,
  ) {
    return this.postQueryRepository.getPostsForBlog(blogId, query);
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostForBlogDto,
  ) {
    return this.postsService.createForBlog(blogId, dto);
  }
}

export default BlogsController;
