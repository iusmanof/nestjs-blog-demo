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
import { CreateBlogDto } from './input-dto/create-blog.dto';
import { CreatePostForBlogDto } from '../../posts/api/input-dto/create-post-for-blog.dto';
import { PostsQueryParamsDto } from '../../posts/api/input-dto/posts-query-params.dto';
import { BlogsQueryParamsDto } from './input-dto/blogs-query-params.dto';
import { BlogViewDto } from './view-dto/blog-view.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.usecase';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query-handler';
import { GetBlogsQuery } from '../application/queries/get-blogs.query-handler';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.usecase';
import { UpdateBlogDto } from './input-dto/update-blog.dto';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use.case';
import { GetPostsForBlogQuery } from '../application/queries/get-posts-for-blog.query-handler';
import { CreatePostForBlogCommand } from '../application/use-cases/create-post-for-blog.usecase';
import { BasicAuthGuard } from '../../../../core/guards/basic/basic-auth.guard';
import { OptionalJwtAuthGuard } from '../../../../core/guards/optional-jwt-auth.guard';
import type { AuthenticatedRequest } from '../../../../core/types/authenticated-request.interface';

@Controller('blogs')
class BlogsController {
  constructor(
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
  getBlogById(@Param('id') id: string) {
    return this.queryBus.execute(new GetBlogByIdQuery(id, null));
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() dto: CreateBlogDto): Promise<BlogViewDto> {
    const id = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(dto),
    );
    return this.queryBus.execute(new GetBlogByIdQuery(id, null));
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
  ): Promise<void> {
    return this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(id, dto),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    return this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(id),
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  getAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: PostsQueryParamsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    return this.queryBus.execute(
      new GetPostsForBlogQuery(blogId, query, userId),
    );
  }

  @UseGuards(BasicAuthGuard)
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
