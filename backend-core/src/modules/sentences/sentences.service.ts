import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sentence } from './entities/sentence.entity';

@Injectable()
export class SentencesService {
  constructor(
    @InjectRepository(Sentence)
    private readonly sentenceRepository: Repository<Sentence>,
  ) {}

  async findAllSentences(category?: string) {
    if (category && category !== 'Tất cả') {
      return this.sentenceRepository.find({
        where: { category },
        order: { orderIndex: 'ASC' },
      });
    }
    return this.sentenceRepository.find({
      order: { orderIndex: 'ASC' },
    });
  }

  async findSentenceBySlug(slug: string) {
    const sentence = await this.sentenceRepository.findOne({
      where: [{ slug }, { id: slug }],
    });
    if (!sentence) {
      throw new NotFoundException(`Không tìm thấy câu với mã "${slug}"`);
    }
    return sentence;
  }
}

