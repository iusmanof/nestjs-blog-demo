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
import { BlogsService } from '../application/blogs.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';
import PostsService from '../../posts/application/posts.service';

@Controller('blogs')
class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllBlogs() {
    return this.blogsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBlog(@Body() dto: CreateBlogDto) {
    return this.blogsService.create(dto);
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  getAllPostsForBlog(@Param('blogId') blogId: string) {
    return this.postsService.findByBlogId(blogId);
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostForBlogDto,
  ) {
    return this.postsService.createForBlog(blogId, dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getBlogById(@Param('id') id: string) {
    return this.blogsService.getById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateBlog(@Param('id') id: string, @Body() dto: CreateBlogDto) {
    return this.blogsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlog(@Param('id') id: string) {
    return this.blogsService.delete(id);
  }
}

export default BlogsController;
