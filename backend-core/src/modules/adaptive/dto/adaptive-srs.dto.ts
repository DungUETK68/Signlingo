import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitReviewResultDto {
  @ApiProperty({ example: 'cam_on' })
  @IsString()
  @IsNotEmpty()
  wordSlug: string;

  @ApiProperty({ example: 'Cảm ơn' })
  @IsString()
  @IsNotEmpty()
  wordName: string;

  @ApiProperty({ enum: ['remembered', 'review_again'], example: 'remembered' })
  @IsString()
  @IsIn(['remembered', 'review_again'])
  choice: 'remembered' | 'review_again';

  @ApiPropertyOptional({ example: 92 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  failedAttempts?: number;
}

export class SyncSavedWordItemDto {
  @ApiProperty({ example: 'cam_on' })
  @IsString()
  @IsNotEmpty()
  wordSlug: string;

  @ApiProperty({ example: 'Cảm ơn' })
  @IsString()
  @IsNotEmpty()
  wordName: string;

  @ApiPropertyOptional({ example: '2026-11-24T08:00:00.000Z' })
  @IsOptional()
  @IsString()
  savedAt?: string;
}

export class SyncSavedWordsDto {
  @ApiProperty({ type: [SyncSavedWordItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncSavedWordItemDto)
  words: SyncSavedWordItemDto[];
}
