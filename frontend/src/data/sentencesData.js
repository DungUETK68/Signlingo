import { VSL400_WORDS } from './vsl400Words';

// Định nghĩa từ "Chào" chuẩn
const CHAO_WORD = {
  id: 'vsl-chao',
  word: 'Chào',
  slug: 'chao',
  topic: 'greeting',
  topicLabel: 'Chào hỏi',
  dialect: 'Toàn quốc',
  difficulty: 'Dễ',
  description: 'Bàn tay mở 5 ngón thẳng (Open-B), đầu ngón trỏ và ngón giữa chạm nhẹ vùng thái dương rồi vươn dứt khoát ra ngoài.',
  details: 'Cử chỉ chào hỏi tiêu chuẩn và trang trọng nhất trong Ngôn ngữ Ký hiệu Việt Nam (VSL).',
  videoFront: '/chao.mp4',
  videoSide: '/chao.mp4'
};

// Helper để lấy metadata của từ theo slug
export function getWordBySlug(slug) {
  if (slug === 'chao') return CHAO_WORD;
  const found = VSL400_WORDS.find(w => w.slug === slug);
  if (found) return found;
  return {
    id: `vsl-${slug}`,
    word: slug.toUpperCase(),
    slug: slug,
    description: 'Thực hiện cử chỉ theo video mẫu chuẩn.',
    videoFront: `/vsl400_videos/${slug}_front.mp4`,
    videoSide: `/vsl400_videos/${slug}_side.mp4`
  };
}

// Danh sách các câu thường gặp trong đời sống được ghép chuẩn xác theo ngữ pháp VSL
export const VSL_SENTENCES = [
  // --- CHỦ ĐỀ 1: CHÀO HỎI & XÃ GIAO (LỄ PHÉP, LỊCH THIỆP) ---
  {
    id: 's-em-chao-anh',
    title: 'Em chào anh',
    signOrderText: 'Em + Anh + Chào',
    topic: 'greeting',
    topicLabel: 'Chào hỏi & Xã giao',
    difficulty: 'Dễ',
    duration: '5 phút',
    grammarPattern: 'Chủ thể (Em) + Đối tượng (Anh) + Hành động Chào',
    grammarExplanation: 'Trong ngữ pháp VSL, khi chào hỏi lễ phép, người điếc xác định rõ bản thân (Em) và đối tượng giao tiếp (Anh) trước khi thực hiện ký hiệu "Chào".',
    wordSlugs: ['em', 'anh', 'chao'],
    roles: ['Chủ ngữ (Người nói nhỏ tuổi)', 'Đối tượng xưng hô', 'Hành động chào hỏi']
  },
  {
    id: 's-em-cam-on-bac',
    title: 'Em cảm ơn bác',
    signOrderText: 'Em + Bác + Cảm ơn',
    topic: 'greeting',
    topicLabel: 'Chào hỏi & Xã giao',
    difficulty: 'Dễ',
    duration: '5 phút',
    grammarPattern: 'Chủ thể (Em) + Người nhận (Bác) + Động từ (Cảm ơn)',
    grammarExplanation: 'Hướng chuyển động của ký hiệu "Cảm ơn" bắt đầu từ cằm và đưa ra phía trước người đối diện (Bác), thể hiện rõ người làm ký hiệu là chủ thể tri ân.',
    wordSlugs: ['em', 'bac', 'cam_on'],
    roles: ['Chủ ngữ (Em)', 'Đối tượng tôn kính (Bác)', 'Hành động tri ân (Cảm ơn)']
  },
  {
    id: 's-em-xin-loi-co',
    title: 'Em xin lỗi cô',
    signOrderText: 'Em + Cô + Xin lỗi',
    topic: 'greeting',
    topicLabel: 'Chào hỏi & Xã giao',
    difficulty: 'Dễ',
    duration: '5 phút',
    grammarPattern: 'Chủ thể (Em) + Người nhận (Cô) + Động từ (Xin lỗi)',
    grammarExplanation: 'Xác định đối tượng xưng hô lễ phép (Cô) trước, sau đó thực hiện cử chỉ tay xoay nhẹ trước ngực trái thể hiện sự hối lỗi chân thành.',
    wordSlugs: ['em', 'co', 'xin_loi'],
    roles: ['Chủ ngữ (Em)', 'Đối tượng xưng hô (Cô)', 'Cử chỉ hối lỗi (Xin lỗi)']
  },
  {
    id: 's-bac-khoe',
    title: 'Bác có khỏe không?',
    signOrderText: 'Bác + Khỏe',
    topic: 'greeting',
    topicLabel: 'Chào hỏi & Xã giao',
    difficulty: 'Dễ',
    duration: '4 phút',
    grammarPattern: 'Chủ đề (Bác) + Trạng thái (Khỏe) [Ngữ điệu cơ thể hỏi Có/Không]',
    grammarExplanation: 'Theo ngữ pháp VSL, câu hỏi đóng (Có/Không) không cần từ "có... không" mà nêu chủ đề (Bác) trước, trạng thái (Khỏe) sau, kết hợp hơi rướn người và nét mặt nghi vấn.',
    wordSlugs: ['bac', 'khoe'],
    roles: ['Chủ đề hỏi thăm (Bác)', 'Trạng thái sức khỏe (Khỏe)']
  },

  // --- CHỦ ĐỀ 2: ẨM THỰC & BỮA ĂN (CẤU TRÚC SOV ĐẶC TRƯNG) ---
  {
    id: 's-em-an-banh-bao',
    title: 'Em ăn bánh bao',
    signOrderText: 'Em + Bánh bao + Ăn',
    topic: 'food',
    topicLabel: 'Ẩm thực & Bữa ăn',
    difficulty: 'Trung bình',
    duration: '6 phút',
    grammarPattern: 'Cấu trúc SOV: Chủ ngữ (Em) + Món ăn (Bánh bao) + Động từ (Ăn)',
    grammarExplanation: 'Quy tắc vàng ngữ pháp VSL: Trong câu đơn giản, cấu trúc là Chủ ngữ + Bổ ngữ + Động từ (SOV). Khác với tiếng Việt nói (SVO: "Em ăn bánh bao"), ký hiệu đưa sự vật/món ăn (Bánh bao) lên trước hành động (Ăn).',
    wordSlugs: ['em', 'banh_bao', 'an'],
    roles: ['Chủ ngữ (Em)', 'Món ăn / Bổ ngữ (Bánh bao)', 'Hành động (Ăn)']
  },
  {
    id: 's-bac-uong-tra',
    title: 'Bác uống trà',
    signOrderText: 'Bác + Trà + Uống',
    topic: 'food',
    topicLabel: 'Ẩm thực & Bữa ăn',
    difficulty: 'Dễ',
    duration: '5 phút',
    grammarPattern: 'Cấu trúc SOV: Chủ ngữ (Bác) + Đồ uống (Trà) + Động từ (Uống)',
    grammarExplanation: 'Nêu sự vật chính (Trà) trước, sau đó thực hiện cử chỉ đưa cốc lên miệng (Uống) để hoàn thiện vị ngữ hành động.',
    wordSlugs: ['bac', 'tra', 'uong'],
    roles: ['Chủ ngữ (Bác)', 'Thức uống / Bổ ngữ (Trà)', 'Hành động (Uống)']
  },
  {
    id: 's-anh-an-pho',
    title: 'Anh ăn phở',
    signOrderText: 'Anh + Phở + Ăn',
    topic: 'food',
    topicLabel: 'Ẩm thực & Bữa ăn',
    difficulty: 'Trung bình',
    duration: '6 phút',
    grammarPattern: 'Cấu trúc SOV: Chủ ngữ (Anh) + Bổ ngữ (Phở) + Động từ (Ăn)',
    grammarExplanation: 'Ký hiệu "Phở" miêu tả bát phở và đũa gắp, được đặt trước ký hiệu "Ăn" để làm rõ đối tượng của hành động.',
    wordSlugs: ['anh', 'pho', 'an'],
    roles: ['Chủ ngữ (Anh)', 'Món ăn (Phở)', 'Hành động (Ăn)']
  },
  {
    id: 's-chi-an-bun',
    title: 'Chị ăn bún',
    signOrderText: 'Chị + Bún + Ăn',
    topic: 'food',
    topicLabel: 'Ẩm thực & Bữa ăn',
    difficulty: 'Dễ',
    duration: '5 phút',
    grammarPattern: 'Cấu trúc SOV: Chủ ngữ (Chị) + Món ăn (Bún) + Động từ (Ăn)',
    grammarExplanation: 'Quy tắc SOV điển hình trong giao tiếp ẩm thực của người khiếm thính Việt Nam.',
    wordSlugs: ['chi', 'bun', 'an'],
    roles: ['Chủ ngữ (Chị)', 'Món ăn (Bún)', 'Hành động (Ăn)']
  },
  {
    id: 's-em-uong-sua',
    title: 'Em uống sữa',
    signOrderText: 'Em + Sữa + Uống',
    topic: 'food',
    topicLabel: 'Ẩm thực & Bữa ăn',
    difficulty: 'Dễ',
    duration: '5 phút',
    grammarPattern: 'Cấu trúc SOV: Chủ ngữ (Em) + Thức uống (Sữa) + Động từ (Uống)',
    grammarExplanation: 'Ký hiệu từ ghép/cụm từ sinh hoạt hàng ngày: Đưa sữa lên trước hành động uống.',
    wordSlugs: ['em', 'sua', 'uong'],
    roles: ['Chủ ngữ (Em)', 'Đồ uống (Sữa)', 'Hành động (Uống)']
  },
  {
    id: 's-ba-noi-uong-nuoc',
    title: 'Bà nội uống nước',
    signOrderText: 'Bà nội + Nước + Uống',
    topic: 'food',
    topicLabel: 'Ẩm thực & Bữa ăn',
    difficulty: 'Dễ',
    duration: '5 phút',
    grammarPattern: 'Cấu trúc SOV: Chủ ngữ (Bà nội) + Bổ ngữ (Nước) + Động từ (Uống)',
    grammarExplanation: 'Diễn đạt hành động chăm sóc, mời nước bà trong đời sống gia đình.',
    wordSlugs: ['ba_noi', 'nuoc', 'uong'],
    roles: ['Chủ ngữ (Bà nội)', 'Bổ ngữ (Nước)', 'Hành động (Uống)']
  },

  // --- CHỦ ĐỀ 3: GIA ĐÌNH & ĐỜI SỐNG (CHỦ ĐỀ - LỜI DẪN & RÚT GỌN) ---
  {
    id: 's-bo-me-giup-do-em',
    title: 'Bố mẹ giúp đỡ em',
    signOrderText: 'Bố + Mẹ + Em + Giúp đỡ',
    topic: 'family',
    topicLabel: 'Gia đình & Đời sống',
    difficulty: 'Trung bình',
    duration: '6 phút',
    grammarPattern: 'Chủ ngữ liên hợp (Bố, Mẹ) + Đối tượng nhận (Em) + Động từ định hướng (Giúp đỡ)',
    grammarExplanation: 'Ký hiệu "Giúp đỡ" có hướng chuyển động từ người thực hiện (Bố Mẹ) đưa về phía người được giúp (Em).',
    wordSlugs: ['bo', 'me', 'em', 'giup_do'],
    roles: ['Chủ ngữ (Bố)', 'Chủ ngữ (Mẹ)', 'Đối tượng nhận (Em)', 'Hành động tương trợ (Giúp đỡ)']
  },
  {
    id: 's-em-truong-hoc-hoc',
    title: 'Em học ở trường học',
    signOrderText: 'Em + Trường học + Học',
    topic: 'family',
    topicLabel: 'Gia đình & Đời sống',
    difficulty: 'Trung bình',
    duration: '6 phút',
    grammarPattern: 'Chủ ngữ (Em) + Địa điểm (Trường học) + Hành động (Học) [Rút gọn từ "ở"]',
    grammarExplanation: 'Quy tắc rút gọn VSL: Lược bỏ các từ hư/từ nối như "ở", "tại", chỉ giữ lại địa điểm và hành động chính.',
    wordSlugs: ['em', 'truong_hoc', 'hoc'],
    roles: ['Chủ ngữ (Em)', 'Địa điểm (Trường học)', 'Hành động (Học)']
  },
  {
    id: 's-bay-gio-em-hoc',
    title: 'Bây giờ em đi học',
    signOrderText: 'Bây giờ + Em + Học',
    topic: 'family',
    topicLabel: 'Gia đình & Đời sống',
    difficulty: 'Dễ',
    duration: '5 phút',
    grammarPattern: 'Trạng ngữ thời gian (Bây giờ) + Chủ ngữ (Em) + Hành động (Học)',
    grammarExplanation: 'Theo ngữ pháp VSL, yếu tố thời gian hoặc bối cảnh luôn được đưa lên làm "Chủ đề" ở đầu câu.',
    wordSlugs: ['bay_gio', 'em', 'hoc'],
    roles: ['Thời gian / Bối cảnh (Bây giờ)', 'Chủ ngữ (Em)', 'Hành động (Học)']
  },
  {
    id: 's-anh-benh-vien-bac-si',
    title: 'Anh làm bác sĩ ở bệnh viện',
    signOrderText: 'Anh + Bệnh viện + Bác sĩ',
    topic: 'family',
    topicLabel: 'Gia đình & Đời sống',
    difficulty: 'Trung bình',
    duration: '6 phút',
    grammarPattern: 'Chủ thể (Anh) + Nơi làm việc (Bệnh viện) + Nghề nghiệp (Bác sĩ) [Rút gọn từ "là", "ở"]',
    grammarExplanation: 'Cấu trúc Chủ đề - Lời dẫn và lược bỏ hoàn toàn trợ từ "là", "ở" để đảm bảo thông tin truyền đạt nhanh, gọn.',
    wordSlugs: ['anh', 'benh_vien', 'bac_si'],
    roles: ['Chủ thể (Anh)', 'Nơi làm việc (Bệnh viện)', 'Nghề nghiệp (Bác sĩ)']
  }
];

// Hàm lấy dữ liệu đầy đủ của câu kèm danh sách từ chi tiết
export function getSentenceById(sentenceId) {
  const sentence = VSL_SENTENCES.find(s => s.id === sentenceId);
  if (!sentence) return null;
  return {
    ...sentence,
    words: sentence.wordSlugs.map((slug, idx) => {
      const w = getWordBySlug(slug);
      return {
        ...w,
        role: sentence.roles[idx] || 'Từ thành phần'
      };
    })
  };
}

