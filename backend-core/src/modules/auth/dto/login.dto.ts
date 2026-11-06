import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'learner@signlingo.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}

