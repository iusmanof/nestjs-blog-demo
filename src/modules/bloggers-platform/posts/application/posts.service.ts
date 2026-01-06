import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
class PostsService {
  findByPostId(postId: string) {
    return `comments with postId=${postId}`;
  }

  findAll() {
    return {
      pagesCount: 0,
      page: 0,
      pageSize: 0,
      totalCount: 0,
      items: [
        {
          id: 'string',
          title: 'string',
          shortDescription: 'string',
          content: 'string',
          blogId: 'string',
          blogName: 'string',
          createdAt: '2026-01-06T10:35:10.500Z',
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [
              {
                addedAt: '2026-01-06T10:35:10.500Z',
                userId: 'string',
                login: 'string',
              },
            ],
          },
        },
      ],
    };
  }

  create(dto: CreatePostDto) {
    dto.title = 'created';
    return true;
  }

  findById(id: string) {
    return `post with Id=${id}`;
  }

  update(id: string, dto: CreatePostDto) {
    dto.title = 'updated';
    return `update postId=${id}`;
  }

  delete(id: string) {
    return `post with Id=${id}`;
  }

  findByBlogId(blogId) {
    return `post with Id=${blogId}`;
  }
  createForBlog(blogId, dto) {
    return `post with BlogId=${blogId} ${dto}`;
  }
}

export default PostsService;
