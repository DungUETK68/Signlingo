import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth (Xác thực)')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về JWT Access Token' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user.id);
  }
}

