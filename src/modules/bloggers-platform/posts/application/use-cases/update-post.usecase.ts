import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../api/input-dto/update-post.dto';
import PostsRepository from '../../infra/posts.repository';
import BlogsQueryRepository from '../../../blogs/infra/blogs.query-repository';
import { DomainException } from '../../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/filters/domain-exception-codes';

export class UpdatePostCommand {
  constructor(
    public id: string,
    public dto: UpdatePostDto,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUsecase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async execute(command: UpdatePostCommand): Promise<void> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(
      command.dto.blogId,
    );

    const updated = await this.postsRepository.update(
      command.id,
      command.dto,
      blog.name,
    );

    if (!updated) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
  }
}
