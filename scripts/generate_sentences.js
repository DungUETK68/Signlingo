const fs = require('fs');
const path = require('path');

const words = require('../frontend/src/data/vsl400Words.js').VSL400_WORDS;
const slugMap = new Map();
words.forEach(w => slugMap.set(w.slug, w));

const sentencesData = [
  // 1. CHÀO HỎI & GIAO TIẾP
  {
    orderIndex: 1,
    slug: 'em-cam-on-anh',
    title: 'Em cảm ơn anh',
    meaning: 'Lời cảm ơn chân thành, lễ phép của em gửi tới người anh.',
    structure: 'SOV: Chủ (Em) + Người nhận (Anh) + Động từ (Cảm ơn)',
    category: 'Chào hỏi & Giao tiếp',
    difficulty: 'Dễ',
    explanation: 'Theo quy tắc ngữ pháp VSL, khi bày tỏ sự cảm kích lễ phép, người điếc xác định rõ chủ thể (Em) và đối tượng nhận (Anh) trước, sau đó thực hiện cử chỉ Cảm ơn hướng về phía người đối diện.',
    words: [
      { slug: 'em', role: 'Chủ ngữ (Người nói nhỏ tuổi)', hint: 'Chỉ tay nhẹ vào ngực bản thân' },
      { slug: 'anh', role: 'Đối tượng tiếp nhận', hint: 'Chỉ tay hướng về phía người đối diện' },
      { slug: 'cam_on', role: 'Hành động cảm ơn', hint: 'Các ngón tay khép chạm cằm rồi đưa thẳng ra trước' }
    ]
  },
  {
    orderIndex: 2,
    slug: 'em-cam-on-bac',
    title: 'Em cảm ơn bác',
    meaning: 'Em gửi lời cảm ơn kính trọng tới bác.',
    structure: 'SOV: Chủ (Em) + Người tôn kính (Bác) + Động từ (Cảm ơn)',
    category: 'Chào hỏi & Giao tiếp',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bác được làm trước để biểu thị sự kính trọng với bậc tiền bối, sau đó động từ Cảm ơn được thực hiện với thái độ hơi cúi đầu nhẹ.',
    words: [
      { slug: 'em', role: 'Chủ ngữ (Em)', hint: 'Chỉ vào bản thân' },
      { slug: 'bac', role: 'Đối tượng kính trọng (Bác)', hint: 'Bàn tay khum chạm thái dương hoặc má tôn kính' },
      { slug: 'cam_on', role: 'Động từ tri ân (Cảm ơn)', hint: 'Tay chạm cằm đưa ra phía bác' }
    ]
  },
  {
    orderIndex: 3,
    slug: 'em-xin-loi-co',
    title: 'Em xin lỗi cô',
    meaning: 'Em nhận lỗi chân thành với cô giáo hoặc người cô.',
    structure: 'SOV: Chủ (Em) + Đối tượng (Cô) + Động từ (Xin lỗi)',
    category: 'Chào hỏi & Giao tiếp',
    difficulty: 'Dễ',
    explanation: 'Xác định đối tượng xưng hô (Cô) trước, sau đó thực hiện cử chỉ tay xoay nhẹ trước ngực trái kèm nét mặt hối lỗi chân thành.',
    words: [
      { slug: 'em', role: 'Chủ ngữ (Em)', hint: 'Chỉ vào bản thân' },
      { slug: 'co', role: 'Đối tượng xưng hô (Cô)', hint: 'Ký hiệu Cô xưng hô' },
      { slug: 'xin_loi', role: 'Cử chỉ hối lỗi (Xin lỗi)', hint: 'Nắm tay xoay nhẹ trên ngực trái' }
    ]
  },
  {
    orderIndex: 4,
    slug: 'bac-khoe',
    title: 'Bác có khỏe không?',
    meaning: 'Lời thăm hỏi ân cần về sức khỏe gửi tới bác.',
    structure: 'Câu hỏi Yes/No: Chủ đề (Bác) + Trạng thái (Khỏe) [Ngữ điệu NMMs]',
    category: 'Chào hỏi & Giao tiếp',
    difficulty: 'Dễ',
    explanation: 'Quy tắc câu hỏi Có/Không trong VSL: Không cần từ hư "có... không". Nêu Chủ đề (Bác) trước, trạng thái (Khỏe) sau, kết hợp hơi rướn đầu, nhướng mày và ánh mắt thăm dò.',
    words: [
      { slug: 'bac', role: 'Chủ đề hỏi thăm (Bác)', hint: 'Ký hiệu Bác tôn kính' },
      { slug: 'khoe', role: 'Trạng thái sức khỏe (Khỏe)', hint: 'Hai bàn tay nắm gập khuỷu dứt khoát' }
    ]
  },
  {
    orderIndex: 5,
    slug: 'anh-gioi-thieu',
    title: 'Anh xin tự giới thiệu',
    meaning: 'Anh chủ động mở lời tự giới thiệu bản thân trong giao tiếp.',
    structure: 'Chủ thể (Anh) + Động từ định hướng (Giới thiệu)',
    category: 'Chào hỏi & Giao tiếp',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Giới thiệu có bàn tay mở đưa nhẹ sang hai bên thể hiện sự rộng mở, làm quen với người đối diện.',
    words: [
      { slug: 'anh', role: 'Chủ thể (Anh)', hint: 'Chỉ tay người đối diện hoặc ngôi thứ nhất' },
      { slug: 'gioi_thieu', role: 'Hành động mở lời (Giới thiệu)', hint: 'Hai bàn tay mở hướng lòng lên mở rộng sang hai bên' }
    ]
  },

  // 2. ẨM THỰC & THỨC UỐNG
  {
    orderIndex: 6,
    slug: 'anh-an-pho',
    title: 'Anh ăn phở',
    meaning: 'Anh đang thưởng thức món phở truyền thống.',
    structure: 'SOV: Chủ (Anh) + Bổ ngữ món ăn (Phở) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Quy tắc vàng SOV trong VSL: Món ăn/sự vật chính (Phở) là chủ đề cần đưa lên trước, hành động thưởng thức (Ăn) thực hiện sau cùng.',
    words: [
      { slug: 'anh', role: 'Chủ ngữ (Anh)', hint: 'Ký hiệu Anh' },
      { slug: 'pho', role: 'Món ăn / Bổ ngữ (Phở)', hint: 'Hai tay làm cử chỉ gắp sợi phở' },
      { slug: 'an', role: 'Hành động vị ngữ (Ăn)', hint: 'Các đầu ngón tay chụm đưa vào miệng' }
    ]
  },
  {
    orderIndex: 7,
    slug: 'chi-an-bun',
    title: 'Chị ăn bún',
    meaning: 'Chị đang ăn món bún tươi thơm ngon.',
    structure: 'SOV: Chủ (Chị) + Món ăn (Bún) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bún được làm rõ trước bằng hai tay miêu tả sợi bún, tiếp nối là động từ Ăn.',
    words: [
      { slug: 'chi', role: 'Chủ ngữ (Chị)', hint: 'Ký hiệu Chị' },
      { slug: 'bun', role: 'Món ăn (Bún)', hint: 'Hai bàn tay đan sợi bún đặc trưng' },
      { slug: 'an', role: 'Hành động (Ăn)', hint: 'Đưa tay chụm vào miệng' }
    ]
  },
  {
    orderIndex: 8,
    slug: 'em-an-banh-bao',
    title: 'Em ăn bánh bao',
    meaning: 'Em đang ăn chiếc bánh bao nóng hổi.',
    structure: 'SOV: Chủ (Em) + Món ăn (Bánh bao) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Món ăn cụ thể (Bánh bao) được tạo hình khum tròn bằng hai tay trước khi làm động từ Ăn.',
    words: [
      { slug: 'em', role: 'Chủ ngữ (Em)', hint: 'Ký hiệu Em' },
      { slug: 'banh_bao', role: 'Món ăn (Bánh bao)', hint: 'Hai tay khum tròn tạo hình chiếc bánh bao' },
      { slug: 'an', role: 'Động từ (Ăn)', hint: 'Ký hiệu Ăn' }
    ]
  },
  {
    orderIndex: 9,
    slug: 'me-an-banh-xeo',
    title: 'Mẹ ăn bánh xèo',
    meaning: 'Mẹ đang thưởng thức món bánh xèo vàng giòn.',
    structure: 'SOV: Chủ (Mẹ) + Món ăn (Bánh xèo) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Trung bình',
    explanation: 'Ký hiệu Bánh xèo kết hợp hình ảnh đổ bánh tròn trên chảo, đặt trước động từ Ăn.',
    words: [
      { slug: 'me', role: 'Chủ ngữ (Mẹ)', hint: 'Ký hiệu Mẹ' },
      { slug: 'banh_xeo', role: 'Món ăn dân dã (Bánh xèo)', hint: 'Hai tay làm cử chỉ tráng chảo tròn' },
      { slug: 'an', role: 'Động từ (Ăn)', hint: 'Ký hiệu Ăn' }
    ]
  },
  {
    orderIndex: 10,
    slug: 'bac-uong-tra',
    title: 'Bác uống trà',
    meaning: 'Bác ngồi thưởng thức tách trà nóng thơm.',
    structure: 'SOV: Chủ (Bác) + Thức uống (Trà) + Động từ (Uống)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Theo trật tự VSL, danh từ chỉ chất lỏng/đồ uống (Trà) đi trước cử chỉ nâng ly (Uống).',
    words: [
      { slug: 'bac', role: 'Chủ ngữ (Bác)', hint: 'Ký hiệu Bác' },
      { slug: 'tra', role: 'Thức uống (Trà)', hint: 'Ký hiệu pha lá trà thơm' },
      { slug: 'uong', role: 'Động từ (Uống)', hint: 'Tay làm động tác cầm chén trà nâng lên miệng' }
    ]
  },
  {
    orderIndex: 11,
    slug: 'em-uong-sua',
    title: 'Em uống sữa',
    meaning: 'Em uống một ly sữa tươi bổ dưỡng.',
    structure: 'SOV: Chủ (Em) + Thức uống (Sữa) + Động từ (Uống)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Sữa (bóp nhẹ hai bàn tay mô phỏng vắt sữa) làm trước, sau đó là động tác Uống.',
    words: [
      { slug: 'em', role: 'Chủ ngữ (Em)', hint: 'Ký hiệu Em' },
      { slug: 'sua', role: 'Đồ uống (Sữa)', hint: 'Bàn tay nắm mở nhịp nhàng' },
      { slug: 'uong', role: 'Động từ (Uống)', hint: 'Cầm ly sữa uống' }
    ]
  },
  {
    orderIndex: 12,
    slug: 'bo-uong-ca-phe',
    title: 'Bố uống cà phê',
    meaning: 'Bố đang uống một ly cà phê đậm đà buổi sớm.',
    structure: 'SOV: Chủ (Bố) + Thức uống (Cà phê) + Động từ (Uống)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Cà phê (xoay nhẹ ngón tay mô phỏng khuấy thìa trong tách) đặt trước hành động Uống.',
    words: [
      { slug: 'bo', role: 'Chủ ngữ (Bố)', hint: 'Ký hiệu Bố vuốt ria mép' },
      { slug: 'ca_phe', role: 'Thức uống (Cà phê)', hint: 'Ngón tay xoay tròn khuấy thìa cà phê' },
      { slug: 'uong', role: 'Động từ (Uống)', hint: 'Nâng ly cà phê uống' }
    ]
  },

  // 3. GIA ĐÌNH & ĐỜI SỐNG
  {
    orderIndex: 13,
    slug: 'bo-me-giup-do-em',
    title: 'Bố mẹ giúp đỡ em',
    meaning: 'Bố mẹ luôn hết lòng hỗ trợ, chở che cho em.',
    structure: 'Chủ ngữ liên hợp (Bố, Mẹ) + Đối tượng (Em) + Động từ có hướng (Giúp đỡ)',
    category: 'Gia đình & Đời sống',
    difficulty: 'Trung bình',
    explanation: 'Động từ Giúp đỡ trong VSL có tính định hướng không gian: Tay đặt ngửa dưới bàn tay kia và đẩy từ vị trí Bố Mẹ hướng về phía Em.',
    words: [
      { slug: 'bo', role: 'Chủ ngữ 1 (Bố)', hint: 'Ký hiệu Bố' },
      { slug: 'me', role: 'Chủ ngữ 2 (Mẹ)', hint: 'Ký hiệu Mẹ' },
      { slug: 'em', role: 'Đối tượng nhận (Em)', hint: 'Chỉ tay vào em' },
      { slug: 'giup_do', role: 'Động từ định hướng (Giúp đỡ)', hint: 'Bàn tay đỡ đẩy hướng về phía trước' }
    ]
  },
  {
    orderIndex: 14,
    slug: 'ong-noi-yeu-thuong-chau',
    title: 'Ông nội yêu thương cháu',
    meaning: 'Tình cảm ấm áp, thương yêu của ông nội dành cho đứa cháu.',
    structure: 'Chủ thể (Ông nội) + Đối tượng (Cháu) + Động từ cảm xúc (Yêu thương)',
    category: 'Gia đình & Đời sống',
    difficulty: 'Trung bình',
    explanation: 'Cấu trúc Chủ đề - Lời dẫn: Nêu rõ Ông nội và Cháu, sau đó làm ký hiệu Yêu thương ôm trước ngực thể hiện tình cảm dạt dào.',
    words: [
      { slug: 'ong_noi', role: 'Chủ thể kính yêu (Ông nội)', hint: 'Ký hiệu râu dài và vuốt trán ông nội' },
      { slug: 'chau', role: 'Đối tượng yêu thương (Cháu)', hint: 'Ký hiệu Cháu nhỏ tuổi' },
      { slug: 'yeu_thuong', role: 'Động từ cảm xúc (Yêu thương)', hint: 'Hai tay bắt chéo ôm nhẹ trước ngực' }
    ]
  },
  {
    orderIndex: 15,
    slug: 'em-giup-do-ba-noi',
    title: 'Em giúp đỡ bà nội',
    meaning: 'Em hiếu thảo đỡ đần, chăm sóc bà nội tuổi già.',
    structure: 'Chủ (Em) + Đối tượng nhận (Bà nội) + Động từ định hướng (Giúp đỡ)',
    category: 'Gia đình & Đời sống',
    difficulty: 'Trung bình',
    explanation: 'Hướng của động từ Giúp đỡ xuất phát từ ngực của Em hướng sang phía Bà nội, thể hiện rõ vai trò chủ động tương trợ.',
    words: [
      { slug: 'em', role: 'Chủ ngữ (Em)', hint: 'Ký hiệu Em' },
      { slug: 'ba_noi', role: 'Đối tượng nhận (Bà nội)', hint: 'Ký hiệu Bà nội chống gậy hoặc búi tóc' },
      { slug: 'giup_do', role: 'Động từ định hướng (Giúp đỡ)', hint: 'Tay nâng đỡ hướng về phía bà' }
    ]
  },
  {
    orderIndex: 16,
    slug: 'me-cho-nang-em',
    title: 'Mẹ chở che cho em',
    meaning: 'Mẹ bao bọc, bảo bọc con cái trong vòng tay yêu thương.',
    structure: 'Chủ (Mẹ) + Đối tượng (Em) + Động từ che chở (Chở che / Che chở)',
    category: 'Gia đình & Đời sống',
    difficulty: 'Trung bình',
    explanation: 'Cử chỉ che chở bao bọc với hai tay ôm tròn khép lại, diễn tả tình mẫu tử thiêng liêng.',
    words: [
      { slug: 'me', role: 'Chủ ngữ (Mẹ)', hint: 'Ký hiệu Mẹ' },
      { slug: 'em', role: 'Người con (Em)', hint: 'Chỉ tay vào em' },
      { slug: 'cho_nang', role: 'Hành động che chở', hint: 'Hai bàn tay vòng che chở bảo vệ' }
    ]
  },

  // 4. GIÁO DỤC & HỌC ĐƯỜNG
  {
    orderIndex: 17,
    slug: 'hoc-sinh-doc-sach',
    title: 'Học sinh đọc sách',
    meaning: 'Các bạn học sinh đang chăm chú mở sách học bài.',
    structure: 'SOV: Chủ (Học sinh) + Vật thể (Sách) + Động từ (Đọc)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Sách (hai bàn tay mở ra như trang sách) đặt trước động từ Đọc (ngón tay trỏ quét theo dòng chữ).',
    words: [
      { slug: 'hoc_sinh', role: 'Chủ ngữ (Học sinh)', hint: 'Ký hiệu Học kết hợp người' },
      { slug: 'sach', role: 'Vật thể (Sách)', hint: 'Hai lòng bàn tay mở ngửa cạnh nhau' },
      { slug: 'doc', role: 'Động từ (Đọc)', hint: 'Hai ngón tay hướng quét trang sách' }
    ]
  },
  {
    orderIndex: 18,
    slug: 'em-hoc-o-truong-hoc',
    title: 'Em học ở trường học',
    meaning: 'Em đang theo học tại ngôi trường thân thương.',
    structure: 'Chủ (Em) + Nơi chốn (Trường học) + Hành động (Học) [Rút gọn từ "ở"]',
    category: 'Giáo dục & Học đường',
    difficulty: 'Trung bình',
    explanation: 'Quy tắc rút gọn VSL: Lược bỏ hoàn toàn giới từ "ở". Người khiếm thính chỉ cần nêu địa điểm (Trường học) rồi đến hành động (Học).',
    words: [
      { slug: 'em', role: 'Chủ ngữ (Em)', hint: 'Ký hiệu Em' },
      { slug: 'truong_hoc', role: 'Địa điểm (Trường học)', hint: 'Mái nhà và ký hiệu học' },
      { slug: 'hoc', role: 'Hành động vị ngữ (Học)', hint: 'Tay vỗ thu tri thức vào đầu' }
    ]
  },
  {
    orderIndex: 19,
    slug: 'em-lam-bai-tap',
    title: 'Em chăm chỉ làm bài tập',
    meaning: 'Em tự giác ngồi vào bàn hoàn thành bài tập về nhà.',
    structure: 'Chủ thể (Em) + Cụm hành động (Làm bài tập)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Làm bài tập mô phỏng động tác viết và tính toán trên trang vở.',
    words: [
      { slug: 'em', role: 'Chủ thể (Em)', hint: 'Ký hiệu Em' },
      { slug: 'lam_bai_tap', role: 'Hành động học tập (Làm bài tập)', hint: 'Cử chỉ tay ghi chép hoàn thành bài vở' }
    ]
  },
  {
    orderIndex: 20,
    slug: 'sinh-vien-viet-sach',
    title: 'Sinh viên viết sách',
    meaning: 'Bạn sinh viên đại học đang say mê viết công trình sách.',
    structure: 'SOV: Chủ (Sinh viên) + Bổ ngữ (Sách) + Động từ (Viết)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Trung bình',
    explanation: 'Nêu đối tượng vật chất (Sách) trước, sau đó thực hiện cử chỉ cầm bút nắn nót (Viết).',
    words: [
      { slug: 'sinh_vien', role: 'Chủ ngữ (Sinh viên)', hint: 'Ký hiệu Sinh viên trường lớn' },
      { slug: 'sach', role: 'Vật thể (Sách)', hint: 'Trang sách mở' },
      { slug: 'viet', role: 'Động từ (Viết)', hint: 'Ngón tay giả lập cầm bút viết lên lòng bàn tay kia' }
    ]
  },

  // 5. Y TẾ & BỆNH VIỆN
  {
    orderIndex: 21,
    slug: 'bac-si-kham-benh-em',
    title: 'Bác sĩ khám bệnh cho em',
    meaning: 'Bác sĩ cẩn thận thăm khám, chẩn đoán cho em.',
    structure: 'Chủ (Bác sĩ) + Bệnh nhân (Em) + Động từ định hướng (Khám bệnh)',
    category: 'Y tế & Bệnh viện',
    difficulty: 'Trung bình',
    explanation: 'Ký hiệu Khám bệnh có hướng cử chỉ từ phía Bác sĩ đưa ống nghe/bắt mạch hướng về người bệnh (Em).',
    words: [
      { slug: 'bac_si', role: 'Chủ ngữ (Bác sĩ)', hint: 'Ký hiệu Bác sĩ bắt mạch' },
      { slug: 'em', role: 'Bệnh nhân (Em)', hint: 'Ký hiệu Em' },
      { slug: 'kham_benh', role: 'Động từ định hướng (Khám bệnh)', hint: 'Cử chỉ đặt ống nghe thăm khám người bệnh' }
    ]
  },
  {
    orderIndex: 22,
    slug: 'anh-di-benh-vien',
    title: 'Anh đi đến bệnh viện',
    meaning: 'Anh chủ động di chuyển đến bệnh viện để khám sức khỏe.',
    structure: 'Chủ (Anh) + Điểm đến (Bệnh viện) + Động từ di chuyển (Đi) [Rút gọn từ "đến"]',
    category: 'Y tế & Bệnh viện',
    difficulty: 'Dễ',
    explanation: 'Lược bỏ hư từ "đến". Đưa đích đến quan trọng (Bệnh viện) lên trước hành động di chuyển (Đi).',
    words: [
      { slug: 'anh', role: 'Chủ thể (Anh)', hint: 'Ký hiệu Anh' },
      { slug: 'benh_vien', role: 'Nơi chốn (Bệnh viện)', hint: 'Ký hiệu chữ thập và tòa nhà y tế' },
      { slug: 'di', role: 'Hành động di chuyển (Đi)', hint: 'Hai ngón tay bước đi dứt khoát' }
    ]
  },
  {
    orderIndex: 23,
    slug: 'y-ta-giup-do-benh-nhan',
    title: 'Y tá giúp đỡ em',
    meaning: 'Cô y tá dịu dàng chăm sóc, hỗ trợ em trong phòng bệnh.',
    structure: 'Chủ (Y tá) + Người nhận (Em) + Động từ định hướng (Giúp đỡ)',
    category: 'Y tế & Bệnh viện',
    difficulty: 'Dễ',
    explanation: 'Bàn tay của ký hiệu Y tá định hướng cử chỉ Giúp đỡ về phía người đang cần chăm sóc.',
    words: [
      { slug: 'y_ta', role: 'Chủ ngữ (Y tá)', hint: 'Ký hiệu Y tá đội mũ chữ thập' },
      { slug: 'em', role: 'Người được giúp (Em)', hint: 'Ký hiệu Em' },
      { slug: 'giup_do', role: 'Hành động hỗ trợ (Giúp đỡ)', hint: 'Nâng tay đỡ nhẹ nhàng' }
    ]
  },

  // 6. THỜI GIAN & SINH HOẠT
  {
    orderIndex: 24,
    slug: 'buoi-sang-em-thuc-day',
    title: 'Buổi sáng em thức dậy',
    meaning: 'Bình minh lên, em thức giấc chào ngày mới đầy năng lượng.',
    structure: 'Trạng ngữ thời gian (Buổi sáng) + Chủ ngữ (Em) + Hành động (Thức dậy)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Ngữ pháp VSL ưu tiên yếu tố thời gian làm Chủ đề đặt ở đầu câu, giúp người xem định vị ngay bối cảnh của câu chuyện.',
    words: [
      { slug: 'buoi_sang', role: 'Thời gian bối cảnh (Buổi sáng)', hint: 'Bàn tay vươn lên đón mặt trời mọc' },
      { slug: 'em', role: 'Chủ ngữ (Em)', hint: 'Ký hiệu Em' },
      { slug: 'thuc_day', role: 'Hành động (Thức dậy)', hint: 'Hai ngón tay mở mắt bừng tỉnh' }
    ]
  },
  {
    orderIndex: 25,
    slug: 'buoi-toi-bo-xem-tivi',
    title: 'Buổi tối bố xem tivi',
    meaning: 'Vào buổi tối, bố thư giãn xem các chương trình truyền hình.',
    structure: 'Thời gian (Buổi tối) + Chủ (Bố) + Thiết bị (Tivi) + Động từ (Xem)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Trung bình',
    explanation: 'Thời gian (Buổi tối) đứng đầu, sau đó theo cấu trúc SOV: Bố + Tivi (bổ ngữ) + Xem (động từ).',
    words: [
      { slug: 'buoi_toi', role: 'Thời gian (Buổi tối)', hint: 'Mặt trời lặn xuống đường chân trời' },
      { slug: 'bo', role: 'Chủ ngữ (Bố)', hint: 'Ký hiệu Bố' },
      { slug: 'tivi', role: 'Thiết bị (Tivi)', hint: 'Tạo khung hình chữ nhật tivi' },
      { slug: 'xem', role: 'Động từ (Xem)', hint: 'Hai ngón tay hướng từ mắt nhìn về phía trước' }
    ]
  },
  {
    orderIndex: 26,
    slug: 'chu-nhat-em-di-cong-vien',
    title: 'Chủ nhật em đi công viên',
    meaning: 'Ngày chủ nhật rảnh rỗi, em đi dạo chơi ở công viên xanh mát.',
    structure: 'Thời gian (Chủ nhật) + Chủ (Em) + Điểm đến (Công viên) + Động từ (Đi)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Trung bình',
    explanation: 'Quy tắc Chủ đề - Lời dẫn: Nêu mốc Chủ nhật trước, điểm đến Công viên tiếp theo, và hành động Đi sau cùng.',
    words: [
      { slug: 'chu_nhat', role: 'Mốc thời gian (Chủ nhật)', hint: 'Ký hiệu ngày Chủ nhật' },
      { slug: 'em', role: 'Chủ thể (Em)', hint: 'Ký hiệu Em' },
      { slug: 'cong_vien', role: 'Địa điểm vui chơi (Công viên)', hint: 'Ký hiệu cây xanh và không gian rộng' },
      { slug: 'di', role: 'Hành động di chuyển (Đi)', hint: 'Ngón tay bước đi' }
    ]
  },
  {
    orderIndex: 27,
    slug: 'bay-gio-anh-di-lam-viec',
    title: 'Bây giờ anh đi làm việc',
    meaning: 'Đã đến giờ anh bắt đầu công việc của một ngày mới.',
    structure: 'Thời gian hiện tại (Bây giờ) + Chủ (Anh) + Hành động (Làm việc)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bây giờ (nhấn hai bàn tay xuống trước ngực) xác định tức thời mốc thời gian trước hành vi Làm việc.',
    words: [
      { slug: 'bay_gio', role: 'Thời điểm (Bây giờ)', hint: 'Hai tay gập ngón cái và trỏ nhấn nhẹ xuống' },
      { slug: 'anh', role: 'Chủ thể (Anh)', hint: 'Ký hiệu Anh' },
      { slug: 'lam_viec', role: 'Hành động lao động (Làm việc)', hint: 'Hai cổ tay gõ nhẹ vào nhau mô phỏng thao tác' }
    ]
  },

  // 7. THỂ THAO & VẬN ĐỘNG
  {
    orderIndex: 28,
    slug: 'anh-da-bong',
    title: 'Anh chơi đá bóng',
    meaning: 'Anh hăng hái ra sân tham gia trận bóng đá cùng bạn bè.',
    structure: 'Chủ (Anh) + Môn thể thao (Bóng đá) + Động từ vận động (Chạy)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bóng đá đặc tả quả bóng tròn lăn trên sân, kết hợp động tác chạy bứt tốc thể hiện tinh thần thể thao.',
    words: [
      { slug: 'anh', role: 'Chủ ngữ (Anh)', hint: 'Ký hiệu Anh' },
      { slug: 'bong_da', role: 'Môn thể thao (Bóng đá)', hint: 'Hai bàn tay đá gót mô phỏng lăn bóng' },
      { slug: 'chay', role: 'Hành động vận động (Chạy)', hint: 'Hai bàn tay nắm đánh tay sải bước' }
    ]
  },
  {
    orderIndex: 29,
    slug: 'chi-di-boi-loi',
    title: 'Chị thích bơi lội',
    meaning: 'Chị rất yêu thích môn thể thao bơi lội dưới làn nước mát.',
    structure: 'Chủ (Chị) + Môn thể thao (Bơi lội) + Cảm xúc (Thích)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Nêu sự vật/hoạt động (Bơi lội) làm bổ ngữ trước, sau đó mới thể hiện thái độ cảm xúc (Thích) ở cuối câu.',
    words: [
      { slug: 'chi', role: 'Chủ thể (Chị)', hint: 'Ký hiệu Chị' },
      { slug: 'boi_loi', role: 'Hoạt động (Bơi lội)', hint: 'Hai tay sải bơi nhịp nhàng' },
      { slug: 'thich', role: 'Thái độ cảm xúc (Thích)', hint: 'Bàn tay xoa nhẹ trước ngực mặt rạng rỡ' }
    ]
  },

  // 8. PHỦ ĐỊNH & KHƯỚC TỪ
  {
    orderIndex: 30,
    slug: 'anh-tu-choi-uong-ruou',
    title: 'Anh từ chối uống rượu',
    meaning: 'Anh kiên quyết từ chối khi được mời uống rượu để bảo vệ sức khỏe.',
    structure: 'Chủ (Anh) + Đồ uống (Rượu) + Động từ (Uống) + Hành vi phủ định (Từ chối)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Nâng cao',
    explanation: 'Quy tắc phủ định VSL: Trong ngôn ngữ nói từ "từ chối" đứng trước, nhưng trong VSL sự việc (Uống rượu) được nêu trước, ký hiệu Từ chối (gạt tay dứt khoát kết hợp lắc đầu) đặt ở CUỐI CÂU.',
    words: [
      { slug: 'anh', role: 'Chủ ngữ (Anh)', hint: 'Ký hiệu Anh' },
      { slug: 'ruou', role: 'Đồ uống có cồn (Rượu)', hint: 'Ký hiệu chai rượu nâng ly' },
      { slug: 'uong', role: 'Hành động (Uống)', hint: 'Ký hiệu Uống' },
      { slug: 'tu_choi', role: 'Yếu tố phủ định khước từ (Từ chối)', hint: 'Lòng bàn tay đẩy thẳng ra ngoài lắc đầu dứt khoát' }
    ]
  },
  {
    orderIndex: 31,
    slug: 'em-khong-nen-uong-bia',
    title: 'Em không nên uống bia',
    meaning: 'Em nhận thức rõ lứa tuổi nhỏ thì không nên dùng đồ uống có cồn.',
    structure: 'Chủ (Em) + Đồ uống (Bia) + Động từ (Uống) + Lời khuyên phủ định (Không nên)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Trung bình',
    explanation: 'Theo ngữ pháp VSL, lời khuyên phủ định "Không nên" được đưa về cuối câu sau khi đã nêu hành vi cụ thể (Uống bia).',
    words: [
      { slug: 'em', role: 'Chủ ngữ (Em)', hint: 'Ký hiệu Em' },
      { slug: 'bia', role: 'Đồ uống (Bia)', hint: 'Cử chỉ bọt bia nâng cốc' },
      { slug: 'uong', role: 'Hành động (Uống)', hint: 'Ký hiệu Uống' },
      { slug: 'khong_nen', role: 'Lời khuyên phủ định (Không nên)', hint: 'Ngón tay trỏ lắc nhẹ sang hai bên cảnh báo' }
    ]
  },
  {
    orderIndex: 32,
    slug: 'em-khong-quen-lam-bai-tap',
    title: 'Em không bao giờ quên làm bài tập',
    meaning: 'Em luôn có trách nhiệm nhớ làm bài tập đầy đủ mỗi ngày.',
    structure: 'Chủ (Em) + Việc cần làm (Làm bài tập) + Phủ định đãng trí (Không quên)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Trung bình',
    explanation: 'Đối tượng công việc (Làm bài tập) được nêu rõ, sau đó khẳng định sự ghi nhớ bằng ký hiệu Không quen/Không quên.',
    words: [
      { slug: 'em', role: 'Chủ thể (Em)', hint: 'Ký hiệu Em' },
      { slug: 'lam_bai_tap', role: 'Nhiệm vụ (Làm bài tập)', hint: 'Ký hiệu Làm bài tập' },
      { slug: 'khong_quen', role: 'Trạng thái ghi nhớ (Không quên)', hint: 'Chạm nhẹ trán rồi lắc ngón tay khẳng định nhớ' }
    ]
  },

  // 9. TÍNH TỪ & MIÊU TẢ
  {
    orderIndex: 33,
    slug: 'banh-xeo-rat-ngon-mieng',
    title: 'Bánh xèo rất ngon miệng',
    meaning: 'Món bánh xèo có hương vị giòn thơm vô cùng hấp dẫn.',
    structure: 'Chủ đề (Bánh xèo) + Tính chất vị giác (Ngon miệng) [Kèm biểu cảm thán phục]',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Quy tắc Tính từ trong VSL: Không cần từ đệm "rất". Ký hiệu Ngon miệng được nhấn mạnh bằng khóe miệng mỉm cười và cử chỉ tay dứt khoát.',
    words: [
      { slug: 'banh_xeo', role: 'Chủ đề ẩm thực (Bánh xèo)', hint: 'Ký hiệu Bánh xèo tráng chảo' },
      { slug: 'ngon_mieng', role: 'Đặc tính hương vị (Ngon miệng)', hint: 'Ngón tay quẹt nhẹ khóe môi mặt thỏa mãn' }
    ]
  },
  {
    orderIndex: 34,
    slug: 'mua-he-thoi-tiet-nong',
    title: 'Mùa hè thời tiết rất nóng bức',
    meaning: 'Thời tiết vào mùa hè oi ả với nhiệt độ tăng cao.',
    structure: 'Bối cảnh (Mùa hè) + Chủ đề (Thời tiết) + Cảm giác nhiệt (Nóng)',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Lược bỏ từ láy "nóng bức", chỉ dùng ký hiệu gốc Nóng kết hợp động tác quạt tay và nét mặt cau nhẹ vì oi nóng.',
    words: [
      { slug: 'mua_he', role: 'Thời điểm mùa vụ (Mùa hè)', hint: 'Ký hiệu ve kêu và ánh nắng hè' },
      { slug: 'thoi_tiet', role: 'Chủ đề (Thời tiết)', hint: 'Hai bàn tay mở xoay miêu tả khí hậu' },
      { slug: 'nong', role: 'Tính từ nhiệt độ (Nóng)', hint: 'Bàn tay kéo cổ áo quạt phẩy mặt nhăn vì nóng' }
    ]
  },
  {
    orderIndex: 35,
    slug: 'bac-si-tot-bung',
    title: 'Bác sĩ rất tốt bụng',
    meaning: 'Vị bác sĩ có tấm lòng nhân ái, tận tình vì người bệnh.',
    structure: 'Chủ đề (Bác sĩ) + Phẩm chất đạo đức (Tốt bụng)',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Tốt bụng đặt tay lên ngực và đưa ngón cái khen ngợi, biểu lộ sự kính trọng và cảm kích.',
    words: [
      { slug: 'bac_si', role: 'Chủ đề (Bác sĩ)', hint: 'Ký hiệu Bác sĩ' },
      { slug: 'tot_bung', role: 'Phẩm chất (Tốt bụng)', hint: 'Bàn tay mở chạm ngực rồi giơ ngón cái nở nụ cười' }
    ]
  },
  {
    orderIndex: 36,
    slug: 'em-thich-mau-do',
    title: 'Em thích màu đỏ',
    meaning: 'Em đặc biệt yêu thích màu sắc đỏ rực rỡ tươi sáng.',
    structure: 'SOV: Chủ (Em) + Bổ ngữ màu sắc (Màu đỏ) + Cảm xúc (Thích)',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Màu đỏ (bổ ngữ) đứng trước động từ Thích. Đây là câu ví dụ kinh điển trong ngữ pháp VSL minh chứng cho trật tự SOV (Tôi / Màu đỏ / Thích).',
    words: [
      { slug: 'em', role: 'Chủ ngữ (Em)', hint: 'Ký hiệu Em' },
      { slug: 'mau_do', role: 'Bổ ngữ màu sắc (Màu đỏ)', hint: 'Ngón trỏ quệt nhẹ môi đỏ' },
      { slug: 'thich', role: 'Động từ cảm xúc (Thích)', hint: 'Xoa nhẹ ngực mỉm cười tán thành' }
    ]
  }
];

// Enrich words with id, name, video, videoFront, videoSide
const enrichedSentences = sentencesData.map(s => {
  return {
    ...s,
    words: s.words.map((w, idx) => {
      const vslWord = slugMap.get(w.slug);
      return {
        id: idx + 1,
        name: vslWord ? vslWord.word : w.slug,
        slug: w.slug,
        role: w.role,
        video: `/vsl400_videos/${w.slug}_front.mp4`,
        videoFront: `/vsl400_videos/${w.slug}_front.mp4`,
        videoSide: `/vsl400_videos/${w.slug}_left.mp4`,
        hint: w.hint
      };
    })
  };
});

const outputPath = path.join(__dirname, '..', 'backend-core', 'src', 'modules', 'seed', 'vsl400-sentences-seed.json');
fs.writeFileSync(outputPath, JSON.stringify(enrichedSentences, null, 2), 'utf-8');
console.log('Successfully wrote', enrichedSentences.length, 'sentences to', outputPath);

const frontendOutputPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'sentencesData.js');
const frontendContent = `// Signlingo - Danh sách Câu thường gặp VSL
// Dữ liệu được đồng bộ trực tiếp với Backend API /api/sentences

export const VSL_SENTENCES = ${JSON.stringify(enrichedSentences, null, 2)};

export function getSentenceById(sentenceId) {
  if (!sentenceId) return null;
  const found = VSL_SENTENCES.find(s => s.id === sentenceId || s.slug === sentenceId);
  if (!found) return null;
  return {
    ...found,
    topic: found.category,
    topicLabel: found.category,
    signOrderText: found.structure,
    grammarExplanation: found.explanation,
    words: (found.words || []).map(w => ({
      ...w,
      word: w.name,
      videoFront: w.videoFront || w.video || \`/vsl400_videos/\${w.slug}_front.mp4\`,
      videoSide: w.videoSide || \`/vsl400_videos/\${w.slug}_left.mp4\`
    }))
  };
}

export function getAllSentenceCategories() {
  const cats = new Set(VSL_SENTENCES.map(s => s.category));
  return Array.from(cats);
}
`;

fs.writeFileSync(frontendOutputPath, frontendContent, 'utf-8');
console.log('Successfully wrote frontend/src/data/sentencesData.js');

