import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../api/input-dto/update-blog.dto';
import BlogsRepository from '../../infra/blogs.repository';
import BlogsQueryRepository from '../../infra/blogs.query-repository';

// UpdateBlogCommand «что нужно сделать»
// UpdateBlogUseCase «кто это делает»

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogDto,
  ) {}
}

// декоратор, который регистрирует класс как обработчик команды.
@CommandHandler(UpdateBlogCommand)
// интерфейс ICommandHandler, который описывает контракт обработчика команды
export class UpdateBlogUseCase implements ICommandHandler<
  UpdateBlogCommand,
  void
> {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute({ id, dto }: UpdateBlogCommand): Promise<void> {
    const entity = await this.blogsQueryRepository.findOrNotFoundFail(id);
    entity.update(dto);
    await this.blogsRepository.save(entity);
  }
}
