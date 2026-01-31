import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateBlogDto } from './input-dto/create-blog.dto';
import { CreatePostForBlogDto } from '../../posts/api/input-dto/create-post-for-blog.dto';
import PostsQueryRepository from '../../posts/infra/posts.query-repository';
import PostsService from '../../posts/application/posts.service';
import { PostsQueryParamsDto } from '../../posts/api/input-dto/posts-query-params.dto';
import { BlogsQueryParamsDto } from './input-dto/blogs-query-params.dto';
import { BlogViewDto } from './view-dto/blog-view.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.usecase';
import { Types } from 'mongoose';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query-handler';
import { GetBlogsQuery } from '../application/queries/get-blogs.query-handler';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.usecase';
import { UpdateBlogDto } from './input-dto/update-blog.dto';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use.case';
import { GetPostsForBlogQuery } from '../application/queries/get-posts-for-blog.query-handler';
import { CreatePostForBlogCommand } from '../application/use-cases/create-post-for-blog.usecase';

@Controller('blogs')
class BlogsController {
  constructor(
    // удалить
    private readonly postsService: PostsService,
    private readonly postQueryRepository: PostsQueryRepository,
    // оставть
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllBlogs(@Query() query: BlogsQueryParamsDto) {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getBlogById(@Param('id') id: Types.ObjectId) {
    return this.queryBus.execute(new GetBlogByIdQuery(id, null));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() dto: CreateBlogDto): Promise<BlogViewDto> {
    try {
      const id = await this.commandBus.execute<
        CreateBlogCommand,
        Types.ObjectId
      >(new CreateBlogCommand(dto));
      return this.queryBus.execute(new GetBlogByIdQuery(id, null));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: Types.ObjectId,
    @Body() dto: UpdateBlogDto,
  ): Promise<void> {
    return this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(id, dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: Types.ObjectId) {
    return this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(id),
    );
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  getAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: PostsQueryParamsDto,
  ) {
    return this.queryBus.execute(new GetPostsForBlogQuery(blogId, query));
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostForBlogDto,
  ) {
    return this.commandBus.execute(new CreatePostForBlogCommand(blogId, dto));
  }
}

export default BlogsController;
