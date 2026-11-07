// Dữ liệu mẫu chuẩn cho hệ thống Signlingo (Ngôn ngữ ký hiệu Việt Nam - VSL)
import { VSL400_WORDS } from './vsl400Words.js';

// CẤU TRÚC 12 CHUYÊN ĐỀ LỘ TRÌNH CHUẨN KHOA HỌC (VSL STANDARD CURRICULUM)
// Bao phủ toàn diện 400 từ vựng VSL và gắn kết trực tiếp 8 bài học ngữ pháp + 100 câu giao tiếp thực hành
export const TOPIC_METADATA = [
  // ==================== CẤP ĐỘ 1: CĂN BẢN (LEVEL 1 - FOUNDATION) ====================
  {
    id: 'greeting',
    title: 'Giao tiếp & Xã giao cốt lõi',
    level: 'Căn bản (Level 1)',
    levelCode: 'basic',
    icon: '👋',
    description: 'Cảm ơn, Tạm biệt, Xin lỗi, Giúp đỡ, Khỏe và các giao tiếp xã giao lịch sự chuẩn VSL400',
    color: '#0284c7',
    bgColor: '#e0f2fe',
    accentColor: '#38bdf8',
    grammarRuleId: 'rule-facial-expression',
    grammarRuleTitle: 'Quy tắc 8: Biểu cảm nét mặt & Không gian giao tiếp',
    grammarTip: 'Trong VSL, nét mặt và ánh mắt đóng vai trò như ngữ điệu giọng nói; biểu cảm chân thành khi chào hỏi, xin lỗi, cảm ơn.',
    sampleSentences: [
      { slug: 'em-cam-on-anh', title: 'Em cảm ơn anh' },
      { slug: 'em-xin-loi-co', title: 'Em xin lỗi cô' },
      { slug: 'em-xin-giup-do', title: 'Em xin được giúp đỡ' }
    ]
  },
  {
    id: 'family',
    title: 'Gia đình & Xưng hô thân thuộc',
    level: 'Căn bản (Level 1)',
    levelCode: 'basic',
    icon: '👨‍👩‍👧‍👦',
    description: 'Bố, Mẹ, Ông bà nội ngoại, Anh chị em, Con cháu và các mối quan hệ xưng hô trong gia đình',
    color: '#e11d48',
    bgColor: '#ffe4e6',
    accentColor: '#fb7185',
    grammarRuleId: 'rule-spatial-grammar',
    grammarRuleTitle: 'Quy tắc 7: Không gian ký hiệu & Điểm quy chiếu xưng hô',
    grammarTip: 'Định vị người lớn tuổi ở vị trí cao hơn và phía trước; phân biệt nhánh nội và ngoại bằng vị trí bên trái/phải.',
    sampleSentences: [
      { slug: 'bo-me-giup-do-em', title: 'Bố mẹ giúp đỡ em' },
      { slug: 'ong-noi-yeu-thuong-chau', title: 'Ông nội yêu thương cháu' },
      { slug: 'chong-yeu-thuong-vo', title: 'Chồng yêu thương vợ' }
    ]
  },
  {
    id: 'food',
    title: 'Ẩm thực & Thức uống hàng ngày',
    level: 'Căn bản (Level 1)',
    levelCode: 'basic',
    icon: '🍲',
    description: 'Ăn, Uống, Cơm, Phở, Bún, Bánh bao, Bánh mì, Thịt, Trà, Cà phê, Sữa và các món ăn quen thuộc',
    color: '#d97706',
    bgColor: '#fef3c7',
    accentColor: '#fbbf24',
    grammarRuleId: 'rule-sov',
    grammarRuleTitle: 'Quy tắc 1: Cấu trúc Chủ đề – Lời dẫn & Trật tự SOV',
    grammarTip: 'Nguyên lý cốt lõi: Luôn đưa món ăn/đồ uống lên trước động từ Ăn/Uống: [Chủ ngữ] + [Món ăn] + [Ăn/Uống].',
    sampleSentences: [
      { slug: 'anh-an-pho', title: 'Anh ăn phở' },
      { slug: 'chi-an-bun', title: 'Chị ăn bún' },
      { slug: 'bo-uong-ca-phe', title: 'Bố uống cà phê' }
    ]
  },
  {
    id: 'daily',
    title: 'Sinh hoạt & Đồ dùng cá nhân',
    level: 'Căn bản (Level 1)',
    levelCode: 'basic',
    icon: '🏠',
    description: 'Trang phục, đồ dùng gia đình, thiết bị cá nhân: Áo, Quần, Bàn, Ghế, Cửa, Đồng hồ, Điện thoại, Tiền',
    color: '#059669',
    bgColor: '#d1fae5',
    accentColor: '#34d399',
    grammarRuleId: 'rule-compound-words',
    grammarRuleTitle: 'Quy tắc 3: Từ ghép trong VSL',
    grammarTip: 'Rất nhiều từ ghép đồ dùng được tạo bằng cách lắp ghép đơn thuần các ký hiệu đơn lẻ (Cái + Bàn, Áo + Sơ mi).',
    sampleSentences: [
      { slug: 'anh-nghe-dien-thoai', title: 'Anh nghe điện thoại' },
      { slug: 'chi-chup-hinh', title: 'Chị chụp hình' },
      { slug: 'em-mua-ba-lo', title: 'Em mua chiếc ba lô' }
    ]
  },

  // ==================== CẤP ĐỘ 2: SƠ CẤP (LEVEL 2 - ELEMENTARY) ====================
  {
    id: 'actions',
    title: 'Hành động & Hoạt động tương tác',
    level: 'Sơ cấp (Level 2)',
    levelCode: 'elementary',
    icon: '⚡',
    description: 'Đi, Về, Chạy, Mở, Đóng, Cho, Lấy, Tìm, Thấy, Dừng lại và các động từ giao tiếp đời sống',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    accentColor: '#a78bfa',
    grammarRuleId: 'rule-negation',
    grammarRuleTitle: 'Quy tắc 5: Câu phủ định trong VSL',
    grammarTip: 'Từ phủ định (Không, Chưa, Không cần) đứng sau động từ hoặc ở cuối câu kết hợp động tác lắc đầu dứt khoát.',
    sampleSentences: [
      { slug: 'anh-tu-choi-uong-ruou', title: 'Anh từ chối uống rượu' },
      { slug: 'em-khong-can-mua-o-to', title: 'Anh không cần mua ô tô' },
      { slug: 'em-dung-lai-khong-chay', title: 'Em dừng lại không chạy' }
    ]
  },
  {
    id: 'time',
    title: 'Thời gian & Lịch sinh hoạt',
    level: 'Sơ cấp (Level 2)',
    levelCode: 'elementary',
    icon: '⏰',
    description: 'Hôm nay, Ngày mai, Hôm qua, Sáng, Trưa, Tối, Bây giờ, Giờ, Phút, Ngày, Tuần, Tháng, Năm',
    color: '#0891b2',
    bgColor: '#ecfeff',
    accentColor: '#22d3ee',
    grammarRuleId: 'rule-tense-time',
    grammarRuleTitle: 'Quy tắc 6: Thời gian & Thì trong VSL',
    grammarTip: 'VSL không chia động từ; luôn đặt từ chỉ thời gian ở đầu câu để xác lập khung thời gian tham chiếu cho toàn câu.',
    sampleSentences: [
      { slug: 'buoi-sang-em-thuc-day', title: 'Buổi sáng em thức dậy' },
      { slug: 'chu-nhat-em-di-cong-vien', title: 'Chủ nhật em đi công viên' },
      { slug: 'bay-gio-anh-di-lam-viec', title: 'Bây giờ anh đi làm việc' }
    ]
  },
  {
    id: 'education',
    title: 'Giáo dục, Trường học & Nghề nghiệp',
    level: 'Sơ cấp (Level 2)',
    levelCode: 'elementary',
    icon: '🎓',
    description: 'Học, Dạy, Trường học, Bảng, Bút, Sách, Báo cáo, Thầy cô, Học sinh, Sinh viên, Nghề nghiệp xã hội',
    color: '#4f46e5',
    bgColor: '#eef2ff',
    accentColor: '#818cf8',
    grammarRuleId: 'rule-noun-numeral',
    grammarRuleTitle: 'Quy tắc 2: Cấu trúc cụm từ Danh từ + Số từ',
    grammarTip: 'Khác với tiếng nói (Số từ + Danh từ), trong VSL luôn làm ký hiệu Danh từ trước rồi mới xòe ngón tay chỉ số lượng sau.',
    sampleSentences: [
      { slug: 'hoc-sinh-doc-sach', title: 'Học sinh đọc sách' },
      { slug: 'sinh-vien-viet-sach', title: 'Sinh viên viết sách' },
      { slug: 'em-hoc-o-truong-hoc', title: 'Em học ở trường học' }
    ]
  },
  {
    id: 'health',
    title: 'Y tế, Sức khỏe & Thể trạng',
    level: 'Sơ cấp (Level 2)',
    levelCode: 'elementary',
    icon: '🩺',
    description: 'Bác sĩ, Bệnh viện, Y tá, Khám bệnh, Đau, Mệt, Yếu, Thuốc và các tình huống y tế thường gặp',
    color: '#dc2626',
    bgColor: '#fee2e2',
    accentColor: '#f87171',
    grammarRuleId: 'rule-questions',
    grammarRuleTitle: 'Quy tắc 4: Câu hỏi nghi vấn trong VSL',
    grammarTip: 'Trong câu hỏi lấy thông tin, từ nghi vấn (Đâu, Bao nhiêu, Thế nào) đặt ở cuối câu kết hợp nét mặt nghi vấn.',
    sampleSentences: [
      { slug: 'bac-si-kham-benh-em', title: 'Bác sĩ khám bệnh cho em' },
      { slug: 'anh-di-benh-vien', title: 'Anh đi đến bệnh viện' },
      { slug: 'em-bi-dau', title: 'Em cảm thấy bị đau' }
    ]
  },

  // ==================== CẤP ĐỘ 3: TRUNG CẤP (LEVEL 3 - INTERMEDIATE) ====================
  {
    id: 'travel',
    title: 'Địa điểm, Giao thông & Di chuyển',
    level: 'Trung cấp (Level 3)',
    levelCode: 'intermediate',
    icon: '🚗',
    description: 'Đường phố, Chợ, Công viên, Xe máy, Xe đạp, Xe buýt, Ô tô, Máy bay, Bến xe, Thành phố',
    color: '#0284c7',
    bgColor: '#e0f2fe',
    accentColor: '#38bdf8',
    grammarRuleId: 'rule-spatial-grammar',
    grammarRuleTitle: 'Quy tắc 7: Không gian 3D & Định hướng chuyển động',
    grammarTip: 'Mô phỏng chân thực hướng di chuyển từ điểm bắt đầu đến điểm đến trong không gian hình học trước ngực.',
    sampleSentences: [
      { slug: 'em-di-nha-sach', title: 'Em đi đến nhà sách' },
      { slug: 'chu-nhat-em-di-cong-vien', title: 'Chủ nhật em đi công viên' },
      { slug: 'em-xem-rap-chieu-phim', title: 'Em đi xem phim ở rạp' }
    ]
  },
  {
    id: 'sports',
    title: 'Thể thao, Vận động & Giải trí',
    level: 'Trung cấp (Level 3)',
    levelCode: 'intermediate',
    icon: '⚽',
    description: 'Bóng đá, Bóng bàn, Bóng chuyền, Bóng rổ, Bơi lội, Điền kinh, Cầu lông, Đá cầu, Chơi cờ',
    color: '#16a34a',
    bgColor: '#dcfce7',
    accentColor: '#4ade80',
    grammarRuleId: 'rule-sov',
    grammarRuleTitle: 'Quy tắc 1: Cấu trúc diễn đạt sở thích & hoạt động',
    grammarTip: 'Môn thể thao đóng vai trò là chủ đề/bổ ngữ đưa lên trước động từ chơi: [Chủ ngữ] + [Môn thể thao] + [Chơi/Thích].',
    sampleSentences: [
      { slug: 'anh-da-bong', title: 'Anh chơi đá bóng' },
      { slug: 'chi-thich-boi-loi', title: 'Chị thích bơi lội' },
      { slug: 'anh-choi-bong-ban', title: 'Anh chơi bóng bàn' }
    ]
  },
  {
    id: 'nature',
    title: 'Thiên nhiên, Thời tiết & Động vật',
    level: 'Trung cấp (Level 3)',
    levelCode: 'intermediate',
    icon: '🌿',
    description: 'Mưa, Nắng, Gió, Bão, Cây cối, Hoa lá, Con chó, Con mèo, Con gà, Con bò, Động vật nuôi',
    color: '#0d9488',
    bgColor: '#ccfbf1',
    accentColor: '#2dd4bf',
    grammarRuleId: 'rule-compound-words',
    grammarRuleTitle: 'Quy tắc 3: Mô tả đặc tính & hình tượng loài vật',
    grammarTip: 'Ký hiệu động vật thường mô phỏng đặc trưng cơ thể (tai mèo, mỏ gà, sừng bò) kết hợp chuyển động sinh động.',
    sampleSentences: [
      { slug: 'mua-he-thoi-tiet-nong', title: 'Mùa hè thời tiết rất nóng' },
      { slug: 'mua-dong-thoi-tiet-lanh', title: 'Mùa đông thời tiết lạnh' },
      { slug: 'cong-vien-mat-me', title: 'Công viên rất mát mẻ' }
    ]
  },
  {
    id: 'emotions',
    title: 'Cảm xúc, Tính chất & Miêu tả',
    level: 'Trung cấp (Level 3)',
    levelCode: 'intermediate',
    icon: '💖',
    description: 'Vui, Buồn, Giận, Lo lắng, Yêu thương, Hạnh phúc, Đẹp, Tốt, Nhanh, Chậm, Cao, Thấp',
    color: '#db2777',
    bgColor: '#fce7f3',
    accentColor: '#f472b6',
    grammarRuleId: 'rule-facial-expression',
    grammarRuleTitle: 'Quy tắc 8: Biểu cảm nét mặt thể hiện mức độ tính từ',
    grammarTip: 'Nét mặt biểu đạt sắc thái và cường độ của tính từ: mở to mắt khi ngạc nhiên, mỉm cười khi hạnh phúc, nhíu mày khi giận.',
    sampleSentences: [
      { slug: 'banh-xeo-rat-ngon-mieng', title: 'Bánh xèo rất ngon miệng' },
      { slug: 'em-thich-mau-do', title: 'Em thích màu đỏ' },
      { slug: 'anh-thich-mau-xanh-la-cay', title: 'Anh thích màu xanh lá cây' }
    ]
  }
];

// Khởi tạo 12 chuyên đề chuẩn kết hợp toàn bộ 400 từ vựng VSL thật
export const TOPICS = TOPIC_METADATA.map((meta, topicIdx) => {
  const wordsForTopic = VSL400_WORDS.filter(w => w.topic === meta.id);
  const lessons = wordsForTopic.map((w, idx) => ({
    id: `vsl-${w.slug}`,
    wordId: `vsl-${w.slug}`,
    slug: w.slug,
    title: w.word,
    description: `Ký hiệu "${w.word}" chuẩn VSL (tay thuận: ${w.dominantHand === 'left' ? 'tay trái' : 'tay phải'}).`,
    duration: '2-3 phút',
    level: w.difficulty || 'Dễ',
    videoUrl: w.videoFront,
    videoSideUrl: w.videoSide || w.videoLeft,
    completed: topicIdx === 0 && idx < 2, // 2 bài đầu của chương 1 demo hoàn thành
    score: topicIdx === 0 && idx < 2 ? (idx === 0 ? 96 : 92) : 0
  }));

  const completedCount = lessons.filter(l => l.completed).length;

  return {
    ...meta,
    totalLessons: lessons.length,
    completedLessons: completedCount,
    lessons
  };
});

export const DICTIONARY_WORDS = [
  ...VSL400_WORDS.map(w => ({
    ...w,
    id: w.id || `vsl-${w.slug}`,
    benchmarkLandmarksExtracted: true,
    handShape: w.handShape || 'Bàn tay mở hoặc định hình chuẩn VSL400',
    movement: w.movement || 'Chuyển động dứt khoát theo video mẫu VSL400',
    faceExpression: w.faceExpression || 'Tự nhiên, mắt nhìn thẳng thân thiện'
  }))
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
    { word: 'Cảm ơn', date: 'Hôm nay, 18:30', score: 95, status: 'Xuất sắc', passed: true },
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
    videoUrl: '/vsl400_videos/cam_on_front.mp4',
    isVideo: true,
    signSymbol: '🙏',
    options: ['Cảm ơn', 'Tạm biệt', 'Xin lỗi', 'Giúp đỡ'],
    correctIndex: 0,
    explanation: 'Đây là ký hiệu "Cảm ơn" chuẩn Ngôn ngữ Ký hiệu Việt Nam (VSL).'
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
  { word: 'Cảm ơn', time: 5, tip: 'Chạm cằm -> Hạ tay đưa thẳng ra', difficulty: 'Dễ' },
  { word: 'Tạm biệt', time: 5, tip: 'Nâng tay ngang vai và vẫy 4 ngón', difficulty: 'Dễ' },
  { word: 'Bố', time: 5, tip: 'Ngón tay trỏ và cái đặt góc cằm', difficulty: 'Dễ' },
  { word: 'Mẹ', time: 5, tip: 'Ngón tay trỏ chạm nhẹ má phải', difficulty: 'Dễ' },
  { word: 'Số 5', time: 5, tip: 'Xòe 5 ngón tay hướng về phía trước', difficulty: 'Dễ' },
  { word: 'Uống nước', time: 5, tip: 'Bàn tay cong chữ C nâng lên miệng', difficulty: 'Dễ' }
];

export const ADMIN_STATS = {
  totalUsers: 14280,
  activeUsersToday: 1845,
  totalWords: 400,
  benchmarkModelsExtracted: 400,
  completionRate: '84.2%',
  popularWords: [
    { word: 'Cảm ơn', practiceCount: 8940, avgScore: 92.4 },
    { word: 'Tạm biệt', practiceCount: 7620, avgScore: 78.1 },
    { word: 'Gia đình', practiceCount: 5410, avgScore: 73.5 },
    { word: 'Số 5', practiceCount: 4980, avgScore: 95.8 },
    { word: 'Phở bò', practiceCount: 3820, avgScore: 88.2 }
  ]
};
