import { Injectable } from '@nestjs/common';
import BlogsRepository from '../modules/bloggers-platform/blogs/infra/blogs.repository';
import PostsRepository from '../modules/bloggers-platform/posts/infra/posts.repository';
import UsersRepository from '../modules/user-accounts/infra/users.repository';
import { SessionRepository } from '../modules/user-accounts/infra/session.repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async clearAll(): Promise<void> {
    await Promise.all([
      this.blogsRepository.deleteAll(),
      this.postsRepository.deleteAll(),
      this.usersRepository.deleteAll(),
      this.sessionRepository.deleteAll(),
    ]);
  }
}
