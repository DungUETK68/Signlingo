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

  @ApiProperty({ example: 'Nguyễn Văn A', required: true })
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên của bạn' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  fullName: string;

  @ApiProperty({ example: 'beginner', required: false })
  @IsOptional()
  @IsString()
  learningLevel?: string;
}

