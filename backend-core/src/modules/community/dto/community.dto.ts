import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityWordDto {
  @ApiProperty({ description: 'Tên từ vựng ký hiệu mới hoàn toàn' })
  @IsNotEmpty({ message: 'Tên từ vựng không được để trống' })
  @IsString()
  word: string;

  @ApiPropertyOptional({ description: 'Slug định danh' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Chuyên đề (mã chủ đề)' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ description: 'Tên hiển thị của chuyên đề' })
  @IsOptional()
  @IsString()
  topicLabel?: string;

  @ApiPropertyOptional({ description: 'Phương ngữ (Toàn quốc, Miền Bắc, Miền Trung, Miền Nam)' })
  @IsOptional()
  @IsString()
  dialect?: string;

  @ApiPropertyOptional({ description: 'Mô tả ý nghĩa và ngữ cảnh sử dụng' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Độ khó' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Thời lượng học ước tính' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: 'Dạng bàn tay (Handshape)' })
  @IsOptional()
  @IsString()
  handShape?: string;

  @ApiPropertyOptional({ description: 'Hướng và quỹ đạo chuyển động' })
  @IsOptional()
  @IsString()
  movement?: string;

  @ApiPropertyOptional({ description: 'URL video góc quay chính diện' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'object' && value !== null) {
      return value.videoUrl || value.previewUrl || value.url || '';
    }
    return typeof value === 'string' ? value : '';
  })
  @IsString()
  videoFront?: string;

  @ApiPropertyOptional({ description: 'URL video góc quay nghiêng' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'object' && value !== null) {
      return value.videoUrl || value.previewUrl || value.url || '';
    }
    return typeof value === 'string' ? value : '';
  })
  @IsString()
  videoSide?: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện / thumbnail' })
  @IsOptional()
  @IsString()
  thumbnail?: string;
}

export class VoteCommunityWordDto {
  @ApiProperty({ description: 'Loại đánh giá: UP (Ủng hộ) hoặc DOWN (Không ủng hộ)' })
  @IsNotEmpty({ message: 'Loại đánh giá không được để trống' })
  @IsIn(['UP', 'DOWN'], { message: 'voteType phải là UP hoặc DOWN' })
  voteType: 'UP' | 'DOWN';
}

export class ReviewCommunityWordDto {
  @ApiPropertyOptional({ description: 'Ghi chú / Phản hồi của Quản trị viên' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
