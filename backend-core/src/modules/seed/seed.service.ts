import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Topic } from '../dictionary/entities/topic.entity';
import { Lesson } from '../dictionary/entities/lesson.entity';
import { Word } from '../dictionary/entities/word.entity';
import { Sentence } from '../sentences/entities/sentence.entity';

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
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
    await this.seedTopicsAndLessons();
    await this.seedWords();
    await this.seedSentences();
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

    const learnerCount = await this.userRepository.count({ where: { email: 'learner@signlingo.com' } });
    if (learnerCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const learnerPass = await bcrypt.hash('123456', salt);
      const learner = this.userRepository.create({
        email: 'learner@signlingo.com',
        passwordHash: learnerPass,
        fullName: 'Nguyễn Văn Học',
        role: UserRole.LEARNER,
        xp: 450,
        streak: 5,
        hearts: 5,
        gems: 150,
        learningLevel: 'beginner',
        dailyGoalMinutes: 15,
        priorityTopic: 'greeting',
      });
      await this.userRepository.save(learner);
      this.logger.log('Đã tạo tài khoản Học viên demo: learner@signlingo.com / 123456');
    }
  }

  private async seedTopicsAndLessons() {
    const topicCount = await this.topicRepository.count();
    if (topicCount > 0) return;

    const topicsData = [
      {
        slug: 'greeting',
        title: 'Chào hỏi & Giao tiếp',
        subtitle: 'Ký hiệu cơ bản kết nối xã hội',
        description: 'Làm quen các cử chỉ chào hỏi, cảm ơn, xin lỗi và làm quen trong văn hóa người điếc.',
        icon: '👋',
        orderIndex: 1,
        lessons: [
          { title: 'Chào & Gặp gỡ', slug: 'chao-gap-go', description: 'Học cách thực hiện cử chỉ Chào tiêu chuẩn VSL', duration: '5 phút', level: 'Cơ bản', orderIndex: 1 },
          { title: 'Tri ân & Tạ lỗi', slug: 'tri-an-ta-loi', description: 'Thực hành ký hiệu Cảm ơn và Xin lỗi', duration: '7 phút', level: 'Cơ bản', orderIndex: 2 },
          { title: 'Hỏi thăm sức khỏe', slug: 'hoi-tham-suc-khoe', description: 'Ký hiệu Khỏe, Giúp đỡ khi giao tiếp', duration: '8 phút', level: 'Trung bình', orderIndex: 3 },
        ],
      },
      {
        slug: 'family',
        title: 'Gia đình & Xưng hô',
        subtitle: 'Tình thân và cách gọi người thân',
        description: 'Học cách biểu đạt ông, bà, bố, mẹ, anh, chị, em trong gia đình.',
        icon: '👨‍👩‍👧‍👦',
        orderIndex: 2,
        lessons: [
          { title: 'Bố mẹ & Thế hệ trên', slug: 'bo-me', description: 'Ký hiệu Bố, Mẹ, Bác, Chú, Cô', duration: '6 phút', level: 'Cơ bản', orderIndex: 1 },
          { title: 'Ông bà & Cội nguồn', slug: 'ong-ba', description: 'Ký hiệu Ông nội, Bà nội', duration: '5 phút', level: 'Cơ bản', orderIndex: 2 },
          { title: 'Anh chị em trong nhà', slug: 'anh-chi-em', description: 'Ký hiệu Anh, Chị, Em', duration: '7 phút', level: 'Cơ bản', orderIndex: 3 },
        ],
      },
      {
        slug: 'food',
        title: 'Ẩm thực & Ăn uống',
        subtitle: 'Món ăn, đồ uống quen thuộc',
        description: 'Ký hiệu gọi món, các món phở, bún, bánh bao, nước, sữa, trà.',
        icon: '🍜',
        orderIndex: 3,
        lessons: [
          { title: 'Động từ Ăn & Uống', slug: 'an-uong', description: 'Cử chỉ cơ bản về nạp năng lượng', duration: '5 phút', level: 'Cơ bản', orderIndex: 1 },
          { title: 'Món ăn truyền thống', slug: 'mon-an', description: 'Phở, Bún, Bánh bao, Thịt', duration: '8 phút', level: 'Trung bình', orderIndex: 2 },
          { title: 'Thức uống quen thuộc', slug: 'thuc-uong', description: 'Nước, Sữa, Trà', duration: '6 phút', level: 'Cơ bản', orderIndex: 3 },
        ],
      },
      {
        slug: 'life',
        title: 'Đời sống & Thể thao',
        subtitle: 'Sinh hoạt, vui chơi giải trí',
        description: 'Ký hiệu bóng đá, bơi lội, thời gian bây giờ.',
        icon: '⚽',
        orderIndex: 4,
        lessons: [
          { title: 'Vận động & Thể thao', slug: 'the-thao', description: 'Bóng đá, Bơi lội', duration: '6 phút', level: 'Trung bình', orderIndex: 1 },
          { title: 'Thời gian & Hiện tại', slug: 'thoi-gian', description: 'Bây giờ, Hôm nay', duration: '5 phút', level: 'Cơ bản', orderIndex: 2 },
        ],
      },
      {
        slug: 'education',
        title: 'Trường học & Y tế',
        subtitle: 'Môi trường học tập và chăm sóc sức khỏe',
        description: 'Ký hiệu trường học, học tập, bác sĩ, bệnh viện.',
        icon: '🏥',
        orderIndex: 5,
        lessons: [
          { title: 'Môi trường học đường', slug: 'hoc-duong', description: 'Học tập, Trường học', duration: '7 phút', level: 'Cơ bản', orderIndex: 1 },
          { title: 'Y tế & Bệnh viện', slug: 'y-te', description: 'Bác sĩ, Bệnh viện', duration: '8 phút', level: 'Trung bình', orderIndex: 2 },
        ],
      },
    ];

    for (const tData of topicsData) {
      const { lessons, ...topicFields } = tData;
      const topic = this.topicRepository.create(topicFields);
      const savedTopic = await this.topicRepository.save(topic);

      for (const lData of lessons) {
        const lesson = this.lessonRepository.create({
          ...lData,
          topicId: savedTopic.id,
        });
        await this.lessonRepository.save(lesson);
      }
    }
    this.logger.log('Đã khởi tạo danh mục Topics và Lessons mẫu.');
  }

  private async seedWords() {
    const wordCount = await this.wordRepository.count();
    if (wordCount > 0) return;

    const baseWords = [
      { name: 'Chào', slug: 'chao', category: 'Chào hỏi & Giao tiếp', difficulty: 'Dễ', meaning: 'Cử chỉ chào hỏi tiêu chuẩn VSL', videoUrl: '/chao.mp4', thumbnailUrl: '/chao_thumb.jpg', usageTips: 'Bàn tay mở 5 ngón chạm nhẹ vùng thái dương đưa dứt khoát ra ngoài.' },
      { name: 'Cảm ơn', slug: 'cam_on', category: 'Chào hỏi & Giao tiếp', difficulty: 'Dễ', meaning: 'Bày tỏ lòng biết ơn', videoUrl: '/vsl400_videos/cam_on_front.mp4', thumbnailUrl: '/vsl400_videos/cam_on_thumb.jpg', usageTips: 'Đầu ngón tay đặt nhẹ cằm rồi đưa thẳng về phía trước.' },
      { name: 'Xin lỗi', slug: 'xin_loi', category: 'Chào hỏi & Giao tiếp', difficulty: 'Trung bình', meaning: 'Thể hiện sự hối lỗi', videoUrl: '/vsl400_videos/xin_loi_front.mp4', thumbnailUrl: '/vsl400_videos/xin_loi_thumb.jpg', usageTips: 'Nắm bàn tay đặt trên ngực trái xoay tròn nhẹ nhàng.' },
      { name: 'Giúp đỡ', slug: 'giup_do', category: 'Chào hỏi & Giao tiếp', difficulty: 'Trung bình', meaning: 'Tương trợ hỗ trợ người khác', videoUrl: '/vsl400_videos/giup_do_front.mp4', thumbnailUrl: '/vsl400_videos/giup_do_thumb.jpg' },
      { name: 'Khỏe', slug: 'khoe', category: 'Chào hỏi & Giao tiếp', difficulty: 'Dễ', meaning: 'Sức khỏe tốt, dẻo dai', videoUrl: '/vsl400_videos/khoe_front.mp4', thumbnailUrl: '/vsl400_videos/khoe_thumb.jpg' },
      { name: 'Ăn', slug: 'an', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Hành động ăn uống thức ăn', videoUrl: '/vsl400_videos/an_front.mp4', thumbnailUrl: '/vsl400_videos/an_thumb.jpg', usageTips: 'Các đầu ngón tay chụm lại đưa hướng vào miệng 2 lần.' },
      { name: 'Uống', slug: 'uong', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Hành động uống chất lỏng', videoUrl: '/vsl400_videos/uong_front.mp4', thumbnailUrl: '/vsl400_videos/uong_thumb.jpg' },
      { name: 'Phở', slug: 'pho', category: 'Ẩm thực & Đồ uống', difficulty: 'Trung bình', meaning: 'Món ăn truyền thống Việt Nam', videoUrl: '/vsl400_videos/pho_front.mp4', thumbnailUrl: '/vsl400_videos/pho_thumb.jpg' },
      { name: 'Bún', slug: 'bun', category: 'Ẩm thực & Đồ uống', difficulty: 'Trung bình', meaning: 'Sợi bún tươi ẩm thực', videoUrl: '/vsl400_videos/bun_front.mp4', thumbnailUrl: '/vsl400_videos/bun_thumb.jpg' },
      { name: 'Bánh bao', slug: 'banh_bao', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Bánh bao nhân thịt hấp', videoUrl: '/vsl400_videos/banh_bao_front.mp4', thumbnailUrl: '/vsl400_videos/banh_bao_thumb.jpg' },
      { name: 'Thịt', slug: 'thit', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Thực phẩm đạm thịt', videoUrl: '/vsl400_videos/thit_front.mp4', thumbnailUrl: '/vsl400_videos/thit_thumb.jpg' },
      { name: 'Nước', slug: 'nuoc', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Nước lọc thanh khiết', videoUrl: '/vsl400_videos/nuoc_front.mp4', thumbnailUrl: '/vsl400_videos/nuoc_thumb.jpg' },
      { name: 'Sữa', slug: 'sua', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Đồ uống bổ dưỡng sữa', videoUrl: '/vsl400_videos/sua_front.mp4', thumbnailUrl: '/vsl400_videos/sua_thumb.jpg' },
      { name: 'Trà', slug: 'tra', category: 'Ẩm thực & Đồ uống', difficulty: 'Dễ', meaning: 'Thức uống lá chè', videoUrl: '/vsl400_videos/tra_front.mp4', thumbnailUrl: '/vsl400_videos/tra_thumb.jpg' },
      { name: 'Bố', slug: 'bo', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người cha trong gia đình', videoUrl: '/vsl400_videos/bo_front.mp4', thumbnailUrl: '/vsl400_videos/bo_thumb.jpg' },
      { name: 'Mẹ', slug: 'me', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người mẹ yêu thương', videoUrl: '/vsl400_videos/me_front.mp4', thumbnailUrl: '/vsl400_videos/me_thumb.jpg' },
      { name: 'Ông nội', slug: 'ong_noi', category: 'Gia đình & Xưng hô', difficulty: 'Trung bình', meaning: 'Ông nội ruột', videoUrl: '/vsl400_videos/ong_noi_front.mp4', thumbnailUrl: '/vsl400_videos/ong_noi_thumb.jpg' },
      { name: 'Bà nội', slug: 'ba_noi', category: 'Gia đình & Xưng hô', difficulty: 'Trung bình', meaning: 'Bà nội ruột', videoUrl: '/vsl400_videos/ba_noi_front.mp4', thumbnailUrl: '/vsl400_videos/ba_noi_thumb.jpg' },
      { name: 'Bác', slug: 'bac', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Anh chị của bố mẹ', videoUrl: '/vsl400_videos/bac_front.mp4', thumbnailUrl: '/vsl400_videos/bac_thumb.jpg' },
      { name: 'Chú', slug: 'chu', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Em trai của bố', videoUrl: '/vsl400_videos/chu_front.mp4', thumbnailUrl: '/vsl400_videos/chu_thumb.jpg' },
      { name: 'Cô', slug: 'co', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Em gái của bố hoặc cô giáo', videoUrl: '/vsl400_videos/co_front.mp4', thumbnailUrl: '/vsl400_videos/co_thumb.jpg' },
      { name: 'Anh', slug: 'anh', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người anh trai', videoUrl: '/vsl400_videos/anh_front.mp4', thumbnailUrl: '/vsl400_videos/anh_thumb.jpg' },
      { name: 'Chị', slug: 'chi', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người chị gái', videoUrl: '/vsl400_videos/chi_front.mp4', thumbnailUrl: '/vsl400_videos/chi_thumb.jpg' },
      { name: 'Em', slug: 'em', category: 'Gia đình & Xưng hô', difficulty: 'Dễ', meaning: 'Người em nhỏ', videoUrl: '/vsl400_videos/em_front.mp4', thumbnailUrl: '/vsl400_videos/em_thumb.jpg' },
      { name: 'Bóng đá', slug: 'bong_da', category: 'Đời sống & Thể thao', difficulty: 'Trung bình', meaning: 'Môn thể thao vua', videoUrl: '/vsl400_videos/bong_da_front.mp4', thumbnailUrl: '/vsl400_videos/bong_da_thumb.jpg' },
      { name: 'Bơi lội', slug: 'boi_loi', category: 'Đời sống & Thể thao', difficulty: 'Dễ', meaning: 'Môn thể thao dưới nước', videoUrl: '/vsl400_videos/boi_loi_front.mp4', thumbnailUrl: '/vsl400_videos/boi_loi_thumb.jpg' },
      { name: 'Bây giờ', slug: 'bay_gio', category: 'Đời sống & Thể thao', difficulty: 'Dễ', meaning: 'Thời điểm hiện tại', videoUrl: '/vsl400_videos/bay_gio_front.mp4', thumbnailUrl: '/vsl400_videos/bay_gio_thumb.jpg' },
      { name: 'Học', slug: 'hoc', category: 'Trường học & Y tế', difficulty: 'Dễ', meaning: 'Hoạt động tiếp thu tri thức', videoUrl: '/vsl400_videos/hoc_front.mp4', thumbnailUrl: '/vsl400_videos/hoc_thumb.jpg' },
      { name: 'Trường học', slug: 'truong_hoc', category: 'Trường học & Y tế', difficulty: 'Trung bình', meaning: 'Nơi dạy học', videoUrl: '/vsl400_videos/truong_hoc_front.mp4', thumbnailUrl: '/vsl400_videos/truong_hoc_thumb.jpg' },
      { name: 'Bác sĩ', slug: 'bac_si', category: 'Trường học & Y tế', difficulty: 'Trung bình', meaning: 'Thầy thuốc chữa bệnh', videoUrl: '/vsl400_videos/bac_si_front.mp4', thumbnailUrl: '/vsl400_videos/bac_si_thumb.jpg' },
      { name: 'Bệnh viện', slug: 'benh_vien', category: 'Trường học & Y tế', difficulty: 'Trung bình', meaning: 'Cơ sở khám chữa bệnh', videoUrl: '/vsl400_videos/benh_vien_front.mp4', thumbnailUrl: '/vsl400_videos/benh_vien_thumb.jpg' },
    ];

    for (const w of baseWords) {
      const word = this.wordRepository.create(w);
      await this.wordRepository.save(word);
    }
    this.logger.log(`Đã nạp thành công ${baseWords.length} từ vựng VSL400 chuẩn vào CSDL.`);
  }

  private async seedSentences() {
    const count = await this.sentenceRepository.count();
    if (count > 0) return;

    const sentences = [
      {
        title: 'Em chào anh',
        slug: 'em-chao-anh',
        meaning: 'Lời chào lễ phép của em gửi tới người anh.',
        structure: 'SOV: Chủ ngữ (Em) + Đối tượng (Anh) + Hành động (Chào)',
        category: 'Chào hỏi & Giao tiếp',
        difficulty: 'Dễ',
        explanation: 'Trong VSL, chủ thể và người nhận cử chỉ được xác định trước, sau đó mới thực hiện ký hiệu Chào.',
        orderIndex: 1,
        words: [
          { id: 1, name: 'Em', slug: 'em', role: 'Chủ ngữ', video: '/vsl400_videos/em_front.mp4', hint: 'Ký hiệu Em chỉ vào bản thân' },
          { id: 2, name: 'Anh', slug: 'anh', role: 'Đối tượng', video: '/vsl400_videos/anh_front.mp4', hint: 'Ký hiệu Anh chỉ người đối diện' },
          { id: 3, name: 'Chào', slug: 'chao', role: 'Hành động', video: '/chao.mp4', hint: 'Bàn tay vẫy nhẹ thái dương' },
        ],
      },
      {
        title: 'Anh ăn phở',
        slug: 'anh-an-pho',
        meaning: 'Anh đang thưởng thức món phở truyền thống.',
        structure: 'SOV: Chủ (Anh) + Món ăn (Phở) + Động từ (Ăn)',
        category: 'Ẩm thực & Đồ uống',
        difficulty: 'Dễ',
        explanation: 'Theo quy tắc Chủ đề - Lời dẫn VSL, món ăn (bổ ngữ) được đưa ra trước hành động Ăn.',
        orderIndex: 2,
        words: [
          { id: 1, name: 'Anh', slug: 'anh', role: 'Chủ ngữ', video: '/vsl400_videos/anh_front.mp4', hint: 'Ký hiệu Anh' },
          { id: 2, name: 'Phở', slug: 'pho', role: 'Món ăn', video: '/vsl400_videos/pho_front.mp4', hint: 'Ký hiệu Phở hai tay gấp sợi' },
          { id: 3, name: 'Ăn', slug: 'an', role: 'Động từ', video: '/vsl400_videos/an_front.mp4', hint: 'Ký hiệu Ăn chụm ngón đưa vào miệng' },
        ],
      },
      {
        title: 'Em ăn bánh bao',
        slug: 'em-an-banh-bao',
        meaning: 'Em đang ăn bánh bao nóng hổi.',
        structure: 'SOV: Chủ (Em) + Món ăn (Bánh bao) + Động từ (Ăn)',
        category: 'Ẩm thực & Đồ uống',
        difficulty: 'Dễ',
        explanation: 'Ký hiệu món ăn (Bánh bao) đứng trước hành động Ăn.',
        orderIndex: 3,
        words: [
          { id: 1, name: 'Em', slug: 'em', role: 'Chủ ngữ', video: '/vsl400_videos/em_front.mp4', hint: 'Ký hiệu Em' },
          { id: 2, name: 'Bánh bao', slug: 'banh_bao', role: 'Món ăn', video: '/vsl400_videos/banh_bao_front.mp4', hint: 'Ký hiệu Bánh bao chụm tròn hai tay' },
          { id: 3, name: 'Ăn', slug: 'an', role: 'Động từ', video: '/vsl400_videos/an_front.mp4', hint: 'Ký hiệu Ăn' },
        ],
      },
      {
        title: 'Mẹ uống sữa',
        slug: 'me-uong-sua',
        meaning: 'Mẹ đang uống sữa dinh dưỡng.',
        structure: 'SOV: Chủ (Mẹ) + Đồ uống (Sữa) + Động từ (Uống)',
        category: 'Ẩm thực & Đồ uống',
        difficulty: 'Dễ',
        explanation: 'Danh từ thức uống (Sữa) đi trước hành động (Uống).',
        orderIndex: 4,
        words: [
          { id: 1, name: 'Mẹ', slug: 'me', role: 'Chủ ngữ', video: '/vsl400_videos/me_front.mp4', hint: 'Ký hiệu Mẹ' },
          { id: 2, name: 'Sữa', slug: 'sua', role: 'Đồ uống', video: '/vsl400_videos/sua_front.mp4', hint: 'Ký hiệu Sữa bóp nhẹ lòng bàn tay' },
          { id: 3, name: 'Uống', slug: 'uong', role: 'Động từ', video: '/vsl400_videos/uong_front.mp4', hint: 'Ký hiệu Uống tay cong nâng ly' },
        ],
      },
      {
        title: 'Em cảm ơn bác',
        slug: 'em-cam-on-bac',
        meaning: 'Em gửi lời cảm ơn chân thành tới bác.',
        structure: 'Chủ (Em) + Người nhận (Bác) + Động từ (Cảm ơn)',
        category: 'Chào hỏi & Giao tiếp',
        difficulty: 'Dễ',
        explanation: 'Ký hiệu Cảm ơn đưa từ cằm hướng về phía bác.',
        orderIndex: 5,
        words: [
          { id: 1, name: 'Em', slug: 'em', role: 'Chủ ngữ', video: '/vsl400_videos/em_front.mp4', hint: 'Ký hiệu Em' },
          { id: 2, name: 'Bác', slug: 'bac', role: 'Đối tượng', video: '/vsl400_videos/bac_front.mp4', hint: 'Ký hiệu Bác tôn kính' },
          { id: 3, name: 'Cảm ơn', slug: 'cam_on', role: 'Động từ', video: '/vsl400_videos/cam_on_front.mp4', hint: 'Ký hiệu Cảm ơn' },
        ],
      },
    ];

    for (const s of sentences) {
      const sentence = this.sentenceRepository.create(s);
      await this.sentenceRepository.save(sentence);
    }
    this.logger.log(`Đã nạp thành công ${sentences.length} câu VSL chuẩn vào CSDL.`);
  }
}

