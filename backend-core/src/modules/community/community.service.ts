import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityWord, CommunityWordStatus } from './entities/community-word.entity';
import { CommunityVote, VoteType } from './entities/community-vote.entity';
import { CreateCommunityWordDto, VoteCommunityWordDto, ReviewCommunityWordDto } from './dto/community.dto';
import { Word } from '../dictionary/entities/word.entity';
import { Lesson } from '../dictionary/entities/lesson.entity';
import { Topic } from '../dictionary/entities/topic.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityWord)
    private readonly communityWordRepository: Repository<CommunityWord>,
    @InjectRepository(CommunityVote)
    private readonly communityVoteRepository: Repository<CommunityVote>,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/^-+/g, '')
      .replace(/-+$/g, '');
  }

  /**
   * Người dùng đăng một từ mới hoàn toàn lên tab Cộng đồng
   */
  async create(dto: CreateCommunityWordDto, user?: any): Promise<CommunityWord> {
    const rawWord = (dto.word || '').trim();
    if (!rawWord) {
      throw new BadRequestException('Tên từ vựng không được để trống');
    }

    const cleanSlug = dto.slug ? this.slugify(dto.slug) : this.slugify(rawWord);

    const communityWord = this.communityWordRepository.create({
      word: rawWord,
      slug: cleanSlug,
      topic: dto.topic || 'greeting',
      topicLabel: dto.topicLabel || 'Chào hỏi & Giao tiếp',
      dialect: dto.dialect || 'Toàn quốc',
      description: dto.description || '',
      difficulty: dto.difficulty || 'Dễ',
      duration: dto.duration || '3 phút',
      handShape: dto.handShape || '',
      movement: dto.movement || '',
      videoFront: dto.videoFront || null,
      videoSide: dto.videoSide || null,
      thumbnail: dto.thumbnail || null,
      status: CommunityWordStatus.VOTING,
      upvotes: 0,
      downvotes: 0,
      totalVotes: 0,
      supportRate: 0,
      userId: user?.id || null,
      authorName: user?.fullName || user?.name || 'Thành viên cộng đồng',
      authorEmail: user?.email || null,
    });

    return this.communityWordRepository.save(communityWord);
  }

  /**
   * Lấy danh sách từ cộng đồng kèm thông tin vote của người dùng hiện tại
   */
  async findAll(currentUserId?: string, search?: string, status?: string): Promise<any[]> {
    const query = this.communityWordRepository.createQueryBuilder('cw')
      .orderBy('cw.createdAt', 'DESC');

    if (status && status !== 'all') {
      query.andWhere('cw.status = :status', { status });
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(cw.word) LIKE :q OR LOWER(cw.description) LIKE :q OR LOWER(cw.topicLabel) LIKE :q OR LOWER(cw.authorName) LIKE :q)',
        { q },
      );
    }

    const words = await query.getMany();

    // Map userVote nếu có currentUserId
    if (currentUserId && words.length > 0) {
      const wordIds = words.map(w => w.id);
      const userVotes = await this.communityVoteRepository
        .createQueryBuilder('cv')
        .where('cv.userId = :currentUserId AND cv.wordId IN (:...wordIds)', { currentUserId, wordIds })
        .getMany();

      const voteMap = new Map<string, string>();
      userVotes.forEach(v => voteMap.set(v.wordId, v.voteType));

      return words.map(w => ({
        ...w,
        userVote: voteMap.get(w.id) || null,
      }));
    }

    return words.map(w => ({
      ...w,
      userVote: null,
    }));
  }

  /**
   * Lấy danh sách từ do chính người dùng hiện tại đăng
   */
  async findMy(userId: string): Promise<CommunityWord[]> {
    return this.communityWordRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Xem chi tiết một từ cộng đồng
   */
  async findOne(id: string, currentUserId?: string): Promise<any> {
    const word = await this.communityWordRepository.findOne({ where: { id } });
    if (!word) {
      throw new NotFoundException(`Không tìm thấy từ cộng đồng với id "${id}"`);
    }

    let userVote: string | null = null;
    if (currentUserId) {
      const vote = await this.communityVoteRepository.findOne({
        where: { wordId: id, userId: currentUserId },
      });
      userVote = vote ? vote.voteType : null;
    }

    return {
      ...word,
      userVote,
    };
  }

  /**
   * Người dùng đánh giá: Ủng hộ (UP) hoặc Không ủng hộ (DOWN)
   * - Nếu chưa vote -> Tạo mới
   * - Nếu bấm lại cùng loại -> Hủy vote (toggle)
   * - Nếu bấm loại khác -> Đổi vote
   * - Sau đó tự động tính lại upvotes, downvotes, totalVotes và supportRate (%)
   */
  async vote(wordId: string, dto: VoteCommunityWordDto, user: any): Promise<any> {
    const word = await this.communityWordRepository.findOne({ where: { id: wordId } });
    if (!word) {
      throw new NotFoundException('Không tìm thấy từ cộng đồng');
    }

    const userId = user.id;
    const requestedVoteType = dto.voteType === 'UP' ? VoteType.UP : VoteType.DOWN;

    const existingVote = await this.communityVoteRepository.findOne({
      where: { wordId, userId },
    });

    let currentUserVote: string | null = null;

    if (!existingVote) {
      // 1. Chưa từng vote -> Thêm mới
      const newVote = this.communityVoteRepository.create({
        wordId,
        userId,
        voteType: requestedVoteType,
      });
      await this.communityVoteRepository.save(newVote);
      currentUserVote = requestedVoteType;
    } else if (existingVote.voteType === requestedVoteType) {
      // 2. Bấm lại cùng loại -> Hủy vote (toggle)
      await this.communityVoteRepository.remove(existingVote);
      currentUserVote = null;
    } else {
      // 3. Đổi loại vote (từ UP sang DOWN hoặc ngược lại)
      existingVote.voteType = requestedVoteType;
      await this.communityVoteRepository.save(existingVote);
      currentUserVote = requestedVoteType;
    }

    // Đếm lại tổng số vote
    const upvotes = await this.communityVoteRepository.count({
      where: { wordId, voteType: VoteType.UP },
    });
    const downvotes = await this.communityVoteRepository.count({
      where: { wordId, voteType: VoteType.DOWN },
    });
    const totalVotes = upvotes + downvotes;
    const supportRate = totalVotes > 0 ? Number(((upvotes / totalVotes) * 100).toFixed(1)) : 0;

    // Cập nhật lại vào CommunityWord
    word.upvotes = upvotes;
    word.downvotes = downvotes;
    word.totalVotes = totalVotes;
    word.supportRate = supportRate;
    await this.communityWordRepository.save(word);

    return {
      success: true,
      wordId,
      upvotes,
      downvotes,
      totalVotes,
      supportRate,
      userVote: currentUserVote,
    };
  }

  /**
   * DÀNH CHO QUẢN TRỊ VIÊN:
   * Lấy danh sách các từ có tỉ lệ ủng hộ > 80% trên tổng đánh giá (điều kiện hiển thị ở phần Duyệt từ)
   */
  async getEligibleForAdmin(search?: string): Promise<CommunityWord[]> {
    const query = this.communityWordRepository.createQueryBuilder('cw')
      .where('cw.status = :status', { status: CommunityWordStatus.VOTING })
      .andWhere('cw.supportRate >= 80')
      .andWhere('cw.totalVotes >= 1') // Cần ít nhất 1 lượt đánh giá
      .orderBy('cw.supportRate', 'DESC')
      .addOrderBy('cw.totalVotes', 'DESC')
      .addOrderBy('cw.createdAt', 'DESC');

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(cw.word) LIKE :q OR LOWER(cw.description) LIKE :q OR LOWER(cw.authorName) LIKE :q)',
        { q },
      );
    }

    return query.getMany();
  }

  /**
   * Quản trị viên duyệt từ cộng đồng:
   * - Cập nhật trạng thái thành APPROVED
   * - Tự động đưa từ vào Từ điển chính thức (bảng Word) và Bài học (bảng Lesson)
   */
  async approve(id: string, reviewDto?: ReviewCommunityWordDto): Promise<any> {
    const item = await this.communityWordRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Không tìm thấy từ cộng đồng');
    }

    item.status = CommunityWordStatus.APPROVED;
    item.adminFeedback = reviewDto?.feedback || 'Cộng đồng ủng hộ trên 80% và đã được Quản trị viên phê duyệt chính thức.';
    const savedWord = await this.communityWordRepository.save(item);

    let createdWord = null;
    try {
      const cleanSlug = item.slug || this.slugify(item.word);
      const existingWord = await this.wordRepository.findOne({ where: { slug: cleanSlug } });

      if (!existingWord) {
        const newWord = this.wordRepository.create({
          name: item.word,
          slug: cleanSlug,
          category: item.topicLabel || 'Cộng đồng đóng góp',
          meaning: item.description || `Ký hiệu "${item.word}" do cộng đồng sáng tạo và đạt hơn 80% ủng hộ.`,
          difficulty: item.difficulty || 'Dễ',
          videoUrl: item.videoFront || null,
          videoLeft: item.videoSide || null,
          videoRight: null,
          thumbnailUrl: item.thumbnail || null,
          usageTips: `Phương ngữ: ${item.dialect || 'Toàn quốc'}. ${item.handShape ? `Hình bàn tay: ${item.handShape}.` : ''}`,
          isCustom: true,
        });

        createdWord = await this.wordRepository.save(newWord);

        // Tạo bài học nếu có Chuyên đề (Topic)
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
      console.warn('Lỗi khi đồng bộ từ cộng đồng vào bảng words:', err);
    }

    return {
      success: true,
      communityWord: savedWord,
      officialWord: createdWord,
    };
  }

  /**
   * Quản trị viên từ chối từ cộng đồng
   */
  async reject(id: string, reviewDto?: ReviewCommunityWordDto): Promise<CommunityWord> {
    const item = await this.communityWordRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Không tìm thấy từ cộng đồng');
    }

    item.status = CommunityWordStatus.REJECTED;
    item.adminFeedback = reviewDto?.feedback || 'Cử chỉ chưa phù hợp với chuẩn quy ước hoặc video chưa rõ nét.';
    return this.communityWordRepository.save(item);
  }

  /**
   * Xóa từ cộng đồng
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const item = await this.communityWordRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Không tìm thấy từ cộng đồng');
    }
    await this.communityVoteRepository.delete({ wordId: id });
    await this.communityWordRepository.remove(item);
    return { success: true, message: `Đã xóa từ cộng đồng "${item.word}"` };
  }
}
