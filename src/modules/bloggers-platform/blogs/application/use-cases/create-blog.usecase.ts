import { CreateBlogDto } from '../../api/input-dto/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import BlogsRepository from '../../infra/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import * as blogsEntity from '../../domain/blogs.entity';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  Types.ObjectId
> {
  constructor(
    @InjectModel(blogsEntity.Blog.name)
    private readonly blogModel: blogsEntity.BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<Types.ObjectId> {
    const entity = this.blogModel.createInstance(dto);
    await this.blogsRepository.save(entity);
    return entity._id;
  }
}
