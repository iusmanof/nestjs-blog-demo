import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blogs.entity';
import { Post, PostSchema } from './posts/domain/posts.entity';
import BlogsController from './blogs/api/blogs.controller';
import PostsController from './posts/api/posts.controller';
import BlogsService from './blogs/application/blogs.service';
import PostsService from './posts/application/posts.service';
import BlogsRepository from './blogs/infra/blogs.repository';
import BlogsQueryRepository from './blogs/infra/blogs.query-repository';
import PostsRepository from './posts/infra/posts.repository';
import PostsQueryRepository from './posts/infra/posts.query-repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.usecase';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query-handler';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.usecase';

// Регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CreateBlogUseCase,
    UpdateBlogUseCase,
    GetBlogByIdQueryHandler,
    GetBlogsQueryHandler,
  ],
  exports: [BlogsRepository, PostsRepository],
})
export class BloggersPlatformModule {}
