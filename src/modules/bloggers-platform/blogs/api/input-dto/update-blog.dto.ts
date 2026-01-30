import { IsString, Length, Matches } from 'class-validator';

export class UpdateBlogDto {
  @IsString()
  @Length(1, 15)
  name: string;

  @IsString()
  @Length(1, 500)
  description: string;

  @IsString()
  @Length(1, 100)
  @Matches(/^https:\/\/.+/, {
    message: 'websiteUrl must be a valid URL',
  })
  websiteUrl: string;
}
