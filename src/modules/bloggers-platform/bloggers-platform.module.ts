import { Module } from '@nestjs/common';
import BlogsController from './blogs/api/blogs.controller';
import PostsController from './posts/api/posts.controller';
import { BlogsService } from './blogs/application/blogs.service';
import PostsService from './posts/application/posts.service';

@Module({
  controllers: [BlogsController, PostsController],
  providers: [BlogsService, PostsService],
  exports: [],
})
export class BloggersPlatformModule {}
