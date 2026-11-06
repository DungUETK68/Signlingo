import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogPracticeDto {
  @ApiProperty({ example: 'chao' })
  @IsString()
  @IsNotEmpty()
  wordSlug: string;

  @ApiProperty({ example: 'Chào' })
  @IsString()
  @IsNotEmpty()
  wordName: string;

  @ApiProperty({ example: 88 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isPassed: boolean;

  @ApiProperty({ example: [1, 2], required: false })
  @IsOptional()
  @IsArray()
  badJoints?: number[];

  @ApiProperty({ example: 'camera', required: false })
  @IsOptional()
  @IsString()
  mode?: string;

  @ApiProperty({ example: 3.2, required: false })
  @IsOptional()
  @IsNumber()
  durationSeconds?: number;
}

export class CompleteLessonDto {
  @ApiProperty({ example: 'uuid-of-lesson' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ example: 95 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}

