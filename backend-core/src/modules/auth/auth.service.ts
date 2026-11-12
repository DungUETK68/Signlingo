import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const today = new Date().toISOString().split('T')[0];
    const user = this.userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      fullName: dto.fullName?.trim() || 'Học viên Signlingo',
      role: UserRole.LEARNER,
      learningLevel: dto.learningLevel || 'beginner',
      xp: 0,
      streak: 1,
      lastActiveDate: today,
      hearts: 5,
      gems: 100,
    });

    const savedUser = await this.userRepository.save(user);
    const token = this.generateToken(savedUser);

    const { passwordHash: _, ...userSafe } = savedUser;
    return {
      message: 'Đăng ký tài khoản thành công',
      user: userSafe,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Cập nhật streak nếu đăng nhập ngày mới
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      if (user.lastActiveDate) {
        const lastDate = new Date(user.lastActiveDate);
        const diffDays = Math.round(
          (new Date(today).getTime() - lastDate.getTime()) / (1000 * 3600 * 24),
        );
        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }
      user.lastActiveDate = today;
      await this.userRepository.save(user);
    }

    const token = this.generateToken(user);
    const { passwordHash: _, ...userSafe } = user;
    return {
      message: 'Đăng nhập thành công',
      user: userSafe,
      accessToken: token,
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }
    const { passwordHash: _, ...userSafe } = user;
    return userSafe;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}

