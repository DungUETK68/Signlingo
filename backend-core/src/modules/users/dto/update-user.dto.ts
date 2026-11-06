import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false, example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false, example: 'https://api.dicebear.com/7.x/bottts/svg?seed=dung' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ required: false, example: 'beginner' })
  @IsOptional()
  @IsString()
  learningLevel?: string;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  dailyGoalMinutes?: number;

  @ApiProperty({ required: false, example: 'greeting' })
  @IsOptional()
  @IsString()
  priorityTopic?: string;
}

