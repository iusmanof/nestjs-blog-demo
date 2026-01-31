import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import PostsRepository from '../../infra/posts.repository';
import { CreatePostDto } from '../../api/input-dto/create-post.dto';
import { PostViewDto } from '../../api/view-dto/post-view.dto';
import BlogsQueryRepository from '../../../blogs/infra/blogs.query-repository';

export class CreatePostCommand {
  constructor(public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  PostViewDto
> {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute({ dto }: CreatePostCommand): Promise<PostViewDto> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(dto.blogId);
    const entity = await this.postsRepository.create(dto);
    await this.postsRepository.save(entity);
    return PostViewDto.mapToView(entity);
  }
}
