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
import { UpdateLikeStatusUseCase } from './posts/application/use-cases/update-like-status.usecase';
import { CreateCommentForPostUseCase } from './posts/application/use-cases/create-comment-for-post.usecase';
import { GetCommentsByPostIdQueryHandler } from './posts/application/queries/get-comments-by-post-id.query-handler';
import CommentsRepository from './posts/infra/comment.repository';
import { UpdateCommentLikeStatusUseCase } from './posts/application/use-cases/update-comment-like-status.usecase';
import { UpdateCommentUseCase } from './posts/application/use-cases/update-comment.usecase';
import { GetCommentByIdQueryHandler } from './posts/application/queries/get-comment-by-id.query-handler';
import CommentsController from './posts/api/comments.controller';
import { DeleteCommentUseCase } from './posts/application/use-cases/delete-comment.usecase';

const repositories = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
  CommentsRepository,
];
const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUsecase,
  DeletePostUseCase,
  CreatePostForBlogUseCase,
  UpdateLikeStatusUseCase,
  CreateCommentForPostUseCase,
  UpdateCommentLikeStatusUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];
const handlers = [
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetPostByIdQueryHandler,
  GetPostQueryHandler,
  GetPostsForBlogQueryHandler,
  GetCommentsByPostIdQueryHandler,
  GetCommentByIdQueryHandler,
];
const services = [BlogsService, PostsService];
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [...repositories, ...services, ...useCases, ...handlers],
  exports: [BlogsRepository, PostsRepository, CommentsRepository],
})
export class BloggersPlatformModule {}
