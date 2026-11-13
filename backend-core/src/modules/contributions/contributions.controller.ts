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
import { ContributionsService } from './contributions.service';
import { CreateContributionDto, ReviewContributionDto } from './dto/contribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Word Contributions (Đóng góp từ vựng)')
@Controller('api/contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @ApiOperation({ summary: 'Người học gửi đóng góp từ vựng mới' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateContributionDto, @Request() req: any) {
    return this.contributionsService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Lấy danh sách từ vựng do chính người học hiện tại đóng góp' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@Request() req: any) {
    return this.contributionsService.findMy(req.user?.id);
  }

  @ApiOperation({ summary: 'Admin lấy toàn bộ danh sách đóng góp từ cộng đồng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.contributionsService.findAll(status, search);
  }

  @ApiOperation({ summary: 'Xem chi tiết một bản đóng góp' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contributionsService.findOne(id);
  }

  @ApiOperation({ summary: 'Admin hoặc người gửi cập nhật thông tin đóng góp' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateContributionDto>) {
    return this.contributionsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Admin duyệt từ đóng góp (thêm vào từ điển chính thức)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ReviewContributionDto) {
    return this.contributionsService.approve(id, dto);
  }

  @ApiOperation({ summary: 'Admin từ chối đóng góp từ vựng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: ReviewContributionDto) {
    return this.contributionsService.reject(id, dto);
  }

  @ApiOperation({ summary: 'Admin xóa bản đóng góp' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.contributionsService.delete(id);
  }
}
