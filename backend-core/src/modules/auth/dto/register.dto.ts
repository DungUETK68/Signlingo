import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'learner@signlingo.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'beginner', required: false })
  @IsOptional()
  @IsString()
  learningLevel?: string;
}

