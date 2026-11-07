import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { User, UserRole } from '../users/entities/user.entity';
import { Topic } from '../dictionary/entities/topic.entity';
import { Lesson } from '../dictionary/entities/lesson.entity';
import { Word } from '../dictionary/entities/word.entity';
import { Sentence } from '../sentences/entities/sentence.entity';
import { PracticeLog } from '../progress/entities/practice-log.entity';
import { UserProgress } from '../progress/entities/user-progress.entity';
import { ReviewItem } from '../adaptive/entities/review-item.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(Sentence)
    private readonly sentenceRepository: Repository<Sentence>,
    @InjectRepository(PracticeLog)
    private readonly practiceLogRepository: Repository<PracticeLog>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
    @InjectRepository(ReviewItem)
    private readonly reviewItemRepository: Repository<ReviewItem>,
  ) {}

  async onApplicationBootstrap() {
    await this.wordRepository.delete({ slug: 'chao' }).catch(() => {});
    await this.lessonRepository.delete({ slug: 'chao-gap-go' }).catch(() => {});
    await this.practiceLogRepository.delete({ wordSlug: 'chao' }).catch(() => {});
    await this.reviewItemRepository.delete({ wordSlug: 'chao' }).catch(() => {});
    await this.seedUsers();
    await this.seedTopicsAndLessons();
    await this.seedWords();
    await this.seedSentences();
    await this.seedDemoActivity();
  }

  private async seedUsers() {
    const adminCount = await this.userRepository.count({ where: { email: 'admin@signlingo.com' } });
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('123456', salt);
      const admin = this.userRepository.create({
        email: 'admin@signlingo.com',
        passwordHash: adminPass,
        fullName: 'Quản trị viên Signlingo',
        role: UserRole.ADMIN,
        xp: 1500,
        streak: 12,
        hearts: 5,
        gems: 500,
      });
      await this.userRepository.save(admin);
      this.logger.log('Đã tạo tài khoản Admin mặc định: admin@signlingo.com / 123456');
    }

    const demoUsers = [
      {
        email: 'learner@signlingo.com',
        fullName: 'Nguyễn Văn Học',
        role: UserRole.LEARNER,
        xp: 1240,
        streak: 7,
        hearts: 5,
        gems: 250,
        learningLevel: 'beginner',
        dailyGoalMinutes: 15,
        priorityTopic: 'greeting',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      },
      {
        email: 'baongoc@signlingo.com',
        fullName: 'Trần Bảo Ngọc',
        role: UserRole.LEARNER,
        xp: 3450,
        streak: 21,
        hearts: 5,
        gems: 820,
        learningLevel: 'intermediate',
        dailyGoalMinutes: 30,
        priorityTopic: 'daily',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      },
      {
        email: 'hoanglong@signlingo.com',
        fullName: 'Lê Hoàng Long',
        role: UserRole.LEARNER,
        xp: 2980,
        streak: 14,
        hearts: 4,
        gems: 640,
        learningLevel: 'intermediate',
        dailyGoalMinutes: 20,
        priorityTopic: 'family',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      },
      {
        email: 'thuthao@signlingo.com',
        fullName: 'Phạm Thu Thảo',
        role: UserRole.LEARNER,
        xp: 2650,
        streak: 12,
        hearts: 5,
        gems: 510,
        learningLevel: 'elementary',
        dailyGoalMinutes: 15,
        priorityTopic: 'food',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      {
        email: 'tuankiet@signlingo.com',
        fullName: 'Đặng Tuấn Kiệt',
        role: UserRole.LEARNER,
        xp: 1120,
        streak: 5,
        hearts: 3,
        gems: 180,
        learningLevel: 'beginner',
        dailyGoalMinutes: 15,
        priorityTopic: 'greeting',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      },
    ];

    const salt = await bcrypt.genSalt(10);
    const defaultPass = await bcrypt.hash('123456', salt);

    for (const u of demoUsers) {
      const exists = await this.userRepository.findOne({ where: { email: u.email } });
      if (!exists) {
        const user = this.userRepository.create({
          ...u,
          passwordHash: defaultPass,
        });
        await this.userRepository.save(user);
        this.logger.log(`Đã tạo tài khoản mẫu: ${u.email} (${u.fullName})`);
      }
    }
  }

  private async seedTopicsAndLessons() {
    const topicCount = await this.topicRepository.count();
    if (topicCount >= 12) return;

    this.logger.log('Đang khởi tạo danh mục 12 Chuyên đề chuẩn VSL400 và bài học...');
    await this.lessonRepository.delete({});
    await this.topicRepository.delete({});

    const TOPIC_DEFS = [
      { slug: 'greeting', title: 'Giao tiếp & Xã giao cốt lõi', subtitle: 'Ký hiệu cơ bản kết nối xã hội', description: 'Cảm ơn, Tạm biệt, Xin lỗi, Giúp đỡ, Khỏe và các giao tiếp xã giao lịch sự chuẩn VSL400', icon: '👋', orderIndex: 1, grammarTitle: 'Quy tắc 8: Biểu cảm nét mặt & Không gian giao tiếp', grammarTip: 'Trong VSL, nét mặt và ánh mắt đóng vai trò như ngữ điệu giọng nói; biểu cảm chân thành khi chào hỏi, xin lỗi, cảm ơn.' },
      { slug: 'family', title: 'Gia đình & Xưng hô thân thuộc', subtitle: 'Tình thân và cách gọi người thân', description: 'Bố, Mẹ, Ông bà nội ngoại, Anh chị em, Con cháu và các mối quan hệ xưng hô trong gia đình', icon: '👨‍👩‍👧‍👦', orderIndex: 2, grammarTitle: 'Quy tắc 7: Không gian ký hiệu & Điểm quy chiếu xưng hô', grammarTip: 'Định vị người lớn tuổi ở vị trí cao hơn và phía trước; phân biệt nhánh nội và ngoại bằng vị trí bên trái/phải.' },
      { slug: 'food', title: 'Ẩm thực & Thức uống hàng ngày', subtitle: 'Món ăn, đồ uống quen thuộc', description: 'Ăn, Uống, Cơm, Phở, Bún, Bánh bao, Bánh mì, Thịt, Trà, Cà phê, Sữa và các món ăn quen thuộc', icon: '🍲', orderIndex: 3, grammarTitle: 'Quy tắc 1: Cấu trúc Chủ đề – Lời dẫn & Trật tự SOV', grammarTip: 'Nguyên lý cốt lõi: Luôn đưa món ăn/đồ uống lên trước động từ Ăn/Uống: [Chủ ngữ] + [Món ăn] + [Ăn/Uống].' },
      { slug: 'daily', title: 'Sinh hoạt & Đồ dùng cá nhân', subtitle: 'Trang phục, thiết bị và sinh hoạt', description: 'Trang phục, đồ dùng gia đình, thiết bị cá nhân: Áo, Quần, Bàn, Ghế, Cửa, Đồng hồ, Điện thoại, Tiền', icon: '🏠', orderIndex: 4, grammarTitle: 'Quy tắc 3: Từ ghép trong VSL', grammarTip: 'Rất nhiều từ ghép đồ dùng được tạo bằng cách lắp ghép đơn thuần các ký hiệu đơn lẻ (Cái + Bàn, Áo + Sơ mi).' },
      { slug: 'actions', title: 'Hành động & Hoạt động tương tác', subtitle: 'Cử chỉ hành động đời sống', description: 'Đi, Về, Chạy, Mở, Đóng, Cho, Lấy, Tìm, Thấy, Dừng lại và các động từ giao tiếp đời sống', icon: '⚡', orderIndex: 5, grammarTitle: 'Quy tắc 5: Câu phủ định trong VSL', grammarTip: 'Từ phủ định (Không, Chưa, Không cần) đứng sau động từ hoặc ở cuối câu kết hợp động tác lắc đầu dứt khoát.' },
      { slug: 'time', title: 'Thời gian & Lịch sinh hoạt', subtitle: 'Khung thời gian và thì trong VSL', description: 'Hôm nay, Ngày mai, Hôm qua, Sáng, Trưa, Tối, Bây giờ, Giờ, Phút, Ngày, Tuần, Tháng, Năm', icon: '⏰', orderIndex: 6, grammarTitle: 'Quy tắc 6: Thời gian & Thì trong VSL', grammarTip: 'VSL không chia động từ; luôn đặt từ chỉ thời gian ở đầu câu để xác lập khung thời gian tham chiếu cho toàn câu.' },
      { slug: 'education', title: 'Giáo dục, Trường học & Nghề nghiệp', subtitle: 'Học tập và môi trường công sở', description: 'Học, Trường học, Báo cáo, Sách, Vở, Thầy giáo, Cô giáo, Bút bi và các dụng cụ học tập', icon: '🎓', orderIndex: 7, grammarTitle: 'Quy tắc 4: Cấu trúc Câu hỏi & Ngữ điệu cơ thể (NMMs)', grammarTip: 'Từ để hỏi thường được đặt ở cuối câu; kết hợp nhướn mày hoặc hơi nghiêng đầu đối với câu hỏi Có/Không.' },
      { slug: 'health', title: 'Y tế, Sức khỏe & Thể trạng', subtitle: 'Chăm sóc sức khỏe và khám chữa bệnh', description: 'Bác sĩ, Bệnh viện, Y tá, Khám bệnh, Đau, Thuốc, Khỏe mạnh, Sốt, Cấp cứu', icon: '🏥', orderIndex: 8, grammarTitle: null, grammarTip: null },
      { slug: 'travel', title: 'Địa điểm, Giao thông & Di chuyển', subtitle: 'Phương tiện và nơi chốn công cộng', description: 'Chợ, Công viên, Máy bay, Ô tô, Xe máy, Đường, Cầu, Ga tàu', icon: '✈️', orderIndex: 9, grammarTitle: null, grammarTip: null },
      { slug: 'sports', title: 'Thể thao, Vận động & Giải trí', subtitle: 'Rèn luyện thân thể và vui chơi', description: 'Bóng đá, Bơi lội, Bóng bàn, Cầu lông, Điền kinh, Chạy bộ', icon: '⚽', orderIndex: 10, grammarTitle: null, grammarTip: null },
      { slug: 'nature', title: 'Thiên nhiên, Thời tiết & Động vật', subtitle: 'Môi trường sống và sinh vật', description: 'Trời, Mưa, Nắng, Gió, Cây, Hoa, Con chó, Con mèo', icon: '🌿', orderIndex: 11, grammarTitle: null, grammarTip: null },
      { slug: 'emotions', title: 'Cảm xúc, Tính chất & Miêu tả', subtitle: 'Tâm trạng, sắc thái và tính từ', description: 'Vui, Buồn, Yêu thương, Chăm chỉ, Đẹp, Xấu, Nhanh, Chậm', icon: '💖', orderIndex: 12, grammarTitle: 'Quy tắc 8: Biểu cảm nét mặt thể hiện mức độ tính từ', grammarTip: 'Nét mặt biểu đạt sắc thái và cường độ của tính từ: mở to mắt khi ngạc nhiên, mỉm cười khi hạnh phúc, nhíu mày khi giận.' }
    ];

    const CATEGORY_MAP: Record<string, string> = {
      'Chào hỏi & Giao tiếp': 'greeting',
      'Gia đình & Xưng hô': 'family',
      'Ẩm thực & Thức uống': 'food',
      'Đời sống & Đồ dùng': 'daily',
      'Đời sống hàng ngày': 'daily',
      'Hành động & Hoạt động': 'actions',
      'Thời gian & Lịch': 'time',
      'Giáo dục & Nghề nghiệp': 'education',
      'Y tế & Sức khỏe': 'health',
      'Địa điểm & Giao thông': 'travel',
      'Thể thao & Giải trí': 'sports',
      'Thiên nhiên & Động vật': 'nature',
      'Cảm xúc & Tính chất': 'emotions'
    };

    const possiblePaths = [
      path.join(__dirname, 'vsl400-seed.json'),
      path.join(process.cwd(), 'src', 'modules', 'seed', 'vsl400-seed.json'),
      path.join(process.cwd(), 'dist', 'modules', 'seed', 'vsl400-seed.json'),
      path.join(process.cwd(), 'backend-core', 'src', 'modules', 'seed', 'vsl400-seed.json'),
    ];

    let seedWords: any[] = [];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        seedWords = JSON.parse(fs.readFileSync(p, 'utf8'));
        break;
      }
    }

    for (const tDef of TOPIC_DEFS) {
      const topic = this.topicRepository.create({
        slug: tDef.slug,
        title: tDef.title,
        subtitle: tDef.subtitle,
        description: tDef.description,
        icon: tDef.icon,
        orderIndex: tDef.orderIndex,
      });
      const savedTopic = await this.topicRepository.save(topic);

      let order = 1;
      if (tDef.grammarTitle) {
        const grammarLesson = this.lessonRepository.create({
          topicId: savedTopic.id,
          title: `Bài học Ngữ pháp: ${tDef.grammarTitle}`,
          slug: `ngu-phap-${tDef.slug}`,
          description: tDef.grammarTip || 'Nắm vững quy tắc ngữ pháp VSL chuẩn.',
          duration: '5 phút',
          level: 'Lý thuyết',
          orderIndex: order++,
          videoUrl: null,
        });
        await this.lessonRepository.save(grammarLesson);
      }

      const wordsInTopic = seedWords.filter(w => CATEGORY_MAP[w.category] === tDef.slug);
      for (const w of wordsInTopic) {
        const lesson = this.lessonRepository.create({
          topicId: savedTopic.id,
          title: w.name,
          slug: w.slug,
          description: w.meaning || `Ký hiệu "${w.name}" chuẩn VSL.`,
          duration: '3 phút',
          level: w.difficulty || 'Dễ',
          orderIndex: order++,
          videoUrl: w.videoUrl,
        });
        await this.lessonRepository.save(lesson);
      }
    }
    this.logger.log('Đã khởi tạo thành công 12 Chuyên đề chuẩn VSL400 với 400 từ vựng và bài học ngữ pháp.');
  }

  private async seedWords() {
    const wordCount = await this.wordRepository.count();
    if (wordCount >= 400) return;

    // Ưu tiên nạp từ danh mục đầy đủ vsl400-seed.json nếu có
    const possiblePaths = [
      path.join(__dirname, 'vsl400-seed.json'),
      path.join(process.cwd(), 'src', 'modules', 'seed', 'vsl400-seed.json'),
      path.join(process.cwd(), 'dist', 'modules', 'seed', 'vsl400-seed.json'),
      path.join(process.cwd(), 'backend-core', 'src', 'modules', 'seed', 'vsl400-seed.json'),
    ];
    let seedJsonPath = possiblePaths.find(p => fs.existsSync(p));
    let wordsToSeed: any[] = [];
    if (seedJsonPath && fs.existsSync(seedJsonPath)) {
      try {
        const raw = fs.readFileSync(seedJsonPath, 'utf-8');
        wordsToSeed = JSON.parse(raw);
      } catch (e) {
        this.logger.error('Lỗi đọc vsl400-seed.json:', e);
      }
    }

    if (wordsToSeed.length > 0) {
      this.logger.log(`Nạp ${wordsToSeed.length} từ vựng VSL400 từ vsl400-seed.json vào CSDL...`);
      for (const w of wordsToSeed) {
        const existing = await this.wordRepository.findOne({ where: { slug: w.slug } });
        if (!existing) {
          const word = this.wordRepository.create(w);
          await this.wordRepository.save(word);
        } else {
          if (w.videoLeft && !existing.videoLeft) {
            existing.videoLeft = w.videoLeft;
            existing.videoRight = w.videoRight;
            await this.wordRepository.save(existing);
          }
        }
      }
      this.logger.log(`Hoàn tất nạp ${wordsToSeed.length} từ vựng VSL400 vào CSDL.`);
      return;
    }

    const baseWords = [
      { name: 'Cảm ơn', slug: 'cam_on', category: 'Chào hỏi & Giao tiếp', difficulty: 'Dễ', meaning: 'Bày tỏ lòng biết ơn', videoUrl: '/vsl400_videos/cam_on_front.mp4', videoLeft: '/vsl400_videos/cam_on_left.mp4', videoRight: '/vsl400_videos/cam_on_right.mp4', thumbnailUrl: '/vsl400_videos/cam_on_thumb.jpg', usageTips: 'Đầu ngón tay đặt nhẹ cằm rồi đưa thẳng về phía trước.' },
      { name: 'Xin lỗi', slug: 'xin_loi', category: 'Chào hỏi & Giao tiếp', difficulty: 'Trung bình', meaning: 'Thể hiện sự hối lỗi', videoUrl: '/vsl400_videos/xin_loi_front.mp4', videoLeft: '/vsl400_videos/xin_loi_left.mp4', videoRight: '/vsl400_videos/xin_loi_right.mp4', thumbnailUrl: '/vsl400_videos/xin_loi_thumb.jpg', usageTips: 'Nắm bàn tay đặt trên ngực trái xoay tròn nhẹ nhàng.' },
      { name: 'Giúp đỡ', slug: 'giup_do', category: 'Chào hỏi & Giao tiếp', difficulty: 'Trung bình', meaning: 'Tương trợ hỗ trợ người khác', videoUrl: '/vsl400_videos/giup_do_front.mp4', videoLeft: '/vsl400_videos/giup_do_left.mp4', videoRight: '/vsl400_videos/giup_do_right.mp4', thumbnailUrl: '/vsl400_videos/giup_do_thumb.jpg' },
      { name: 'Khỏe', slug: 'khoe', category: 'Chào hỏi & Giao tiếp', difficulty: 'Dễ', meaning: 'Sức khỏe tốt, dẻo dai', videoUrl: '/vsl400_videos/khoe_front.mp4', videoLeft: '/vsl400_videos/khoe_left.mp4', videoRight: '/vsl400_videos/khoe_right.mp4', thumbnailUrl: '/vsl400_videos/khoe_thumb.jpg' },
      { name: 'Ăn', slug: 'an', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Hành động ăn uống thức ăn', videoUrl: '/vsl400_videos/an_front.mp4', videoLeft: '/vsl400_videos/an_left.mp4', videoRight: '/vsl400_videos/an_right.mp4', thumbnailUrl: '/vsl400_videos/an_thumb.jpg', usageTips: 'Các đầu ngón tay chụm lại đưa hướng vào miệng 2 lần.' },
      { name: 'Uống', slug: 'uong', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Hành động uống chất lỏng', videoUrl: '/vsl400_videos/uong_front.mp4', videoLeft: '/vsl400_videos/uong_left.mp4', videoRight: '/vsl400_videos/uong_right.mp4', thumbnailUrl: '/vsl400_videos/uong_thumb.jpg' },
      { name: 'Phở', slug: 'pho', category: 'Ẩm thực & Đồ uống', difficulty: 'Trung bình', meaning: 'Món ăn truyền thống Việt Nam', videoUrl: '/vsl400_videos/pho_front.mp4', videoLeft: '/vsl400_videos/pho_left.mp4', videoRight: '/vsl400_videos/pho_right.mp4', thumbnailUrl: '/vsl400_videos/pho_thumb.jpg' },
      { name: 'Bún', slug: 'bun', category: 'Ẩm thực & Đồ uống', difficulty: 'Trung bình', meaning: 'Sợi bún tươi ẩm thực', videoUrl: '/vsl400_videos/bun_front.mp4', videoLeft: '/vsl400_videos/bun_left.mp4', videoRight: '/vsl400_videos/bun_right.mp4', thumbnailUrl: '/vsl400_videos/bun_thumb.jpg' },
      { name: 'Bánh bao', slug: 'banh_bao', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Bánh bao nhân thịt hấp', videoUrl: '/vsl400_videos/banh_bao_front.mp4', videoLeft: '/vsl400_videos/banh_bao_left.mp4', videoRight: '/vsl400_videos/banh_bao_right.mp4', thumbnailUrl: '/vsl400_videos/banh_bao_thumb.jpg' },
      { name: 'Thịt', slug: 'thit', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Thực phẩm đạm thịt', videoUrl: '/vsl400_videos/thit_front.mp4', videoLeft: '/vsl400_videos/thit_left.mp4', videoRight: '/vsl400_videos/thit_right.mp4', thumbnailUrl: '/vsl400_videos/thit_thumb.jpg' },
      { name: 'Nước', slug: 'nuoc', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Nước lọc thanh khiết', videoUrl: '/vsl400_videos/nuoc_front.mp4', videoLeft: '/vsl400_videos/nuoc_left.mp4', videoRight: '/vsl400_videos/nuoc_right.mp4', thumbnailUrl: '/vsl400_videos/nuoc_thumb.jpg' },
      { name: 'Sữa', slug: 'sua', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Đồ uống bổ dưỡng sữa', videoUrl: '/vsl400_videos/sua_front.mp4', videoLeft: '/vsl400_videos/sua_left.mp4', videoRight: '/vsl400_videos/sua_right.mp4', thumbnailUrl: '/vsl400_videos/sua_thumb.jpg' },
      { name: 'Trà', slug: 'tra', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Thức uống lá chè', videoUrl: '/vsl400_videos/tra_front.mp4', videoLeft: '/vsl400_videos/tra_left.mp4', videoRight: '/vsl400_videos/tra_right.mp4', thumbnailUrl: '/vsl400_videos/tra_thumb.jpg' },
      { name: 'Bố', slug: 'bo', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người cha trong gia đình', videoUrl: '/vsl400_videos/bo_front.mp4', videoLeft: '/vsl400_videos/bo_left.mp4', videoRight: '/vsl400_videos/bo_right.mp4', thumbnailUrl: '/vsl400_videos/bo_thumb.jpg' },
      { name: 'Mẹ', slug: 'me', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người mẹ yêu thương', videoUrl: '/vsl400_videos/me_front.mp4', videoLeft: '/vsl400_videos/me_left.mp4', videoRight: '/vsl400_videos/me_right.mp4', thumbnailUrl: '/vsl400_videos/me_thumb.jpg' },
      { name: 'Ông nội', slug: 'ong_noi', category: 'Gia đình & Xưng hô', difficulty: 'Trung bình', meaning: 'Ông nội ruột', videoUrl: '/vsl400_videos/ong_noi_front.mp4', videoLeft: '/vsl400_videos/ong_noi_left.mp4', videoRight: '/vsl400_videos/ong_noi_right.mp4', thumbnailUrl: '/vsl400_videos/ong_noi_thumb.jpg' },
      { name: 'Bà nội', slug: 'ba_noi', category: 'Gia đình & Xưng hô', difficulty: 'Trung bình', meaning: 'Bà nội ruột', videoUrl: '/vsl400_videos/ba_noi_front.mp4', videoLeft: '/vsl400_videos/ba_noi_left.mp4', videoRight: '/vsl400_videos/ba_noi_right.mp4', thumbnailUrl: '/vsl400_videos/ba_noi_thumb.jpg' },
      { name: 'Bác', slug: 'bac', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Anh chị của bố mẹ', videoUrl: '/vsl400_videos/bac_front.mp4', videoLeft: '/vsl400_videos/bac_left.mp4', videoRight: '/vsl400_videos/bac_right.mp4', thumbnailUrl: '/vsl400_videos/bac_thumb.jpg' },
      { name: 'Chú', slug: 'chu', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Em trai của bố', videoUrl: '/vsl400_videos/chu_front.mp4', videoLeft: '/vsl400_videos/chu_left.mp4', videoRight: '/vsl400_videos/chu_right.mp4', thumbnailUrl: '/vsl400_videos/chu_thumb.jpg' },
      { name: 'Cô', slug: 'co', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Em gái của bố hoặc cô giáo', videoUrl: '/vsl400_videos/co_front.mp4', videoLeft: '/vsl400_videos/co_left.mp4', videoRight: '/vsl400_videos/co_right.mp4', thumbnailUrl: '/vsl400_videos/co_thumb.jpg' },
      { name: 'Anh', slug: 'anh', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người anh trai', videoUrl: '/vsl400_videos/anh_front.mp4', videoLeft: '/vsl400_videos/anh_left.mp4', videoRight: '/vsl400_videos/anh_right.mp4', thumbnailUrl: '/vsl400_videos/anh_thumb.jpg' },
      { name: 'Chị', slug: 'chi', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người chị gái', videoUrl: '/vsl400_videos/chi_front.mp4', videoLeft: '/vsl400_videos/chi_left.mp4', videoRight: '/vsl400_videos/chi_right.mp4', thumbnailUrl: '/vsl400_videos/chi_thumb.jpg' },
      { name: 'Em', slug: 'em', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người em nhỏ', videoUrl: '/vsl400_videos/em_front.mp4', videoLeft: '/vsl400_videos/em_left.mp4', videoRight: '/vsl400_videos/em_right.mp4', thumbnailUrl: '/vsl400_videos/em_thumb.jpg' },
      { name: 'Bóng đá', slug: 'bong_da', category: 'Đời sống & Thể thao', difficulty: 'Trung bình', meaning: 'Môn thể thao vua', videoUrl: '/vsl400_videos/bong_da_front.mp4', videoLeft: '/vsl400_videos/bong_da_left.mp4', videoRight: '/vsl400_videos/bong_da_right.mp4', thumbnailUrl: '/vsl400_videos/bong_da_thumb.jpg' },
      { name: 'Bơi lội', slug: 'boi_loi', category: 'Đời sống & Thể thao', difficulty: 'Dễ', meaning: 'Môn thể thao dưới nước', videoUrl: '/vsl400_videos/boi_loi_front.mp4', videoLeft: '/vsl400_videos/boi_loi_left.mp4', videoRight: '/vsl400_videos/boi_loi_right.mp4', thumbnailUrl: '/vsl400_videos/boi_loi_thumb.jpg' },
      { name: 'Bây giờ', slug: 'bay_gio', category: 'Đời sống & Thể thao', difficulty: 'Dễ', meaning: 'Thời điểm hiện tại', videoUrl: '/vsl400_videos/bay_gio_front.mp4', videoLeft: '/vsl400_videos/bay_gio_left.mp4', videoRight: '/vsl400_videos/bay_gio_right.mp4', thumbnailUrl: '/vsl400_videos/bay_gio_thumb.jpg' },
      { name: 'Học', slug: 'hoc', category: 'Trường học & Y tế', difficulty: 'Dễ', meaning: 'Hoạt động tiếp thu tri thức', videoUrl: '/vsl400_videos/hoc_front.mp4', videoLeft: '/vsl400_videos/hoc_left.mp4', videoRight: '/vsl400_videos/hoc_right.mp4', thumbnailUrl: '/vsl400_videos/hoc_thumb.jpg' },
      { name: 'Trường học', slug: 'truong_hoc', category: 'Trường học & Y tế', difficulty: 'Trung bình', meaning: 'Nơi dạy học', videoUrl: '/vsl400_videos/truong_hoc_front.mp4', videoLeft: '/vsl400_videos/truong_hoc_left.mp4', videoRight: '/vsl400_videos/truong_hoc_right.mp4', thumbnailUrl: '/vsl400_videos/truong_hoc_thumb.jpg' },
      { name: 'Bác sĩ', slug: 'bac_si', category: 'Trường học & Y tế', difficulty: 'Trung bình', meaning: 'Thầy thuốc chữa bệnh', videoUrl: '/vsl400_videos/bac_si_front.mp4', videoLeft: '/vsl400_videos/bac_si_left.mp4', videoRight: '/vsl400_videos/bac_si_right.mp4', thumbnailUrl: '/vsl400_videos/bac_si_thumb.jpg' },
      { name: 'Bệnh viện', slug: 'benh_vien', category: 'Trường học & Y tế', difficulty: 'Trung bình', meaning: 'Cơ sở khám chữa bệnh', videoUrl: '/vsl400_videos/benh_vien_front.mp4', videoLeft: '/vsl400_videos/benh_vien_left.mp4', videoRight: '/vsl400_videos/benh_vien_right.mp4', thumbnailUrl: '/vsl400_videos/benh_vien_thumb.jpg' },
    ];

    for (const w of baseWords) {
      const existing = await this.wordRepository.findOne({ where: { slug: w.slug } });
      if (!existing) {
        const word = this.wordRepository.create(w);
        await this.wordRepository.save(word);
      }
    }
    this.logger.log(`Đã nạp danh mục từ vựng VSL400 chuẩn vào CSDL.`);
  }

  private async seedSentences() {
    const possiblePaths = [
      path.join(__dirname, 'vsl400-sentences-seed.json'),
      path.join(process.cwd(), 'src', 'modules', 'seed', 'vsl400-sentences-seed.json'),
      path.join(process.cwd(), 'dist', 'modules', 'seed', 'vsl400-sentences-seed.json'),
      path.join(process.cwd(), 'backend-core', 'src', 'modules', 'seed', 'vsl400-sentences-seed.json'),
    ];
    const seedJsonPath = possiblePaths.find((p) => fs.existsSync(p));
    let sentencesToSeed: any[] = [];

    if (seedJsonPath && fs.existsSync(seedJsonPath)) {
      try {
        const raw = fs.readFileSync(seedJsonPath, 'utf-8');
        sentencesToSeed = JSON.parse(raw);
      } catch (e) {
        this.logger.error('Lỗi đọc vsl400-sentences-seed.json:', e);
      }
    }

    if (!sentencesToSeed || sentencesToSeed.length === 0) {
      this.logger.warn('Không tìm thấy tệp vsl400-sentences-seed.json.');
      return;
    }

    this.logger.log(`Đang nạp/đồng bộ ${sentencesToSeed.length} câu VSL chuẩn vào CSDL...`);
    for (const s of sentencesToSeed) {
      const existing = await this.sentenceRepository.findOne({ where: { slug: s.slug } });
      if (!existing) {
        const sentence = this.sentenceRepository.create(s);
        await this.sentenceRepository.save(sentence);
      } else {
        Object.assign(existing, s);
        await this.sentenceRepository.save(existing);
      }
    }
    this.logger.log(`Hoàn tất đồng bộ ${sentencesToSeed.length} câu VSL chuẩn vào CSDL.`);
  }

  private async seedDemoActivity() {
    const learner = await this.userRepository.findOne({ where: { email: 'learner@signlingo.com' } });
    if (!learner) return;

    // 1. Seed lịch sử luyện tập 7 ngày gần nhất (PracticeLogs)
    const logCount = await this.practiceLogRepository.count({ where: { userId: learner.id } });
    if (logCount === 0) {
      const now = new Date();
      const demoLogs = [
        { wordSlug: 'cam-on', wordName: 'Cảm ơn', score: 96, isPassed: true, daysAgo: 0, badJoints: [] },
        { wordSlug: 'pho', wordName: 'Phở', score: 90, isPassed: true, daysAgo: 0, badJoints: [] },
        { wordSlug: 'khoe', wordName: 'Khỏe', score: 95, isPassed: true, daysAgo: 1, badJoints: [] },
        { wordSlug: 'hoc', wordName: 'Học', score: 88, isPassed: true, daysAgo: 1, badJoints: [] },
        { wordSlug: 'ong-noi', wordName: 'Ông nội', score: 91, isPassed: true, daysAgo: 2, badJoints: [] },
        { wordSlug: 'ba-noi', wordName: 'Bà nội', score: 87, isPassed: true, daysAgo: 2, badJoints: [] },
        { wordSlug: 'xin-loi', wordName: 'Xin lỗi', score: 65, isPassed: false, daysAgo: 3, badJoints: [4, 20] },
        { wordSlug: 'nuoc', wordName: 'Nước', score: 89, isPassed: true, daysAgo: 3, badJoints: [] },
        { wordSlug: 'an', wordName: 'Ăn', score: 94, isPassed: true, daysAgo: 4, badJoints: [] },
        { wordSlug: 'uong', wordName: 'Uống', score: 82, isPassed: true, daysAgo: 4, badJoints: [] },
        { wordSlug: 'tam-biet', wordName: 'Tạm biệt', score: 70, isPassed: false, daysAgo: 5, badJoints: [0, 6] },
        { wordSlug: 'bo', wordName: 'Bố', score: 85, isPassed: true, daysAgo: 5, badJoints: [] },
        { wordSlug: 'me', wordName: 'Mẹ', score: 90, isPassed: true, daysAgo: 5, badJoints: [] },
        { wordSlug: 'tam-biet', wordName: 'Tạm biệt', score: 88, isPassed: true, daysAgo: 6, badJoints: [] },
        { wordSlug: 'cam-on', wordName: 'Cảm ơn', score: 92, isPassed: true, daysAgo: 6, badJoints: [] },
      ];

      for (const item of demoLogs) {
        const logDate = new Date(now.getTime() - item.daysAgo * 86400000 - Math.floor(Math.random() * 3600000));
        const log = this.practiceLogRepository.create({
          userId: learner.id,
          wordSlug: item.wordSlug,
          wordName: item.wordName,
          score: item.score,
          isPassed: item.isPassed,
          badJoints: item.badJoints,
          mode: 'camera',
          durationSeconds: 3.2,
          createdAt: logDate,
        });
        await this.practiceLogRepository.save(log);
      }
      this.logger.log('Đã tạo lịch sử luyện tập mẫu cho tài khoản learner.');
    }

    // 2. Seed tiến trình bài học hoàn thành (UserProgress)
    const progressCount = await this.userProgressRepository.count({ where: { userId: learner.id } });
    if (progressCount === 0) {
      const lessons = await this.lessonRepository.find({ take: 3 });
      for (let i = 0; i < lessons.length; i++) {
        const prog = this.userProgressRepository.create({
          userId: learner.id,
          lessonId: lessons[i].id,
          completed: true,
          score: i === 0 ? 95 : 90,
          attempts: 2,
          lastStudiedAt: new Date(Date.now() - i * 86400000),
        });
        await this.userProgressRepository.save(prog);
      }
      this.logger.log('Đã tạo tiến trình bài học mẫu cho tài khoản learner.');
    }

    // 3. Seed hàng đợi Spaced Repetition (ReviewItem)
    const reviewCount = await this.reviewItemRepository.count({ where: { userId: learner.id } });
    if (reviewCount === 0) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

      const reviewSeed = [
        { wordSlug: 'tam-biet', wordName: 'Tạm biệt', interval: 1, repetition: 0, easeFactor: 2.3, nextReviewDate: today },
        { wordSlug: 'xin-loi', wordName: 'Xin lỗi', interval: 1, repetition: 0, easeFactor: 2.2, nextReviewDate: today },
        { wordSlug: 'hoc', wordName: 'Học', interval: 5, repetition: 3, easeFactor: 2.6, nextReviewDate: tomorrow },
        { wordSlug: 'cam-on', wordName: 'Cảm ơn', interval: 3, repetition: 2, easeFactor: 2.5, nextReviewDate: inTwoDays },
      ];

      for (const r of reviewSeed) {
        const item = this.reviewItemRepository.create({
          userId: learner.id,
          wordSlug: r.wordSlug,
          wordName: r.wordName,
          interval: r.interval,
          repetition: r.repetition,
          easeFactor: r.easeFactor,
          nextReviewDate: r.nextReviewDate,
          lastReviewedAt: new Date(),
        });
        await this.reviewItemRepository.save(item);
      }
      this.logger.log('Đã nạp hàng đợi Spaced Repetition mẫu cho tài khoản learner.');
    }
  }
}

