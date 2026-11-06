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
    return this.wordRepository.save(word);
  }

  async deleteWord(id: string) {
    const word = await this.wordRepository.findOne({ where: { id } });
    if (!word) {
      throw new NotFoundException('Không tìm thấy từ vựng cần xóa');
    }
    await this.wordRepository.remove(word);
    return { success: true, message: `Đã xóa từ vựng ${word.name}` };
  }
}

