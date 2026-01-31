import { IsString, Length } from 'class-validator';
import { Types } from 'mongoose';

export class UpdatePostDto {
  @IsString()
  @Length(1, 30)
  title: string;

  @IsString()
  @Length(1, 100)
  shortDescription: string;

  @IsString()
  @Length(1, 1000)
  content: string;

  @IsString()
  blogId: Types.ObjectId;
}
