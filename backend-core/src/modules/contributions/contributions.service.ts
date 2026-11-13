import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WordContribution, ContributionStatus } from './entities/word-contribution.entity';
import { CreateContributionDto, ReviewContributionDto } from './dto/contribution.dto';
import { Word } from '../dictionary/entities/word.entity';
import { Topic } from '../dictionary/entities/topic.entity';
import { Lesson } from '../dictionary/entities/lesson.entity';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(WordContribution)
    private readonly contributionRepository: Repository<WordContribution>,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .trim();
  }

  async create(dto: CreateContributionDto, user?: any): Promise<WordContribution> {
    const slug = this.generateSlug(dto.word);

    const contribution = this.contributionRepository.create({
      ...dto,
      slug,
      status: ContributionStatus.PENDING,
      userId: user?.id || null,
      contributorName: user?.fullName || 'Học viên Signlingo',
      contributorEmail: user?.email || '',
    });

    return this.contributionRepository.save(contribution);
  }

  async findMy(userId: string): Promise<WordContribution[]> {
    if (!userId) return [];
    return this.contributionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(status?: string, search?: string): Promise<WordContribution[]> {
    const query = this.contributionRepository.createQueryBuilder('cb');

    if (status && status !== 'all' && status !== 'ALL') {
      query.andWhere('cb.status = :status', { status });
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(cb.word) LIKE :term OR LOWER(cb.contributorName) LIKE :term OR LOWER(cb.contributorEmail) LIKE :term OR LOWER(cb.description) LIKE :term)',
        { term },
      );
    }

    query.orderBy('cb.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<WordContribution> {
    const item = await this.contributionRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Không tìm thấy đóng góp từ vựng có mã "${id}"`);
    }
    return item;
  }

  async update(id: string, dto: Partial<CreateContributionDto>): Promise<WordContribution> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    if (dto.word) {
      item.slug = this.generateSlug(dto.word);
    }
    return this.contributionRepository.save(item);
  }

  async approve(id: string, reviewDto?: ReviewContributionDto): Promise<{ success: boolean; contribution: WordContribution; word?: Word }> {
    const item = await this.findOne(id);

    item.status = ContributionStatus.APPROVED;
    item.adminFeedback = reviewDto?.feedback || 'Từ vựng đã được duyệt vào từ điển chung thành công!';
    const savedContribution = await this.contributionRepository.save(item);

    // Tự động chuyển từ vựng được duyệt vào bảng words (Từ điển chính thức)
    let createdWord: Word | undefined;
    try {
      const cleanSlug = item.slug || this.generateSlug(item.word);
      const existingWord = await this.wordRepository.findOne({ where: { slug: cleanSlug } });

      if (!existingWord) {
        const newWord = this.wordRepository.create({
          name: item.word,
          slug: cleanSlug,
          category: item.topicLabel || 'Từ vựng thông dụng',
          meaning: item.description || `Ký hiệu "${item.word}" do cộng đồng đóng góp.`,
          difficulty: item.difficulty || 'Dễ',
          videoUrl: item.videoFront || null,
          videoLeft: item.videoSide || null,
          videoRight: null,
          thumbnailUrl: item.thumbnail || null,
          usageTips: `Phương ngữ: ${item.dialect || 'Toàn quốc'}. ${item.handShape ? `Hình bàn tay: ${item.handShape}.` : ''}`,
          isCustom: true,
        });

        createdWord = await this.wordRepository.save(newWord);

        // Tạo bài học nếu có Chuyên đề (Topic) tương ứng
        try {
          const topic = await this.topicRepository.findOne({
            where: [
              { title: item.topicLabel },
              { slug: item.topic },
            ],
          });
          if (topic) {
            const lesson = this.lessonRepository.create({
              topicId: topic.id,
              title: item.word,
              slug: cleanSlug,
              description: item.description || `Bài học ký hiệu "${item.word}".`,
              duration: item.duration || '3 phút',
              level: item.difficulty || 'Dễ',
              videoUrl: item.videoFront || null,
            });
            await this.lessonRepository.save(lesson);
          }
        } catch (topicErr) {
          // Bỏ qua nếu không match topic
        }
      }
    } catch (err) {
      console.warn('Lỗi khi đồng bộ từ đóng góp vào bảng words:', err);
    }

    return {
      success: true,
      contribution: savedContribution,
      word: createdWord,
    };
  }

  async reject(id: string, reviewDto?: ReviewContributionDto): Promise<WordContribution> {
    const item = await this.findOne(id);
    item.status = ContributionStatus.REJECTED;
    item.adminFeedback = reviewDto?.feedback || 'Cử chỉ chưa đạt độ chuẩn xác hoặc video chưa rõ nét. Vui lòng đóng góp lại.';
    return this.contributionRepository.save(item);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const item = await this.findOne(id);
    await this.contributionRepository.remove(item);
    return { success: true, message: `Đã xóa đóng góp từ vựng "${item.word}"` };
  }
}
