import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreateCommunityWordDto, VoteCommunityWordDto, ReviewCommunityWordDto } from './dto/community.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Community Words (Cộng đồng)')
@Controller('api/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @ApiOperation({ summary: 'Người dùng đăng từ mới hoàn toàn lên tab Cộng đồng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCommunityWordDto, @Request() req: any) {
    return this.communityService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Lấy danh sách từ vựng cộng đồng' })
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    const currentUserId = req?.user?.id;
    return this.communityService.findAll(currentUserId, search, status);
  }

  @ApiOperation({ summary: 'Lấy danh sách từ do chính người dùng hiện tại đăng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@Request() req: any) {
    return this.communityService.findMy(req.user?.id);
  }

  @ApiOperation({ summary: 'Admin lấy danh sách từ đạt điều kiện duyệt (> 80% ủng hộ)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/eligible')
  getEligibleForAdmin(@Query('search') search?: string) {
    return this.communityService.getEligibleForAdmin(search);
  }

  @ApiOperation({ summary: 'Xem chi tiết một từ cộng đồng' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req?: any) {
    const currentUserId = req?.user?.id;
    return this.communityService.findOne(id, currentUserId);
  }

  @ApiOperation({ summary: 'Người dùng đánh giá từ: UP (Ủng hộ) hoặc DOWN (Không ủng hộ)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/vote')
  vote(
    @Param('id') id: string,
    @Body() dto: VoteCommunityWordDto,
    @Request() req: any,
  ) {
    return this.communityService.vote(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Admin duyệt từ cộng đồng và thêm vào từ điển chính thức' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() reviewDto: ReviewCommunityWordDto) {
    return this.communityService.approve(id, reviewDto);
  }

  @ApiOperation({ summary: 'Admin từ chối từ cộng đồng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() reviewDto: ReviewCommunityWordDto) {
    return this.communityService.reject(id, reviewDto);
  }

  @ApiOperation({ summary: 'Xóa từ cộng đồng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.communityService.delete(id);
  }
}
