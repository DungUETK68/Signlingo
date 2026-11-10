import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';

@ApiTags('Users (Người dùng & Hồ sơ)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Admin lấy danh sách tất cả học viên' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAllUsers() {
    return this.usersService.findAllUsers();
  }

  @ApiOperation({ summary: 'Lấy thông tin hồ sơ của tài khoản đang đăng nhập' })
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    const fullUser = await this.usersService.findById(user.id);
    const { passwordHash: _, ...safeUser } = fullUser;
    return safeUser;
  }

  @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ (mục tiêu, trình độ, tên, avatar)' })
  @Patch('profile')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @ApiOperation({ summary: 'Nạp lại đầy trái tim (Hearts refill)' })
  @Patch('refill-hearts')
  refillHearts(@CurrentUser() user: User) {
    return this.usersService.refillHearts(user.id);
  }
}

