import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Word } from './entities/word.entity';
import { Topic } from './entities/topic.entity';
import { Lesson } from './entities/lesson.entity';
import { CreateWordDto } from './dto/create-word.dto';

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async findAllWords(search?: string, category?: string) {
    const query = this.wordRepository.createQueryBuilder('word');

    if (search) {
      query.andWhere(
        '(LOWER(word.name) LIKE LOWER(:search) OR LOWER(word.slug) LIKE LOWER(:search) OR LOWER(word.meaning) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    if (category && category !== 'Tất cả') {
      query.andWhere('word.category = :category', { category });
    }

    query.orderBy('word.name', 'ASC');
    return query.getMany();
  }

  async findWordBySlug(slug: string) {
    const cleanSlug = slug.toLowerCase().replace(/-/g, '_').trim();
    const word = await this.wordRepository.findOne({
      where: [{ slug: cleanSlug }, { slug }],
    });
    if (!word) {
      throw new NotFoundException(`Không tìm thấy từ vựng với slug "${slug}"`);
    }
    return word;
  }

  async findAllTopicsWithLessons() {
    return this.topicRepository.find({
      relations: ['lessons'],
      order: {
        orderIndex: 'ASC',
        lessons: {
          orderIndex: 'ASC',
        },
      },
    });
  }

  async createWord(dto: CreateWordDto) {
    const cleanSlug = dto.slug.toLowerCase().replace(/-/g, '_').trim();
    const existing = await this.wordRepository.findOne({ where: { slug: cleanSlug } });
    if (existing) {
      throw new ConflictException(`Từ với slug "${cleanSlug}" đã tồn tại`);
    }

    const word = this.wordRepository.create({
      ...dto,
      slug: cleanSlug,
      isCustom: true,
    });
    const savedWord = await this.wordRepository.save(word);

    // Tự động tạo bài học tương ứng vào Chuyên đề (Topic) nếu có
    try {
      const topic = await this.topicRepository.findOne({
        where: [
          { title: dto.category },
          { slug: dto.category },
        ],
      });
      if (topic) {
        const lesson = this.lessonRepository.create({
          topicId: topic.id,
          title: dto.name,
          slug: cleanSlug,
          description: dto.meaning || `Ký hiệu "${dto.name}" chuẩn VSL.`,
          duration: '3 phút',
          level: dto.difficulty || 'Dễ',
          videoUrl: dto.videoUrl || null,
        });
        await this.lessonRepository.save(lesson);
      }
    } catch (e) {
      // Bỏ qua lỗi lesson nếu không tìm thấy topic phù hợp
    }

    return savedWord;
  }

  async deleteWord(id: string) {
    const word = await this.wordRepository.findOne({
      where: [{ id }, { slug: id }],
    });
    if (!word) {
      throw new NotFoundException('Không tìm thấy từ vựng cần xóa');
    }
    const slug = word.slug;
    await this.wordRepository.remove(word);

    // Cũng xóa bài học tương ứng trong bảng lessons nếu có
    await this.lessonRepository.delete({ slug }).catch(() => {});

    return { success: true, message: `Đã xóa từ vựng ${word.name}` };
  }
}

