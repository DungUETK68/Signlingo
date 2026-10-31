// Dữ liệu mẫu chuẩn cho hệ thống Signlingo (Ngôn ngữ ký hiệu Việt Nam - VSL)
import { VSL400_WORDS } from './vsl400Words.js';

export const TOPICS = [
  {
    id: 'alphabet',
    title: 'Bảng chữ cái ngón tay',
    level: 'Căn bản (Level 1)',
    levelCode: 'basic',
    icon: '🔤',
    description: 'Học 29 chữ cái tiếng Việt biểu đạt bằng ngón tay chuẩn VSL',
    totalLessons: 29,
    completedLessons: 24,
    color: '#0284c7',
    bgColor: '#e0f2fe',
    accentColor: '#38bdf8',
    lessons: [
      { id: 'alpha-a', title: 'Chữ cái A', description: 'Nắm bàn tay, ngón cái tựa cạnh ngón trỏ', duration: '2 phút', level: 'Dễ', completed: true, score: 96 },
      { id: 'alpha-b', title: 'Chữ cái B', description: 'Bốn ngón duỗi thẳng khép lại, ngón cái gập vào lòng bàn tay', duration: '2 phút', level: 'Dễ', completed: true, score: 92 },
      { id: 'alpha-c', title: 'Chữ cái C', description: 'Các ngón uốn cong tạo thành hình vòm chữ C', duration: '2 phút', level: 'Dễ', completed: true, score: 88 },
      { id: 'alpha-d', title: 'Chữ cái D', description: 'Ngón trỏ duỗi thẳng hướng lên, 3 ngón còn lại chạm đầu ngón cái', duration: '3 phút', level: 'Trung bình', completed: true, score: 95 },
      { id: 'alpha-e', title: 'Chữ cái E', description: 'Bốn ngón cong gập đầu ngón tay tỳ lên ngón cái', duration: '3 phút', level: 'Trung bình', completed: false, score: 0 },
    ]
  },
  {
    id: 'numbers',
    title: 'Số đếm cơ bản',
    level: 'Căn bản (Level 1)',
    levelCode: 'basic',
    icon: '🔢',
    description: 'Số đếm từ 1 đến 10 và các quy tắc số hàng chục, hàng trăm',
    totalLessons: 10,
    completedLessons: 9,
    color: '#059669',
    bgColor: '#d1fae5',
    accentColor: '#34d399',
    lessons: [
      { id: 'num-1-5', title: 'Số từ 1 đến 5', description: 'Đếm ngón tay theo quy chuẩn ký hiệu Việt Nam', duration: '3 phút', level: 'Dễ', completed: true, score: 98 },
      { id: 'num-6-10', title: 'Số từ 6 đến 10', description: 'Quy tắc kết hợp ngón tay và lòng bàn tay', duration: '4 phút', level: 'Trung bình', completed: true, score: 91 },
      { id: 'num-teen', title: 'Số hàng chục (10 - 90)', description: 'Chuyển động lắc nhẹ bàn tay theo quy tắc số', duration: '5 phút', level: 'Khá', completed: false, score: 0 }
    ]
  },
  {
    id: 'greeting',
    title: 'Chào hỏi & Làm quen',
    level: 'Sơ cấp (Level 2)',
    levelCode: 'elementary',
    icon: '👋',
    description: 'Chào, Tạm biệt, Cảm ơn, Xin lỗi, Giúp đỡ và hỏi thăm sức khỏe chuẩn VSL400',
    totalLessons: 6,
    completedLessons: 4,
    color: '#d97706',
    bgColor: '#fef3c7',
    accentColor: '#fbbf24',
    lessons: [
      { id: 'greet-hello', title: 'Chào', description: 'Bàn tay mở chạm nhẹ thái dương và đưa nhẹ ra ngoài kèm nụ cười', duration: '2 phút', level: 'Dễ', completed: true, score: 94, videoUrl: '/chao.mp4' },
      { id: 'vsl-cam-on', title: 'Cảm ơn', description: 'Đặt đầu ngón tay lên cằm rồi hạ nhẹ bàn tay về phía trước', duration: '2 phút', level: 'Dễ', completed: true, score: 97, videoUrl: '/vsl400_videos/cam_on_front.mp4' },
      { id: 'vsl-xin-loi', title: 'Xin lỗi', description: 'Bàn tay nắm lại, xoay tròn nhẹ nhàng trên ngực trái', duration: '3 phút', level: 'Trung bình', completed: true, score: 95, videoUrl: '/vsl400_videos/xin_loi_front.mp4' },
      { id: 'vsl-giup-do', title: 'Giúp đỡ', description: 'Bàn tay mở đặt dưới mu bàn tay còn lại đưa về phía trước hỗ trợ', duration: '3 phút', level: 'Trung bình', completed: true, score: 96, videoUrl: '/vsl400_videos/giup_do_front.mp4' },
      { id: 'vsl-khoe', title: 'Khỏe', description: 'Hai bàn tay nắm gập vuông góc trước ngực thể hiện sức mạnh', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/khoe_front.mp4' },
      { id: 'greet-bye', title: 'Tạm biệt', description: 'Bàn tay nâng cao ngang vai, gập mở các ngón tay vẫy nhẹ', duration: '2 phút', level: 'Dễ', completed: false, score: 0 }
    ]
  },
  {
    id: 'family',
    title: 'Gia đình thân thương',
    level: 'Sơ cấp (Level 2)',
    levelCode: 'elementary',
    icon: '👨‍👩‍👧‍👦',
    description: 'Bố, Mẹ, Ông bà, Anh chị em và các mối quan hệ thân thuộc',
    totalLessons: 10,
    completedLessons: 6,
    color: '#e11d48',
    bgColor: '#ffe4e6',
    accentColor: '#fb7185',
    lessons: [
      { id: 'vsl-bo', title: 'Bố', description: 'Ký hiệu ria mép kết hợp động tác trang trọng', duration: '2 phút', level: 'Dễ', completed: true, score: 97, videoUrl: '/vsl400_videos/bo_front.mp4' },
      { id: 'vsl-me', title: 'Mẹ', description: 'Ngón tay trỏ chạm nhẹ cạnh cằm hoặc dái tai biểu trưng cho khuyên tai', duration: '2 phút', level: 'Dễ', completed: true, score: 96, videoUrl: '/vsl400_videos/me_front.mp4' },
      { id: 'vsl-anh', title: 'Anh', description: 'Ngón trỏ chỉ về người nam lớn tuổi hơn kết hợp cử chỉ trang trọng', duration: '2 phút', level: 'Dễ', completed: true, score: 95, videoUrl: '/vsl400_videos/anh_front.mp4' },
      { id: 'vsl-chi', title: 'Chị', description: 'Cử chỉ tay vuốt tóc hoặc chạm tai biểu thị người nữ lớn tuổi hơn', duration: '2 phút', level: 'Dễ', completed: true, score: 96, videoUrl: '/vsl400_videos/chi_front.mp4' },
      { id: 'vsl-em', title: 'Em', description: 'Bàn tay hạ thấp ngang ngực thể hiện người nhỏ tuổi hơn', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/em_front.mp4' },
      { id: 'vsl-ong-noi', title: 'Ông nội', description: 'Ký hiệu vuốt chòm râu dài dưới cằm kết hợp chỉ bên nội', duration: '3 phút', level: 'Trung bình', completed: false, score: 0, videoUrl: '/vsl400_videos/ong_noi_front.mp4' },
      { id: 'vsl-ba-noi', title: 'Bà nội', description: 'Ký hiệu búi tóc móm mém của người bà kính yêu', duration: '3 phút', level: 'Trung bình', completed: false, score: 0, videoUrl: '/vsl400_videos/ba_noi_front.mp4' },
      { id: 'vsl-chu', title: 'Chú', description: 'Ký hiệu nam giới kèm vị trí xưng hô bậc em cha mẹ', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/chu_front.mp4' },
      { id: 'vsl-co', title: 'Cô', description: 'Ký hiệu nữ giới kèm nét mặt tươi vui thể hiện bậc cô / dì', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/co_front.mp4' },
      { id: 'vsl-bac', title: 'Bác', description: 'Ký hiệu biểu thị người lớn tuổi hơn cha mẹ một bậc', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/bac_front.mp4' }
    ]
  },
  {
    id: 'daily',
    title: 'Giao tiếp hàng ngày',
    level: 'Trung cấp (Level 3)',
    levelCode: 'intermediate',
    icon: '💬',
    description: 'Y tế, Trường học, Thời gian và các hội thoại đời sống',
    totalLessons: 7,
    completedLessons: 3,
    color: '#7c3aed',
    bgColor: '#ede9fe',
    accentColor: '#a78bfa',
    lessons: [
      { id: 'vsl-bac-si', title: 'Bác sĩ', description: 'Ngón tay gõ nhẹ lên cổ tay bắt mạch y tế', duration: '3 phút', level: 'Trung bình', completed: true, score: 96, videoUrl: '/vsl400_videos/bac_si_front.mp4' },
      { id: 'vsl-benh-vien', title: 'Bệnh viện', description: 'Ký hiệu chữ thập đỏ trên cánh tay kết hợp mái nhà', duration: '3 phút', level: 'Trung bình', completed: true, score: 96, videoUrl: '/vsl400_videos/benh_vien_front.mp4' },
      { id: 'vsl-hoc', title: 'Học', description: 'Mở tay như trang sách, tay kia nhặt kiến thức đưa lên trán', duration: '2 phút', level: 'Dễ', completed: true, score: 98, videoUrl: '/vsl400_videos/hoc_front.mp4' },
      { id: 'vsl-truong-hoc', title: 'Trường học', description: 'Ghép ký hiệu "Nhà" và ký hiệu "Học" biểu thị trường', duration: '3 phút', level: 'Trung bình', completed: false, score: 0, videoUrl: '/vsl400_videos/truong_hoc_front.mp4' },
      { id: 'vsl-bay-gio', title: 'Bây giờ', description: 'Hai bàn tay uốn cong ngửa nhẹ hạ xuống dứt khoát trước ngực', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/bay_gio_front.mp4' },
      { id: 'daily-help', title: 'Bạn có cần giúp không?', description: 'Bàn tay phải mở ngửa đặt trên mu bàn tay trái đưa về phía đối diện', duration: '4 phút', level: 'Trung bình', completed: false, score: 0 },
      { id: 'daily-time', title: 'Mấy giờ rồi?', description: 'Ngón trỏ gõ nhẹ lên cổ tay trái biểu thị mặt đồng hồ', duration: '3 phút', level: 'Dễ', completed: false, score: 0 }
    ]
  },
  {
    id: 'food',
    title: 'Ẩm thực & Đồ ăn',
    level: 'Trung cấp (Level 3)',
    levelCode: 'intermediate',
    icon: '🍲',
    description: 'Phở, Bún, Bánh bao, Thịt, Trà, Sữa và cử chỉ ăn uống hàng ngày',
    totalLessons: 9,
    completedLessons: 4,
    color: '#0d9488',
    bgColor: '#ccfbf1',
    accentColor: '#2dd4bf',
    lessons: [
      { id: 'vsl-pho', title: 'Phở', description: 'Tay trái khum hình bát, tay phải chụm ngón gắp đưa lên miệng', duration: '3 phút', level: 'Trung bình', completed: true, score: 97, videoUrl: '/vsl400_videos/pho_front.mp4' },
      { id: 'vsl-bun', title: 'Bún', description: 'Ký hiệu sợi bún mềm cuộn tròn gắp ăn kèm nước dùng', duration: '3 phút', level: 'Trung bình', completed: true, score: 96, videoUrl: '/vsl400_videos/bun_front.mp4' },
      { id: 'vsl-an', title: 'Ăn', description: 'Các ngón tay chụm lại đưa vào sát miệng 2 lần', duration: '2 phút', level: 'Dễ', completed: true, score: 98, videoUrl: '/vsl400_videos/an_front.mp4' },
      { id: 'vsl-uong', title: 'Uống', description: 'Bàn tay cong chữ C như cầm cốc nâng lên miệng', duration: '2 phút', level: 'Dễ', completed: true, score: 98, videoUrl: '/vsl400_videos/uong_front.mp4' },
      { id: 'vsl-nuoc', title: 'Nước', description: 'Ngón tay trỏ chạm nhẹ cạnh cằm hoặc môi biểu thị chất lỏng', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/nuoc_front.mp4' },
      { id: 'vsl-banh-bao', title: 'Bánh bao', description: 'Hai bàn tay chụm tròn lại tạo hình chiếc bánh bao xốp', duration: '3 phút', level: 'Trung bình', completed: false, score: 0, videoUrl: '/vsl400_videos/banh_bao_front.mp4' },
      { id: 'vsl-thit', title: 'Thịt', description: 'Ngón cái và ngón trỏ véo nhẹ phần thịt mu bàn tay', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/thit_front.mp4' },
      { id: 'vsl-tra', title: 'Trà', description: 'Tay cầm tách trà nhỏ đưa lên miệng nhấp nháp thanh lịch', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/tra_front.mp4' },
      { id: 'vsl-sua', title: 'Sữa', description: 'Hai tay nắm mở nhịp nhàng mô phỏng hành động vắt sữa', duration: '2 phút', level: 'Dễ', completed: false, score: 0, videoUrl: '/vsl400_videos/sua_front.mp4' }
    ]
  },
  {
    id: 'sports',
    title: 'Thể thao & Giải trí',
    level: 'Trung cấp (Level 3)',
    levelCode: 'intermediate',
    icon: '⚽',
    description: 'Bóng đá, Bơi lội và các hoạt động thể chất rèn luyện sức khỏe',
    totalLessons: 2,
    completedLessons: 1,
    color: '#0284c7',
    bgColor: '#e0f2fe',
    accentColor: '#38bdf8',
    lessons: [
      { id: 'vsl-bong-da', title: 'Bóng đá', description: 'Tay trái khum tròn quả bóng, tay phải hai ngón chân đá dứt khoát', duration: '3 phút', level: 'Trung bình', completed: true, score: 96, videoUrl: '/vsl400_videos/bong_da_front.mp4' },
      { id: 'vsl-boi-loi', title: 'Bơi lội', description: 'Hai cánh tay quạt so le về phía trước như động tác bơi sải', duration: '3 phút', level: 'Trung bình', completed: false, score: 0, videoUrl: '/vsl400_videos/boi_loi_front.mp4' }
    ]
  }
];

export const DICTIONARY_WORDS = [
  {
    id: 'w-hello',
    word: 'Chào',
    slug: 'chao',
    topic: 'greeting',
    topicLabel: 'Chào hỏi',
    dialect: 'Toàn quốc',
    difficulty: 'Dễ',
    description: 'Đưa bàn tay mở chạm nhẹ lên vùng thái dương, sau đó đưa nhẹ ra phía trước kèm nụ cười thân thiện.',
    details: 'Cử chỉ chuẩn VSL được sử dụng trong mọi tình huống giao tiếp lịch sự cả ở miền Bắc, Trung và Nam.',
    handShape: 'Bàn tay mở 5 ngón khép tự nhiên (Open-B)',
    movement: 'Chạm thái dương -> Đưa về phía đối tác (Vòng cung nhỏ)',
    faceExpression: 'Mắt nhìn đối diện, nụ cười vui tươi',
    videoFront: '/chao.mp4',
    videoSide: '/chao.mp4',
    benchmarkId: 'BM_HELLO_01',
    benchmarkLandmarksExtracted: true,
    benchmarkAccuracy: 98.4
  },
  ...VSL400_WORDS.map(w => ({
    ...w,
    benchmarkLandmarksExtracted: true,
    handShape: w.handShape || 'Bàn tay mở hoặc định hình chuẩn VSL400',
    movement: w.movement || 'Chuyển động dứt khoát theo video mẫu VSL400',
    faceExpression: w.faceExpression || 'Tự nhiên, mắt nhìn thẳng thân thiện'
  })),
  {
    id: 'w-bye',
    word: 'Tạm biệt',
    slug: 'tam_biet',
    topic: 'greeting',
    topicLabel: 'Chào hỏi',
    dialect: 'Toàn quốc',
    difficulty: 'Dễ',
    description: 'Nâng bàn tay phải lên ngang vai, lòng bàn tay hướng về phía trước, gập mở 4 ngón tay vẫy nhẹ chào tạm biệt.',
    details: 'Ký hiệu phổ biến rộng rãi, cử chỉ mở lòng bàn tay đón nhận và vẫy.',
    handShape: 'Bàn tay mở 5 ngón',
    movement: 'Vẫy gập các ngón tay 2-3 nhịp',
    faceExpression: 'Nụ cười tươi tắn, ánh mắt chia tay hẹn gặp lại',
    videoFront: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    videoSide: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    benchmarkId: 'BM_BYE_01',
    benchmarkLandmarksExtracted: true,
    benchmarkAccuracy: 99.1
  },
  {
    id: 'w-family',
    word: 'Gia đình',
    slug: 'gia_dinh',
    topic: 'family',
    topicLabel: 'Gia đình',
    dialect: 'Toàn quốc',
    difficulty: 'Khó',
    description: 'Hai bàn tay chữ F chạm đầu ngón cái và ngón trỏ vào nhau trước ngực, sau đó xoay vòng cung ra ngoài và chạm đầu ngón út lại.',
    details: 'Tượng trưng cho sự gắn kết bền chặt, trọn vẹn của tất cả các thành viên trong một mái ấm.',
    handShape: 'Hai bàn tay tạo hình chữ F',
    movement: 'Vòng tròn khép kín từ trước ngực ra ngoài',
    faceExpression: 'Hạnh phúc, ấm áp',
    videoFront: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    videoSide: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    benchmarkId: 'BM_FAMILY_01',
    benchmarkLandmarksExtracted: true,
    benchmarkAccuracy: 92.3
  },
  {
    id: 'w-alpha-a',
    word: 'Chữ cái A',
    slug: 'chu_cai_a',
    topic: 'alphabet',
    topicLabel: 'Bảng chữ cái',
    dialect: 'Toàn quốc',
    difficulty: 'Dễ',
    description: 'Nắm bàn tay lại, bốn ngón gập sát vào lòng bàn tay, ngón tay cái duỗi thẳng áp sát cạnh ngoài của ngón trỏ.',
    details: 'Chữ cái đầu tiên trong bảng chữ cái ngón tay tiếng Việt.',
    handShape: 'Nắm đấm, ngón cái áp sát ngón trỏ (Fist-A)',
    movement: 'Giữ tĩnh trước ngực cách 25cm',
    faceExpression: 'Tập trung',
    videoFront: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    videoSide: 'https://images.unsplash.com/photo-1580894732454-defbe5ff2886?auto=format&fit=crop&w=800&q=80',
    benchmarkId: 'BM_ALPHA_A',
    benchmarkLandmarksExtracted: true,
    benchmarkAccuracy: 98.9
  },
  {
    id: 'w-num-5',
    word: 'Số 5',
    slug: 'so_5',
    topic: 'numbers',
    topicLabel: 'Số đếm',
    dialect: 'Toàn quốc',
    difficulty: 'Dễ',
    description: 'Xòe cả 5 ngón tay của bàn tay phải, các ngón tách đều nhau, lòng bàn tay hướng về phía đối diện.',
    details: 'Cử chỉ biểu thị số 5 chuẩn VSL, giữ cổ tay thẳng góc 90 độ so với cẳng tay.',
    handShape: 'Mở rộng 5 ngón tay (Open-5)',
    movement: 'Giữ tĩnh ngang ngực',
    faceExpression: 'Tự tin',
    videoFront: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    videoSide: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    benchmarkId: 'BM_NUM_5',
    benchmarkLandmarksExtracted: true,
    benchmarkAccuracy: 99.3
  }
];

export const USER_PROFILE = {
  name: 'Nguyễn Minh Anh',
  email: 'minhanh.signlingo@edu.vn',
  role: 'Học viên chăm chỉ',
  streakDays: 7,
  totalXp: 1240,
  level: 4,
  levelTitle: 'Bàn Tay Giao Tiếp',
  completedWordsCount: 48,
  totalPracticeHours: 14.5,
  avgAiScore: 88.5,
  weeklyActivity: [
    { day: 'T2', xp: 180, words: 6, score: 89 },
    { day: 'T3', xp: 210, words: 8, score: 92 },
    { day: 'T4', xp: 150, words: 5, score: 84 },
    { day: 'T5', xp: 190, words: 7, score: 87 },
    { day: 'T6', xp: 240, words: 10, score: 94 },
    { day: 'T7', xp: 130, words: 4, score: 82 },
    { day: 'CN', xp: 140, words: 8, score: 91 }
  ],
  weaknesses: [
    {
      wordId: 'w-sorry',
      word: 'Xin lỗi',
      topic: 'Chào hỏi',
      avgScore: 62,
      commonError: 'Góc gập cổ tay chưa đủ 45°, xoay sai chiều kim đồng hồ',
      recommendedAction: 'Xem lại video góc nghiêng và tập cử chỉ xoay chậm'
    },
    {
      wordId: 'w-family',
      word: 'Gia đình',
      topic: 'Gia đình',
      avgScore: 68,
      commonError: 'Hai bàn tay chưa đồng bộ, khoảng cách chạm ngón út quá xa',
      recommendedAction: 'Căn chỉnh hai bàn tay cân bằng trước ngực'
    },
    {
      wordId: 'w-thanks',
      word: 'Cảm ơn',
      topic: 'Chào hỏi',
      avgScore: 71,
      commonError: 'Hạ bàn tay quá nhanh, chưa chạm sát vào cằm trước khi đưa ra',
      recommendedAction: 'Giữ cữ chạm cằm trong 0.5s rồi mới hạ tay'
    }
  ],
  recentPractices: [
    { word: 'Chào', date: 'Hôm nay, 18:30', score: 95, status: 'Xuất sắc', passed: true },
    { word: 'Cảm ơn', date: 'Hôm nay, 18:15', score: 74, status: 'Cần cải thiện', passed: true },
    { word: 'Số 5', date: 'Hôm qua, 20:10', score: 98, status: 'Hoàn hảo', passed: true },
    { word: 'Bố / Cha', date: 'Hôm qua, 19:45', score: 90, status: 'Rất tốt', passed: true },
    { word: 'Xin lỗi', date: '2 ngày trước', score: 62, status: 'Chưa đạt', passed: false }
  ]
};

export const BADGES = [
  {
    id: 'badge-alpha',
    title: 'Thành thạo Bảng chữ cái',
    desc: 'Hoàn thành 29 chữ cái ngón tay với điểm AI trung bình > 85%',
    icon: '🏆',
    unlocked: true,
    unlockedDate: '02/10/2026',
    rarity: 'Vàng'
  },
  {
    id: 'badge-streak-7',
    title: 'Chiến binh 7 ngày',
    desc: 'Duy trì chuỗi luyện tập liên tục không ngắt quãng trong 7 ngày',
    icon: '🔥',
    unlocked: true,
    unlockedDate: '09/10/2026',
    rarity: 'Cam'
  },
  {
    id: 'badge-ai-master',
    title: 'Bàn tay vàng AI 95%+',
    desc: 'Đạt điểm số AI trên 95% trong 10 bài luyện tập liên tiếp',
    icon: '🎯',
    unlocked: true,
    unlockedDate: '08/10/2026',
    rarity: 'Kim cương'
  },
  {
    id: 'badge-vocab-100',
    title: 'Bậc thầy 100 Từ Vựng',
    desc: 'Luyện tập thành công 100 từ vựng VSL trong từ điển',
    icon: '📚',
    unlocked: false,
    progress: '48/100',
    rarity: 'Bạch kim'
  },
  {
    id: 'badge-speed',
    title: 'Phản xạ Tia chớp',
    desc: 'Vượt qua 5 vòng Thử thách hành động 5s liên tiếp',
    icon: '⚡',
    unlocked: false,
    progress: '3/5',
    rarity: 'Tím'
  }
];

export const LEADERBOARD = [
  { rank: 1, name: 'Trần Bảo Ngọc', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', xp: 3450, streak: 21, badge: 'Đại kiện tướng VSL' },
  { rank: 2, name: 'Lê Hoàng Long', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', xp: 2980, streak: 14, badge: 'Chuyên gia ký hiệu' },
  { rank: 3, name: 'Phạm Thu Thảo', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', xp: 2650, streak: 12, badge: 'Đôi tay thấu cảm' },
  { rank: 4, name: 'Nguyễn Minh Anh (Bạn)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', xp: 1240, streak: 7, badge: 'Bàn tay giao tiếp', isMe: true },
  { rank: 5, name: 'Đặng Tuấn Kiệt', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', xp: 1120, streak: 5, badge: 'Học viên tiềm năng' }
];

export const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Quan sát cử chỉ trong video dưới đây và cho biết đây là từ nào?',
    videoUrl: '/chao.mp4',
    isVideo: true,
    signSymbol: '👋',
    options: ['Cảm ơn', 'Chào', 'Tạm biệt', 'Xin lỗi'],
    correctIndex: 1,
    explanation: 'Đây là ký hiệu "Chào" chuẩn Ngôn ngữ Ký hiệu Việt Nam (VSL).'
  },
  {
    id: 'q2',
    question: 'Động tác nắm bàn tay đặt nhẹ trên ngực trái (khu vực trái tim) thể hiện từ nào?',
    videoUrl: '/sign_xin_loi.jpg',
    isVideo: false,
    signSymbol: '❤️‍🩹',
    options: ['Đau ngực', 'Yêu thương', 'Xin lỗi', 'Nhớ nhung'],
    correctIndex: 2,
    explanation: 'Động tác này thể hiện lòng hối lỗi chân thành từ sâu thẳm con tim ("Xin lỗi").'
  },
  {
    id: 'q3',
    question: 'Ký hiệu bàn tay nắm lại với ngón cái áp sát cạnh ngoài ngón trỏ biểu thị chữ cái nào?',
    videoUrl: '/sign_letter_a.jpg',
    isVideo: false,
    signSymbol: '🅰️',
    options: ['Chữ cái A', 'Chữ cái B', 'Chữ cái C', 'Chữ cái D'],
    correctIndex: 0,
    explanation: 'Trong bảng chữ cái ngón tay VSL, 4 ngón nắm lại và ngón cái áp sát ngón trỏ là chữ "A".'
  },
  {
    id: 'q4',
    question: 'Cử chỉ tay chạm cằm rồi đưa nhẹ ra trước với lòng bàn tay mở biểu thị từ gì?',
    videoUrl: '/sign_cam_on.jpg',
    isVideo: false,
    signSymbol: '🙏',
    options: ['Cảm ơn', 'Ăn cơm', 'Nói chuyện', 'Hỏi tên'],
    correctIndex: 0,
    explanation: 'Đây là ký hiệu "Cảm ơn" biểu thị lòng tri ân trân trọng.'
  },
  {
    id: 'q5',
    question: 'Bàn tay mở xòe rộng cả 5 ngón hướng về phía trước biểu thị số mấy trong ký hiệu Việt Nam?',
    videoUrl: '/sign_number_five.jpg',
    isVideo: false,
    signSymbol: '✋',
    options: ['Số 1', 'Số 5', 'Số 10', 'Số 50'],
    correctIndex: 1,
    explanation: 'Xòe trọn vẹn 5 ngón tay hướng về phía trước là ký hiệu chuẩn của "Số 5".'
  }
];

export const REFLEX_CARDS = [
  { word: 'Chào', time: 5, tip: 'Chạm thái dương -> Đưa tay ra trước', difficulty: 'Dễ' },
  { word: 'Cảm ơn', time: 5, tip: 'Chạm cằm -> Hạ tay đưa thẳng ra', difficulty: 'Dễ' },
  { word: 'Số 5', time: 5, tip: 'Xòe 5 ngón tay hướng về phía trước', difficulty: 'Dễ' },
  { word: 'Tạm biệt', time: 5, tip: 'Nâng tay ngang vai và vẫy 4 ngón', difficulty: 'Dễ' },
  { word: 'Uống nước', time: 5, tip: 'Bàn tay cong chữ C nâng lên miệng', difficulty: 'Dễ' },
  { word: 'Chữ cái A', time: 5, tip: 'Nắm bàn tay, ngón cái áp ngón trỏ', difficulty: 'Trung bình' }
];

export const ADMIN_STATS = {
  totalUsers: 14280,
  activeUsersToday: 1845,
  totalWords: 350,
  benchmarkModelsExtracted: 342,
  completionRate: '84.2%',
  popularWords: [
    { word: 'Chào', practiceCount: 8940, avgScore: 92.4 },
    { word: 'Cảm ơn', practiceCount: 7620, avgScore: 78.1 },
    { word: 'Gia đình', practiceCount: 5410, avgScore: 73.5 },
    { word: 'Số 5', practiceCount: 4980, avgScore: 95.8 },
    { word: 'Phở bò', practiceCount: 3820, avgScore: 88.2 }
  ]
};
