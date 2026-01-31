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
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog-use.case';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.usecase';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-posts-by-id.query-handler';
import { GetPostQueryHandler } from './posts/application/queries/get-posts.query-handler';
import { UpdatePostUsecase } from './posts/application/use-cases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.usecase';
import { CreatePostForBlogUseCase } from './blogs/application/use-cases/create-post-for-blog.usecase';
import { GetPostsForBlogQueryHandler } from './blogs/application/queries/get-posts-for-blog.query-handler';
import CommentsQueryRepository from './posts/infra/comments.query-repository';
import { Comment, CommentSchema } from './posts/domain/comment.entity';

const repositories = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
];
const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUsecase,
  DeletePostUseCase,
  CreatePostForBlogUseCase,
];
const handlers = [
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetPostByIdQueryHandler,
  GetPostQueryHandler,
  GetPostsForBlogQueryHandler,
];
const services = [BlogsService, PostsService];
// Регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController],
  providers: [...repositories, ...services, ...useCases, ...handlers],
  exports: [BlogsRepository, PostsRepository],
})
export class BloggersPlatformModule {}
