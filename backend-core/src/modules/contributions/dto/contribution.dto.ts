import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContributionDto {
  @ApiProperty({ example: 'Cà phê', description: 'Tên từ vựng đóng góp' })
  @IsNotEmpty({ message: 'Tên từ vựng không được để trống' })
  @IsString()
  word: string;

  @ApiPropertyOptional({ example: 'food', description: 'Mã chủ đề' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ example: 'Ẩm thực & Thức uống', description: 'Tên hiển thị chủ đề' })
  @IsOptional()
  @IsString()
  topicLabel?: string;

  @ApiPropertyOptional({ example: 'Toàn quốc', description: 'Phương ngữ' })
  @IsOptional()
  @IsString()
  dialect?: string;

  @ApiPropertyOptional({ example: 'Hai tay cầm tách cà phê đưa lên ngửi', description: 'Hướng dẫn động tác' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Dễ', description: 'Độ khó' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ example: '3 phút', description: 'Thời lượng bài học' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: 'Hình dáng bàn tay' })
  @IsOptional()
  @IsString()
  handShape?: string;

  @ApiPropertyOptional({ description: 'Chuyển động cử chỉ' })
  @IsOptional()
  @IsString()
  movement?: string;

  @ApiPropertyOptional({ description: 'Link video hoặc đường dẫn video chính diện' })
  @IsOptional()
  @IsString()
  videoFront?: string;

  @ApiPropertyOptional({ description: 'Link video hoặc đường dẫn video góc nghiêng' })
  @IsOptional()
  @IsString()
  videoSide?: string;

  @ApiPropertyOptional({ description: 'Ảnh thumbnail đại diện' })
  @IsOptional()
  @IsString()
  thumbnail?: string;
}

export class ReviewContributionDto {
  @ApiPropertyOptional({ example: 'Cử chỉ rất chuẩn xác, đã duyệt vào từ điển chung!', description: 'Nhận xét từ quản trị viên' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
