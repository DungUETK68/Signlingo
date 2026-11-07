import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWordDto {
  @ApiProperty({ example: 'Cảm ơn' })
  @IsString()
  @IsNotEmpty({ message: 'Tên từ không được để trống' })
  name: string;

  @ApiProperty({ example: 'cam_on' })
  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug: string;

  @ApiProperty({ example: 'Lời cảm ơn tri ân lịch sự' })
  @IsOptional()
  @IsString()
  meaning?: string;

  @ApiProperty({ example: 'Chào hỏi & Giao tiếp' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: '/vsl400_videos/cam_on_front.mp4' })
  @IsString()
  @IsNotEmpty({ message: 'Video URL không được để trống' })
  videoUrl: string;

  @ApiProperty({ example: '/vsl400_videos/cam_on_left.mp4', required: false })
  @IsOptional()
  @IsString()
  videoLeft?: string;

  @ApiProperty({ example: '/vsl400_videos/cam_on_right.mp4', required: false })
  @IsOptional()
  @IsString()
  videoRight?: string;

  @ApiProperty({ example: '/vsl400_videos/cam_on_thumb.jpg', required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ example: 'Dễ', required: false })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty({ example: 'Đưa bàn tay lên ngang tầm mắt và vẫy nhẹ sang 2 bên', required: false })
  @IsOptional()
  @IsString()
  usageTips?: string;

  @ApiProperty({ example: ['Chào bạn', 'Chào cô'], required: false })
  @IsOptional()
  @IsArray()
  examples?: string[];
}

