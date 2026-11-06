import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.learningLevel !== undefined) user.learningLevel = dto.learningLevel;
    if (dto.dailyGoalMinutes !== undefined) user.dailyGoalMinutes = dto.dailyGoalMinutes;
    if (dto.priorityTopic !== undefined) user.priorityTopic = dto.priorityTopic;

    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...safeUser } = saved;
    return safeUser;
  }

  async addXp(id: string, amount: number) {
    const user = await this.findById(id);
    user.xp += amount;
    return this.userRepository.save(user);
  }

  async consumeHeart(id: string) {
    const user = await this.findById(id);
    if (user.hearts > 0) {
      user.hearts -= 1;
      await this.userRepository.save(user);
    }
    return { hearts: user.hearts };
  }

  async refillHearts(id: string) {
    const user = await this.findById(id);
    user.hearts = 5;
    await this.userRepository.save(user);
    return { hearts: user.hearts };
  }
}

