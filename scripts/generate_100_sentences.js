const fs = require('fs');
const path = require('path');

const words = require('../frontend/src/data/vsl400Words.js').VSL400_WORDS;
const slugMap = new Map();
words.forEach(w => slugMap.set(w.slug, w));

// 100 Câu giao tiếp VSL chuẩn ngữ pháp, 100% sử dụng từ vựng VSL400, TUYỆT ĐỐI KHÔNG DÙNG TỪ "CHÀO"
const sentencesData = [
  // ==========================================
  // CHỦ ĐỀ 1: GIAO TIẾP & XÃ GIAO (12 CÂU)
  // ==========================================
  {
    orderIndex: 1,
    slug: 'em-cam-on-anh',
    title: 'Em cảm ơn anh',
    meaning: 'Lời cảm kích chân thành, lễ phép của em gửi tới người anh.',
    structure: 'SOV: Chủ (Em) + Người nhận (Anh) + Động từ (Cảm ơn)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Xác định chủ thể (Em) và đối tượng nhận (Anh) trước, sau đó thực hiện cử chỉ Cảm ơn hướng về phía người đối diện.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Chỉ tay nhẹ vào ngực bản thân' },
      { slug: 'anh', role: 'Đối tượng nhận', hint: 'Chỉ tay hướng về phía người đối diện' },
      { slug: 'cam_on', role: 'Động từ', hint: 'Các ngón tay khép chạm cằm đưa thẳng ra trước' }
    ]
  },
  {
    orderIndex: 2,
    slug: 'em-cam-on-bac',
    title: 'Em cảm ơn bác',
    meaning: 'Em gửi lời cảm ơn kính trọng tới bác.',
    structure: 'SOV: Chủ (Em) + Người tôn kính (Bác) + Động từ (Cảm ơn)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bác được làm trước để biểu thị sự kính trọng, sau đó làm động từ Cảm ơn.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Chỉ vào bản thân' },
      { slug: 'bac', role: 'Đối tượng kính trọng', hint: 'Bàn tay khum chạm má tôn kính' },
      { slug: 'cam_on', role: 'Động từ tri ân', hint: 'Tay chạm cằm đưa ra phía bác' }
    ]
  },
  {
    orderIndex: 3,
    slug: 'em-cam-on-co',
    title: 'Em cảm ơn cô',
    meaning: 'Em gửi lời tri ân chân thành tới cô.',
    structure: 'SOV: Chủ (Em) + Người nhận (Cô) + Động từ (Cảm ơn)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Cô được làm trước, sau đó đưa tay từ cằm hướng về phía cô để cảm ơn.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Chỉ tay vào ngực' },
      { slug: 'co', role: 'Người nhận', hint: 'Ký hiệu Cô' },
      { slug: 'cam_on', role: 'Động từ', hint: 'Tay chạm cằm đưa ra trước' }
    ]
  },
  {
    orderIndex: 4,
    slug: 'em-xin-loi-co',
    title: 'Em xin lỗi cô',
    meaning: 'Em nhận lỗi chân thành với cô giáo hoặc người cô.',
    structure: 'SOV: Chủ (Em) + Đối tượng (Cô) + Động từ (Xin lỗi)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Xác định đối tượng xưng hô (Cô) trước, sau đó thực hiện cử chỉ tay xoay nhẹ trước ngực trái kèm nét mặt hối lỗi.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Chỉ vào bản thân' },
      { slug: 'co', role: 'Đối tượng xưng hô', hint: 'Ký hiệu Cô' },
      { slug: 'xin_loi', role: 'Động từ nhận lỗi', hint: 'Nắm tay xoay nhẹ trên ngực trái' }
    ]
  },
  {
    orderIndex: 5,
    slug: 'anh-xin-loi-em',
    title: 'Anh xin lỗi em',
    meaning: 'Anh chân thành xin lỗi người em.',
    structure: 'SOV: Chủ (Anh) + Đối tượng (Em) + Động từ (Xin lỗi)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Chủ thể Anh hướng về Em và thực hiện cử chỉ xin lỗi thể hiện thái độ hòa nhã.',
    words: [
      { slug: 'anh', role: 'Chủ ngữ', hint: 'Ký hiệu Anh' },
      { slug: 'em', role: 'Đối tượng nhận', hint: 'Ký hiệu Em' },
      { slug: 'xin_loi', role: 'Động từ', hint: 'Nắm tay xoay nhẹ trước ngực' }
    ]
  },
  {
    orderIndex: 6,
    slug: 'bac-khoe',
    title: 'Bác có khỏe không?',
    meaning: 'Lời thăm hỏi ân cần về sức khỏe gửi tới bác.',
    structure: 'Câu hỏi Yes/No: Chủ đề (Bác) + Trạng thái (Khỏe) [Ngữ điệu NMMs]',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Nêu Chủ đề (Bác) trước, trạng thái (Khỏe) sau, kết hợp hơi rướn đầu, nhướng mày và ánh mắt thăm dò.',
    words: [
      { slug: 'bac', role: 'Chủ đề thăm hỏi', hint: 'Ký hiệu Bác tôn kính' },
      { slug: 'khoe', role: 'Trạng thái sức khỏe', hint: 'Hai bàn tay nắm gập khuỷu dứt khoát' }
    ]
  },
  {
    orderIndex: 7,
    slug: 'anh-khoe',
    title: 'Anh có khỏe không?',
    meaning: 'Lời hỏi thăm sức khỏe thân mật giữa bạn bè, người quen.',
    structure: 'Câu hỏi Yes/No: Chủ đề (Anh) + Trạng thái (Khỏe) [Ngữ điệu NMMs]',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Anh kết hợp Khỏe kèm cử chỉ nhướng mày hỏi han.',
    words: [
      { slug: 'anh', role: 'Chủ đề', hint: 'Ký hiệu Anh' },
      { slug: 'khoe', role: 'Trạng thái', hint: 'Nắm tay gập khuỷu khẳng định sức khỏe' }
    ]
  },
  {
    orderIndex: 8,
    slug: 'anh-gioi-thieu',
    title: 'Anh xin tự giới thiệu',
    meaning: 'Anh chủ động mở lời tự giới thiệu bản thân trong giao tiếp.',
    structure: 'Chủ thể (Anh) + Động từ định hướng (Giới thiệu)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Giới thiệu có bàn tay mở đưa nhẹ sang hai bên thể hiện sự cởi mở làm quen.',
    words: [
      { slug: 'anh', role: 'Chủ thể', hint: 'Chỉ tay người đối diện hoặc bản thân' },
      { slug: 'gioi_thieu', role: 'Động từ', hint: 'Hai bàn tay mở hướng lòng lên đưa sang hai bên' }
    ]
  },
  {
    orderIndex: 9,
    slug: 'em-gioi-thieu-ban',
    title: 'Em giới thiệu người bạn',
    meaning: 'Em trân trọng giới thiệu người bạn của mình.',
    structure: 'Chủ (Em) + Đối tượng (Bạn) + Động từ (Giới thiệu)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Xác định người bạn trước, sau đó đưa tay giới thiệu.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'ban', role: 'Đối tượng bạn bè', hint: 'Ký hiệu Bạn' },
      { slug: 'gioi_thieu', role: 'Động từ', hint: 'Hai tay mở rộng giới thiệu' }
    ]
  },
  {
    orderIndex: 10,
    slug: 'em-dong-y',
    title: 'Em hoàn toàn đồng ý',
    meaning: 'Em bày tỏ sự đồng thuận với ý kiến vừa nêu.',
    structure: 'Chủ thể (Em) + Động từ khẳng định (Đồng ý)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Đồng ý gật đầu nhẹ kết hợp bàn tay hạ dứt khoát.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'dong_y', role: 'Khẳng định', hint: 'Ký hiệu Đồng ý' }
    ]
  },
  {
    orderIndex: 11,
    slug: 'anh-chi-noi-chuyen',
    title: 'Anh và chị đang nói chuyện',
    meaning: 'Hai anh chị đang trò chuyện tâm sự vui vẻ.',
    structure: 'Chủ thể (Anh, Chị) + Động từ giao tiếp (Nói chuyện)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Nói chuyện với hai bàn tay mở khép ngón đối diện nhau.',
    words: [
      { slug: 'anh', role: 'Chủ thể 1', hint: 'Ký hiệu Anh' },
      { slug: 'chi', role: 'Chủ thể 2', hint: 'Ký hiệu Chị' },
      { slug: 'noi_chuyen', role: 'Hành động', hint: 'Hai tay làm cử chỉ trao đổi lời nói' }
    ]
  },
  {
    orderIndex: 12,
    slug: 'em-xin-giup-do',
    title: 'Em xin được giúp đỡ',
    meaning: 'Em mong nhận được sự hỗ trợ từ mọi người.',
    structure: 'Chủ thể (Em) + Động từ cầu thị (Xin) + Hành động (Giúp đỡ)',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Trung bình',
    explanation: 'Ký hiệu Xin hai tay chắp nhẹ, sau đó là cử chỉ Giúp đỡ.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'xin', role: 'Cầu thị', hint: 'Hai lòng bàn tay khép lại trước ngực' },
      { slug: 'giup_do', role: 'Hành động', hint: 'Ký hiệu Giúp đỡ' }
    ]
  },

  // ==========================================
  // CHỦ ĐỀ 2: ẨM THỰC & THỨC UỐNG (15 CÂU)
  // ==========================================
  {
    orderIndex: 13,
    slug: 'anh-an-pho',
    title: 'Anh ăn phở',
    meaning: 'Anh đang thưởng thức món phở truyền thống.',
    structure: 'SOV: Chủ (Anh) + Bổ ngữ (Phở) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Món ăn (Phở) là chủ đề đưa lên trước, hành động Ăn thực hiện sau.',
    words: [
      { slug: 'anh', role: 'Chủ ngữ', hint: 'Ký hiệu Anh' },
      { slug: 'pho', role: 'Món ăn', hint: 'Hai tay gắp sợi phở' },
      { slug: 'an', role: 'Động từ', hint: 'Các ngón tay chụm đưa vào miệng' }
    ]
  },
  {
    orderIndex: 14,
    slug: 'chi-an-bun',
    title: 'Chị ăn bún',
    meaning: 'Chị đang ăn món bún tươi thơm ngon.',
    structure: 'SOV: Chủ (Chị) + Món ăn (Bún) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bún được làm trước, tiếp nối là động từ Ăn.',
    words: [
      { slug: 'chi', role: 'Chủ ngữ', hint: 'Ký hiệu Chị' },
      { slug: 'bun', role: 'Món ăn', hint: 'Hai tay đan sợi bún' },
      { slug: 'an', role: 'Động từ', hint: 'Đưa tay chụm vào miệng' }
    ]
  },
  {
    orderIndex: 15,
    slug: 'em-an-banh-bao',
    title: 'Em ăn bánh bao',
    meaning: 'Em đang ăn chiếc bánh bao nóng hổi.',
    structure: 'SOV: Chủ (Em) + Món ăn (Bánh bao) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bánh bao khum tròn hai tay đặt trước động từ Ăn.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Ký hiệu Em' },
      { slug: 'banh_bao', role: 'Món ăn', hint: 'Hai tay khum tròn tạo hình bánh' },
      { slug: 'an', role: 'Động từ', hint: 'Ký hiệu Ăn' }
    ]
  },
  {
    orderIndex: 16,
    slug: 'me-an-banh-xeo',
    title: 'Mẹ ăn bánh xèo',
    meaning: 'Mẹ đang thưởng thức món bánh xèo vàng giòn.',
    structure: 'SOV: Chủ (Mẹ) + Món ăn (Bánh xèo) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Trung bình',
    explanation: 'Ký hiệu Bánh xèo kết hợp hình ảnh đổ bánh tròn trên chảo, đặt trước động từ Ăn.',
    words: [
      { slug: 'me', role: 'Chủ ngữ', hint: 'Ký hiệu Mẹ' },
      { slug: 'banh_xeo', role: 'Món ăn', hint: 'Hai tay tráng chảo tròn' },
      { slug: 'an', role: 'Động từ', hint: 'Ký hiệu Ăn' }
    ]
  },
  {
    orderIndex: 17,
    slug: 'bo-an-banh-chung',
    title: 'Bố ăn bánh chưng',
    meaning: 'Bố thưởng thức bánh chưng ngày Tết.',
    structure: 'SOV: Chủ (Bố) + Món ăn (Bánh chưng) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bánh chưng gói vuông đặt trước động từ Ăn.',
    words: [
      { slug: 'bo', role: 'Chủ ngữ', hint: 'Ký hiệu Bố' },
      { slug: 'banh_chung', role: 'Món ăn', hint: 'Hai tay tạo hình khối vuông bánh chưng' },
      { slug: 'an', role: 'Động từ', hint: 'Ký hiệu Ăn' }
    ]
  },
  {
    orderIndex: 18,
    slug: 'ong-noi-an-xoi',
    title: 'Ông nội ăn xôi',
    meaning: 'Ông nội ăn đĩa xôi nếp dẻo thơm.',
    structure: 'SOV: Chủ (Ông nội) + Món ăn (Xôi) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Nêu món Xôi dẻo trước khi làm động tác Ăn.',
    words: [
      { slug: 'ong_noi', role: 'Chủ ngữ', hint: 'Ký hiệu Ông nội' },
      { slug: 'xoi', role: 'Món ăn', hint: 'Ký hiệu Xôi nếp dẻo' },
      { slug: 'an', role: 'Động từ', hint: 'Ký hiệu Ăn' }
    ]
  },
  {
    orderIndex: 19,
    slug: 'ba-noi-an-banh-tet',
    title: 'Bà nội ăn bánh tét',
    meaning: 'Bà nội thưởng thức bánh tét truyền thống.',
    structure: 'SOV: Chủ (Bà nội) + Món ăn (Bánh tét) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bánh tét hình trụ dài làm trước động từ Ăn.',
    words: [
      { slug: 'ba_noi', role: 'Chủ ngữ', hint: 'Ký hiệu Bà nội' },
      { slug: 'banh_tet', role: 'Món ăn', hint: 'Hai tay vuốt đòn bánh tét dài' },
      { slug: 'an', role: 'Động từ', hint: 'Ký hiệu Ăn' }
    ]
  },
  {
    orderIndex: 20,
    slug: 'em-an-mi-goi',
    title: 'Em ăn mì gói',
    meaning: 'Em ăn một bát mì gói ăn liền.',
    structure: 'SOV: Chủ (Em) + Món ăn (Mì gói) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Mì gói xoăn sợi đặt trước động từ Ăn.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Ký hiệu Em' },
      { slug: 'mi_goi', role: 'Món ăn', hint: 'Ký hiệu sợi mì gói xoăn' },
      { slug: 'an', role: 'Động từ', hint: 'Ký hiệu Ăn' }
    ]
  },
  {
    orderIndex: 21,
    slug: 'bac-uong-tra',
    title: 'Bác uống trà',
    meaning: 'Bác ngồi thưởng thức tách trà nóng thơm.',
    structure: 'SOV: Chủ (Bác) + Thức uống (Trà) + Động từ (Uống)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Thức uống (Trà) đi trước cử chỉ nâng ly (Uống).',
    words: [
      { slug: 'bac', role: 'Chủ ngữ', hint: 'Ký hiệu Bác' },
      { slug: 'tra', role: 'Thức uống', hint: 'Ký hiệu pha lá trà thơm' },
      { slug: 'uong', role: 'Động từ', hint: 'Cầm chén trà nâng lên miệng' }
    ]
  },
  {
    orderIndex: 22,
    slug: 'em-uong-sua',
    title: 'Em uống sữa',
    meaning: 'Em uống một ly sữa tươi bổ dưỡng.',
    structure: 'SOV: Chủ (Em) + Thức uống (Sữa) + Động từ (Uống)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Sữa làm trước, sau đó là động tác Uống.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Ký hiệu Em' },
      { slug: 'sua', role: 'Thức uống', hint: 'Bàn tay nắm mở vắt sữa' },
      { slug: 'uong', role: 'Động từ', hint: 'Cầm ly sữa uống' }
    ]
  },
  {
    orderIndex: 23,
    slug: 'bo-uong-ca-phe',
    title: 'Bố uống cà phê',
    meaning: 'Bố đang uống một ly cà phê đậm đà buổi sớm.',
    structure: 'SOV: Chủ (Bố) + Thức uống (Cà phê) + Động từ (Uống)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Cà phê khuấy thìa đặt trước hành động Uống.',
    words: [
      { slug: 'bo', role: 'Chủ ngữ', hint: 'Ký hiệu Bố' },
      { slug: 'ca_phe', role: 'Thức uống', hint: 'Ngón tay xoay tròn khuấy tách cà phê' },
      { slug: 'uong', role: 'Động từ', hint: 'Nâng ly uống' }
    ]
  },
  {
    orderIndex: 24,
    slug: 'ba-noi-uong-nuoc',
    title: 'Bà nội uống nước',
    meaning: 'Bà nội uống một cốc nước mát.',
    structure: 'SOV: Chủ (Bà nội) + Đồ uống (Nước) + Động từ (Uống)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Nước đặt ngón tay dưới cằm rồi làm cử chỉ Uống.',
    words: [
      { slug: 'ba_noi', role: 'Chủ ngữ', hint: 'Ký hiệu Bà nội' },
      { slug: 'nuoc', role: 'Thức uống', hint: 'Chạm ngón tay dưới cằm' },
      { slug: 'uong', role: 'Động từ', hint: 'Cầm cốc nước uống' }
    ]
  },
  {
    orderIndex: 25,
    slug: 'em-thich-kem',
    title: 'Em thích ăn kem',
    meaning: 'Em rất thích những cây kem que mát lạnh.',
    structure: 'Chủ (Em) + Món tráng miệng (Kem) + Cảm xúc (Thích)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Nêu món Kem trước rồi bày tỏ cảm xúc Thích.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Ký hiệu Em' },
      { slug: 'kem', role: 'Món tráng miệng', hint: 'Ký hiệu cây kem mút' },
      { slug: 'thich', role: 'Cảm xúc', hint: 'Bàn tay xoa nhẹ trước ngực' }
    ]
  },
  {
    orderIndex: 26,
    slug: 'chi-an-qua-cam',
    title: 'Chị ăn quả cam',
    meaning: 'Chị bóc quả cam mọng nước để ăn.',
    structure: 'Chủ (Chị) + Trái cây (Quả cam) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Quả cam tròn xoay bàn tay đặt trước động từ Ăn.',
    words: [
      { slug: 'chi', role: 'Chủ ngữ', hint: 'Ký hiệu Chị' },
      { slug: 'qua_cam', role: 'Trái cây', hint: 'Tay khum tròn xoay vắt cam' },
      { slug: 'an', role: 'Động từ', hint: 'Ký hiệu Ăn' }
    ]
  },
  {
    orderIndex: 27,
    slug: 'chau-an-qua-chuoi',
    title: 'Cháu ăn quả chuối',
    meaning: 'Đứa cháu đang lột vỏ quả chuối chín thơm.',
    structure: 'Chủ (Cháu) + Trái cây (Quả chuối) + Động từ (Ăn)',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu bóc vỏ chuối đặt trước cử chỉ Ăn.',
    words: [
      { slug: 'chau', role: 'Chủ ngữ', hint: 'Ký hiệu Cháu' },
      { slug: 'qua_chuoi', role: 'Trái cây', hint: 'Ngón tay lột vỏ chuối' },
      { slug: 'an', role: 'Động từ', hint: 'Ký hiệu Ăn' }
    ]
  },

  // ==========================================
  // CHỦ ĐỀ 3: GIA ĐÌNH & XƯNG HÔ (12 CÂU)
  // ==========================================
  {
    orderIndex: 28,
    slug: 'bo-me-giup-do-em',
    title: 'Bố mẹ giúp đỡ em',
    meaning: 'Bố mẹ luôn hỗ trợ, chăm lo cho em.',
    structure: 'Chủ ngữ (Bố, Mẹ) + Đối tượng (Em) + Động từ có hướng (Giúp đỡ)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Trung bình',
    explanation: 'Ký hiệu Giúp đỡ đẩy từ vị trí Bố Mẹ hướng về phía Em.',
    words: [
      { slug: 'bo', role: 'Chủ ngữ 1', hint: 'Ký hiệu Bố' },
      { slug: 'me', role: 'Chủ ngữ 2', hint: 'Ký hiệu Mẹ' },
      { slug: 'em', role: 'Đối tượng nhận', hint: 'Chỉ tay vào em' },
      { slug: 'giup_do', role: 'Động từ', hint: 'Bàn tay đỡ đẩy hướng về phía trước' }
    ]
  },
  {
    orderIndex: 29,
    slug: 'ong-noi-yeu-thuong-chau',
    title: 'Ông nội yêu thương cháu',
    meaning: 'Tình cảm ấm áp của ông nội dành cho cháu.',
    structure: 'Chủ thể (Ông nội) + Đối tượng (Cháu) + Động từ cảm xúc (Yêu thương)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Trung bình',
    explanation: 'Nêu rõ Ông nội và Cháu, sau đó ôm tay trước ngực thể hiện Yêu thương.',
    words: [
      { slug: 'ong_noi', role: 'Chủ thể', hint: 'Ký hiệu Ông nội' },
      { slug: 'chau', role: 'Đối tượng', hint: 'Ký hiệu Cháu' },
      { slug: 'yeu_thuong', role: 'Động từ', hint: 'Hai tay bắt chéo ôm trước ngực' }
    ]
  },
  {
    orderIndex: 30,
    slug: 'ba-ngoai-yeu-thuong-chau',
    title: 'Bà ngoại yêu thương cháu',
    meaning: 'Bà ngoại luôn âu yếm, yêu quý đứa cháu nhỏ.',
    structure: 'Chủ thể (Bà ngoại) + Đối tượng (Cháu) + Động từ (Yêu thương)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bà ngoại kết hợp Cháu và ôm trước ngực (Yêu thương).',
    words: [
      { slug: 'ba_ngoai', role: 'Chủ thể', hint: 'Ký hiệu Bà ngoại' },
      { slug: 'chau', role: 'Đối tượng', hint: 'Ký hiệu Cháu' },
      { slug: 'yeu_thuong', role: 'Động từ', hint: 'Hai tay chéo ôm nhẹ ngực' }
    ]
  },
  {
    orderIndex: 31,
    slug: 'ong-ngoai-cham-chi',
    title: 'Ông ngoại rất chăm chỉ',
    meaning: 'Ông ngoại luôn cần mẫn, siêng năng làm việc vườn tược.',
    structure: 'Chủ đề (Ông ngoại) + Phẩm chất (Chăm chỉ)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Ông ngoại đưa lên trước, tính từ Chăm chỉ làm sau dứt khoát.',
    words: [
      { slug: 'ong_ngoai', role: 'Chủ đề', hint: 'Ký hiệu Ông ngoại' },
      { slug: 'cham_chi', role: 'Phẩm chất', hint: 'Hai cổ tay gập chuyển động siêng năng' }
    ]
  },
  {
    orderIndex: 32,
    slug: 'em-giup-do-ba-noi',
    title: 'Em giúp đỡ bà nội',
    meaning: 'Em hiếu thảo đỡ đần, chăm sóc bà nội.',
    structure: 'Chủ (Em) + Đối tượng (Bà nội) + Động từ định hướng (Giúp đỡ)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Trung bình',
    explanation: 'Hướng của động từ Giúp đỡ từ ngực Em hướng sang Bà nội.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Ký hiệu Em' },
      { slug: 'ba_noi', role: 'Đối tượng nhận', hint: 'Ký hiệu Bà nội' },
      { slug: 'giup_do', role: 'Động từ', hint: 'Tay nâng đỡ hướng về phía bà' }
    ]
  },
  {
    orderIndex: 33,
    slug: 'me-cho-nang-em',
    title: 'Mẹ chở che cho em',
    meaning: 'Mẹ bao bọc, bảo vệ con cái trong vòng tay ấm áp.',
    structure: 'Chủ (Mẹ) + Đối tượng (Em) + Động từ (Chở che / Che chở)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Trung bình',
    explanation: 'Hai tay khum tròn bảo vệ hướng về phía người con.',
    words: [
      { slug: 'me', role: 'Chủ ngữ', hint: 'Ký hiệu Mẹ' },
      { slug: 'em', role: 'Người con', hint: 'Chỉ tay vào em' },
      { slug: 'cho_nang', role: 'Động từ', hint: 'Hai bàn tay vòng che chở bảo vệ' }
    ]
  },
  {
    orderIndex: 34,
    slug: 'chu-tot-bung',
    title: 'Chú rất tốt bụng',
    meaning: 'Người chú có tấm lòng rộng mở, nhân hậu.',
    structure: 'Chủ đề (Chú) + Phẩm chất (Tốt bụng)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Chú đặt trước, sau đó chạm ngực giơ ngón cái khen ngợi (Tốt bụng).',
    words: [
      { slug: 'chu', role: 'Chủ đề', hint: 'Ký hiệu Chú' },
      { slug: 'tot_bung', role: 'Phẩm chất', hint: 'Chạm ngực giơ ngón cái mỉm cười' }
    ]
  },
  {
    orderIndex: 35,
    slug: 'co-hien',
    title: 'Cô rất hiền lành',
    meaning: 'Cô có tính tình ôn hòa, nhân từ.',
    structure: 'Chủ đề (Cô) + Tính cách (Hiền)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Cô xưng hô kết hợp vuốt má nhẹ nhàng biểu thị nét Hiền.',
    words: [
      { slug: 'co', role: 'Chủ đề', hint: 'Ký hiệu Cô' },
      { slug: 'hien', role: 'Tính cách', hint: 'Ký hiệu vuốt má dịu dàng' }
    ]
  },
  {
    orderIndex: 36,
    slug: 'con-trai-ngoan',
    title: 'Con trai rất ngoan ngoãn',
    meaning: 'Cậu con trai luôn vâng lời và lễ độ.',
    structure: 'Chủ thể (Con trai) + Phẩm chất (Ngoan)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Dễ',
    explanation: 'Nêu Con trai trước, làm ký hiệu Ngoan vuốt cằm sau.',
    words: [
      { slug: 'con_trai', role: 'Chủ thể', hint: 'Ký hiệu Con trai' },
      { slug: 'ngoan', role: 'Phẩm chất', hint: 'Tay vuốt cằm gật đầu khen ngoan' }
    ]
  },
  {
    orderIndex: 37,
    slug: 'con-gai-dep',
    title: 'Con gái rất xinh đẹp',
    meaning: 'Cô con gái có nét mặt tươi tắn, xinh xắn.',
    structure: 'Chủ thể (Con gái) + Miêu tả (Đẹp)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Con gái kết hợp Đẹp xoay quanh gương mặt.',
    words: [
      { slug: 'con_gai', role: 'Chủ thể', hint: 'Ký hiệu Con gái' },
      { slug: 'dep', role: 'Nhan sắc', hint: 'Ngón tay xoay quanh mặt nở nụ cười' }
    ]
  },
  {
    orderIndex: 38,
    slug: 'chong-yeu-thuong-vo',
    title: 'Chồng yêu thương vợ',
    meaning: 'Người chồng luôn yêu thương, gắn bó với vợ.',
    structure: 'Chủ (Chồng) + Đối tượng (Vợ) + Động từ (Yêu thương)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Trung bình',
    explanation: 'Nêu Chồng và Vợ, sau đó ôm chéo ngực biểu đạt Yêu thương.',
    words: [
      { slug: 'chong', role: 'Chủ thể', hint: 'Ký hiệu Chồng' },
      { slug: 'vo_hoi', role: 'Đối tượng', hint: 'Ký hiệu Vợ' },
      { slug: 'yeu_thuong', role: 'Động từ', hint: 'Hai tay chéo ôm trước ngực' }
    ]
  },
  {
    orderIndex: 39,
    slug: 'ho-hang-gap-mat',
    title: 'Họ hàng nói chuyện vui vẻ',
    meaning: 'Bà con họ hàng sum họp trò chuyện rôm rả.',
    structure: 'Chủ thể (Họ hàng) + Động từ (Nói chuyện) + Cảm xúc (Cười)',
    category: 'Gia đình & Xưng hô',
    difficulty: 'Trung bình',
    explanation: 'Ký hiệu Họ hàng liên kết dòng tộc rồi làm ký hiệu Nói chuyện và Cười tươi.',
    words: [
      { slug: 'ho_hang', role: 'Chủ thể', hint: 'Ký hiệu Họ hàng' },
      { slug: 'noi_chuyen', role: 'Hành động', hint: 'Hai tay trao đổi nói chuyện' },
      { slug: 'cuoi', role: 'Cảm xúc', hint: 'Khóe môi mở rộng cười vui vẻ' }
    ]
  },

  // ==========================================
  // CHỦ ĐỀ 4: GIÁO DỤC & HỌC ĐƯỜNG (12 CÂU)
  // ==========================================
  {
    orderIndex: 40,
    slug: 'hoc-sinh-doc-sach',
    title: 'Học sinh đọc sách',
    meaning: 'Các bạn học sinh đang chăm chú mở sách học bài.',
    structure: 'SOV: Chủ (Học sinh) + Vật thể (Sách) + Động từ (Đọc)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Sách mở ra đặt trước động từ Đọc quét ngón tay.',
    words: [
      { slug: 'hoc_sinh', role: 'Chủ ngữ', hint: 'Ký hiệu Học kết hợp người' },
      { slug: 'sach', role: 'Vật thể', hint: 'Hai lòng bàn tay mở ngửa cạnh nhau' },
      { slug: 'doc', role: 'Động từ', hint: 'Ngón tay hướng quét trang sách' }
    ]
  },
  {
    orderIndex: 41,
    slug: 'em-hoc-o-truong-hoc',
    title: 'Em học ở trường học',
    meaning: 'Em đang theo học tại ngôi trường thân thương.',
    structure: 'Chủ (Em) + Nơi chốn (Trường học) + Hành động (Học) [Rút gọn từ "ở"]',
    category: 'Giáo dục & Học đường',
    difficulty: 'Trung bình',
    explanation: 'Lược bỏ hoàn toàn giới từ "ở". Nêu địa điểm (Trường học) rồi đến hành động (Học).',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Ký hiệu Em' },
      { slug: 'truong_hoc', role: 'Địa điểm', hint: 'Mái nhà và ký hiệu học' },
      { slug: 'hoc', role: 'Động từ', hint: 'Tay vỗ thu tri thức vào đầu' }
    ]
  },
  {
    orderIndex: 42,
    slug: 'em-lam-bai-tap',
    title: 'Em chăm chỉ làm bài tập',
    meaning: 'Em tự giác ngồi vào bàn hoàn thành bài tập về nhà.',
    structure: 'Chủ thể (Em) + Hành động (Làm bài tập)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Làm bài tập mô phỏng động tác viết và tính toán trên trang vở.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'lam_bai_tap', role: 'Hành động', hint: 'Cử chỉ ghi chép hoàn thành bài vở' }
    ]
  },
  {
    orderIndex: 43,
    slug: 'sinh-vien-viet-sach',
    title: 'Sinh viên viết sách',
    meaning: 'Bạn sinh viên đại học đang say mê viết công trình sách.',
    structure: 'SOV: Chủ (Sinh viên) + Bổ ngữ (Sách) + Động từ (Viết)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Trung bình',
    explanation: 'Nêu Sách trước, sau đó thực hiện cử chỉ cầm bút viết.',
    words: [
      { slug: 'sinh_vien', role: 'Chủ ngữ', hint: 'Ký hiệu Sinh viên' },
      { slug: 'sach', role: 'Vật thể', hint: 'Trang sách mở' },
      { slug: 'viet', role: 'Động từ', hint: 'Ngón tay giả lập cầm bút viết' }
    ]
  },
  {
    orderIndex: 44,
    slug: 'hoc-sinh-viet-but-bi',
    title: 'Học sinh viết bằng bút bi',
    meaning: 'Học sinh dùng bút bi để ghi bài vào vở.',
    structure: 'Chủ (Học sinh) + Dụng cụ (Bút bi) + Động từ (Viết) [Rút gọn "bằng"]',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Lược bỏ từ "bằng", nêu dụng cụ Bút bi rồi đến động tác Viết.',
    words: [
      { slug: 'hoc_sinh', role: 'Chủ ngữ', hint: 'Ký hiệu Học sinh' },
      { slug: 'but_bi', role: 'Dụng cụ', hint: 'Ký hiệu bấm ngòi bút bi' },
      { slug: 'viet', role: 'Động từ', hint: 'Cầm bút viết' }
    ]
  },
  {
    orderIndex: 45,
    slug: 'sinh-vien-hoc-truong-dai-hoc',
    title: 'Sinh viên học trường đại học',
    meaning: 'Các bạn sinh viên đang theo học tại trường đại học.',
    structure: 'Chủ (Sinh viên) + Nơi học (Trường đại học) + Hành động (Học)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Trung bình',
    explanation: 'Nêu Sinh viên, Trường đại học rồi chốt bằng động tác Học.',
    words: [
      { slug: 'sinh_vien', role: 'Chủ ngữ', hint: 'Ký hiệu Sinh viên' },
      { slug: 'truong_dai_hoc', role: 'Trường học', hint: 'Ký hiệu Trường đại học' },
      { slug: 'hoc', role: 'Động từ', hint: 'Ký hiệu Học' }
    ]
  },
  {
    orderIndex: 46,
    slug: 'hieu-truong-tot-bung',
    title: 'Thầy hiệu trưởng rất tốt bụng',
    meaning: 'Thầy hiệu trưởng luôn quan tâm, thương yêu học sinh.',
    structure: 'Chủ đề (Hiệu trưởng) + Phẩm chất (Tốt bụng)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Hiệu trưởng lãnh đạo trường kết hợp biểu đạt Tốt bụng.',
    words: [
      { slug: 'hieu_truong', role: 'Chủ đề', hint: 'Ký hiệu Hiệu trưởng' },
      { slug: 'tot_bung', role: 'Phẩm chất', hint: 'Chạm ngực giơ ngón cái khen' }
    ]
  },
  {
    orderIndex: 47,
    slug: 'hoc-sinh-dung-thuoc-ke',
    title: 'Học sinh dùng thước kẻ vẽ',
    meaning: 'Bạn học sinh dùng cây thước kẻ ngay ngắn.',
    structure: 'Chủ (Học sinh) + Dụng cụ (Thước kẻ) + Quan sát (Quan sát)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Thước kẻ đo thẳng và quan sát nắn nót.',
    words: [
      { slug: 'hoc_sinh', role: 'Chủ ngữ', hint: 'Ký hiệu Học sinh' },
      { slug: 'thuoc_ke', role: 'Dụng cụ', hint: 'Hai ngón tay kéo đường thẳng thước kẻ' },
      { slug: 'quan_sat', role: 'Hành động', hint: 'Mắt nhìn tập trung quan sát' }
    ]
  },
  {
    orderIndex: 48,
    slug: 'em-di-nha-sach',
    title: 'Em đi đến nhà sách',
    meaning: 'Em ghé nhà sách để mua thêm đồ dùng học tập.',
    structure: 'Chủ (Em) + Điểm đến (Nhà sách) + Động từ (Đi)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Điểm đến Nhà sách đưa lên trước động từ di chuyển Đi.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'nha_sach', role: 'Địa điểm', hint: 'Ký hiệu Nhà và Sách' },
      { slug: 'di', role: 'Động từ', hint: 'Ngón tay bước đi' }
    ]
  },
  {
    orderIndex: 49,
    slug: 'em-mua-ba-lo',
    title: 'Em mua chiếc ba lô',
    meaning: 'Em sắm chiếc ba lô mới để đựng sách vở đến trường.',
    structure: 'Chủ (Em) + Đồ vật (Ba lô) + Động từ (Mua)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Ba lô đeo hai quai trên vai đặt trước hành vi Mua.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'ba_lo', role: 'Đồ dùng', hint: 'Hai tay nắm hai quai ba lô trước ngực' },
      { slug: 'mua_sac', role: 'Động từ', hint: 'Tay đưa tiền mua sắm' }
    ]
  },
  {
    orderIndex: 50,
    slug: 'hoc-sinh-thong-minh',
    title: 'Học sinh rất thông minh',
    meaning: 'Các bạn học sinh tiếp thu bài rất nhanh nhạy.',
    structure: 'Chủ đề (Học sinh) + Năng lực (Thông minh)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Thông minh chạm ngón trỏ vào thái dương búng nhẹ.',
    words: [
      { slug: 'hoc_sinh', role: 'Chủ đề', hint: 'Ký hiệu Học sinh' },
      { slug: 'thong_minh', role: 'Năng lực', hint: 'Chạm ngón tay lên trán búng sáng dạ' }
    ]
  },
  {
    orderIndex: 51,
    slug: 'sinh-vien-dung-laptop',
    title: 'Sinh viên dùng máy tính xách tay',
    meaning: 'Sinh viên mở máy tính xách tay làm đồ án.',
    structure: 'Chủ (Sinh viên) + Thiết bị (Laptop) + Thao tác (Làm việc)',
    category: 'Giáo dục & Học đường',
    difficulty: 'Trung bình',
    explanation: 'Ký hiệu Laptop mở nắp gập rồi làm động tác gõ phím làm việc.',
    words: [
      { slug: 'sinh_vien', role: 'Chủ ngữ', hint: 'Ký hiệu Sinh viên' },
      { slug: 'laptop', role: 'Thiết bị', hint: 'Hai bàn tay mở nắp máy tính gập' },
      { slug: 'lam_viec', role: 'Hành động', hint: 'Hai cổ tay gõ thao tác làm việc' }
    ]
  },

  // ==========================================
  // CHỦ ĐỀ 5: Y TẾ & SỨC KHỎE (10 CÂU)
  // ==========================================
  {
    orderIndex: 52,
    slug: 'bac-si-kham-benh-em',
    title: 'Bác sĩ khám bệnh cho em',
    meaning: 'Bác sĩ cẩn thận thăm khám, chẩn đoán cho em.',
    structure: 'Chủ (Bác sĩ) + Bệnh nhân (Em) + Động từ có hướng (Khám bệnh)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Trung bình',
    explanation: 'Cử chỉ Khám bệnh hướng từ phía Bác sĩ sang người bệnh (Em).',
    words: [
      { slug: 'bac_si', role: 'Chủ ngữ', hint: 'Ký hiệu Bác sĩ bắt mạch' },
      { slug: 'em', role: 'Bệnh nhân', hint: 'Ký hiệu Em' },
      { slug: 'kham_benh', role: 'Động từ', hint: 'Cử chỉ đặt ống nghe thăm khám' }
    ]
  },
  {
    orderIndex: 53,
    slug: 'anh-di-benh-vien',
    title: 'Anh đi đến bệnh viện',
    meaning: 'Anh chủ động di chuyển đến bệnh viện để khám sức khỏe.',
    structure: 'Chủ (Anh) + Điểm đến (Bệnh viện) + Động từ (Đi)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Dễ',
    explanation: 'Điểm đến Bệnh viện đưa lên trước hành động di chuyển Đi.',
    words: [
      { slug: 'anh', role: 'Chủ thể', hint: 'Ký hiệu Anh' },
      { slug: 'benh_vien', role: 'Nơi chốn', hint: 'Ký hiệu chữ thập và tòa nhà y tế' },
      { slug: 'di', role: 'Động từ', hint: 'Ngón tay bước đi' }
    ]
  },
  {
    orderIndex: 54,
    slug: 'y-ta-giup-do-em',
    title: 'Y tá giúp đỡ em',
    meaning: 'Cô y tá dịu dàng chăm sóc, hỗ trợ em.',
    structure: 'Chủ (Y tá) + Người nhận (Em) + Động từ (Giúp đỡ)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Dễ',
    explanation: 'Bàn tay của Y tá định hướng cử chỉ Giúp đỡ về phía Em.',
    words: [
      { slug: 'y_ta', role: 'Chủ ngữ', hint: 'Ký hiệu Y tá mũ chữ thập' },
      { slug: 'em', role: 'Người nhận', hint: 'Ký hiệu Em' },
      { slug: 'giup_do', role: 'Động từ', hint: 'Nâng tay đỡ nhẹ nhàng' }
    ]
  },
  {
    orderIndex: 55,
    slug: 'em-bi-dau',
    title: 'Em cảm thấy bị đau',
    meaning: 'Em đang bị đau nhức trên người.',
    structure: 'Chủ (Em) + Trạng thái cảm giác (Cảm thấy) + Triệu chứng (Đau)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Đau nhăn mặt nhói ngón tay xoắn nhẹ.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'cam_thay', role: 'Cảm giác', hint: 'Ngón giữa chạm ngực cảm nhận' },
      { slug: 'dau', role: 'Triệu chứng', hint: 'Ngón tay xoắn nhói mặt nhăn vì đau' }
    ]
  },
  {
    orderIndex: 56,
    slug: 'em-rua-tay-sach-se',
    title: 'Em rửa tay sạch sẽ',
    meaning: 'Em xoa xà phòng rửa tay sạch bong phòng bệnh.',
    structure: 'Chủ (Em) + Hành động (Rửa tay) + Trạng thái (Sạch sẽ)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Rửa tay xoa hai lòng bàn tay rồi làm ký hiệu Sạch sẽ.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'rua_tay', role: 'Hành động', hint: 'Hai bàn tay xoa xà phòng rửa tay' },
      { slug: 'sach_se', role: 'Trạng thái', hint: 'Bàn tay quét phẳng thanh thoát sạch bóng' }
    ]
  },
  {
    orderIndex: 57,
    slug: 'bac-si-tot-bung',
    title: 'Bác sĩ rất tốt bụng',
    meaning: 'Vị bác sĩ có tấm lòng nhân ái, tận tình vì bệnh nhân.',
    structure: 'Chủ đề (Bác sĩ) + Phẩm chất (Tốt bụng)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bác sĩ đặt tay lên ngực và giơ ngón cái khen ngợi.',
    words: [
      { slug: 'bac_si', role: 'Chủ đề', hint: 'Ký hiệu Bác sĩ' },
      { slug: 'tot_bung', role: 'Phẩm chất', hint: 'Chạm ngực giơ ngón cái mỉm cười' }
    ]
  },
  {
    orderIndex: 58,
    slug: 'em-met-nghi-ngoi',
    title: 'Em thấy mệt nên nghỉ ngơi',
    meaning: 'Cơ thể mỏi mệt nên em dừng lại nghỉ một lát.',
    structure: 'Chủ (Em) + Trạng thái (Mệt) + Hành động (Nghỉ ngơi)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Dễ',
    explanation: 'Nêu trạng thái Mệt trước rồi làm cử chỉ Nghỉ ngơi thả lỏng hai vai.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'met', role: 'Trạng thái', hint: 'Hai tay hạ buông thở dài vì mệt' },
      { slug: 'nghi_ngoi', role: 'Hành động', hint: 'Hai tay buông nhẹ thư giãn' }
    ]
  },
  {
    orderIndex: 59,
    slug: 'ba-noi-khoe-manh',
    title: 'Bà nội khỏe mạnh',
    meaning: 'Bà nội tuy cao tuổi nhưng sức khỏe vẫn dẻo dai.',
    structure: 'Chủ đề (Bà nội) + Sức khỏe (Khỏe) + Cường độ (Mạnh)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Khỏe gập khuỷu tay kết hợp nhấn mạnh sức Mạnh.',
    words: [
      { slug: 'ba_noi', role: 'Chủ đề', hint: 'Ký hiệu Bà nội' },
      { slug: 'khoe', role: 'Sức khỏe', hint: 'Gập khuỷu tay dứt khoát' },
      { slug: 'manh', role: 'Cường độ', hint: 'Hai nắm tay siết dũng mãnh' }
    ]
  },
  {
    orderIndex: 60,
    slug: 'ong-noi-di-benh-vien',
    title: 'Ông nội đi bệnh viện khám',
    meaning: 'Ông nội đi tới bệnh viện định kỳ kiểm tra sức khỏe.',
    structure: 'Chủ (Ông nội) + Nơi chốn (Bệnh viện) + Động từ (Đi)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Dễ',
    explanation: 'Nêu Ông nội và Bệnh viện rồi làm ký hiệu Đi.',
    words: [
      { slug: 'ong_noi', role: 'Chủ ngữ', hint: 'Ký hiệu Ông nội' },
      { slug: 'benh_vien', role: 'Địa điểm', hint: 'Ký hiệu Bệnh viện chữ thập' },
      { slug: 'di', role: 'Động từ', hint: 'Ngón tay bước đi' }
    ]
  },
  {
    orderIndex: 61,
    slug: 'em-tam-rua-sach-se',
    title: 'Em tắm rửa sạch sẽ',
    meaning: 'Em tắm gội mát mẻ và sạch sẽ sau một ngày dài.',
    structure: 'Chủ (Em) + Vệ sinh (Tắm rửa) + Kết quả (Sạch sẽ)',
    category: 'Y tế & Sức khỏe',
    difficulty: 'Dễ',
    explanation: 'Cử chỉ Tắm rửa dội nước rồi làm ký hiệu Sạch sẽ.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'tam_rua', role: 'Vệ sinh', hint: 'Hai tay chà nhẹ hai vai tắm' },
      { slug: 'sach_se', role: 'Kết quả', hint: 'Ký hiệu Sạch sẽ sáng sủa' }
    ]
  },

  // ==========================================
  // CHỦ ĐỀ 6: THỜI GIAN & SINH HOẠT (13 CÂU)
  // ==========================================
  {
    orderIndex: 62,
    slug: 'buoi-sang-em-thuc-day',
    title: 'Buổi sáng em thức dậy',
    meaning: 'Bình minh lên, em thức giấc đón ngày mới đầy năng lượng.',
    structure: 'Thời gian (Buổi sáng) + Chủ ngữ (Em) + Hành động (Thức dậy)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Thời gian làm Chủ đề đặt ở đầu câu, sau đó là người và hành vi Thức dậy.',
    words: [
      { slug: 'buoi_sang', role: 'Thời gian bối cảnh', hint: 'Bàn tay vươn lên đón mặt trời mọc' },
      { slug: 'em', role: 'Chủ ngữ', hint: 'Ký hiệu Em' },
      { slug: 'thuc_day', role: 'Hành động', hint: 'Hai ngón tay mở mắt bừng tỉnh' }
    ]
  },
  {
    orderIndex: 63,
    slug: 'buoi-toi-bo-xem-tivi',
    title: 'Buổi tối bố xem tivi',
    meaning: 'Vào buổi tối, bố thư giãn xem truyền hình.',
    structure: 'Thời gian (Buổi tối) + Chủ (Bố) + Thiết bị (Tivi) + Động từ (Xem)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Trung bình',
    explanation: 'Thời gian (Buổi tối) đứng đầu, sau đó theo cấu trúc SOV: Bố + Tivi + Xem.',
    words: [
      { slug: 'buoi_toi', role: 'Thời gian', hint: 'Mặt trời lặn xuống đường chân trời' },
      { slug: 'bo', role: 'Chủ ngữ', hint: 'Ký hiệu Bố' },
      { slug: 'tivi', role: 'Thiết bị', hint: 'Khung hình chữ nhật tivi' },
      { slug: 'xem', role: 'Động từ', hint: 'Hai ngón tay hướng từ mắt nhìn' }
    ]
  },
  {
    orderIndex: 64,
    slug: 'chu-nhat-em-di-cong-vien',
    title: 'Chủ nhật em đi công viên',
    meaning: 'Ngày chủ nhật rảnh rỗi, em đi dạo chơi ở công viên.',
    structure: 'Thời gian (Chủ nhật) + Chủ (Em) + Điểm đến (Công viên) + Động từ (Đi)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Trung bình',
    explanation: 'Mốc Chủ nhật trước, điểm đến Công viên tiếp theo, và hành động Đi sau cùng.',
    words: [
      { slug: 'chu_nhat', role: 'Mốc thời gian', hint: 'Ký hiệu Chủ nhật' },
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'cong_vien', role: 'Địa điểm', hint: 'Ký hiệu cây xanh không gian rộng' },
      { slug: 'di', role: 'Động từ', hint: 'Ngón tay bước đi' }
    ]
  },
  {
    orderIndex: 65,
    slug: 'bay-gio-anh-di-lam-viec',
    title: 'Bây giờ anh đi làm việc',
    meaning: 'Đã đến giờ anh bắt đầu công việc của một ngày mới.',
    structure: 'Thời gian (Bây giờ) + Chủ (Anh) + Hành động (Làm việc)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Bây giờ nhấn hai bàn tay xuống trước ngực xác định thời điểm tức thời.',
    words: [
      { slug: 'bay_gio', role: 'Thời điểm', hint: 'Hai tay gập ngón cái và trỏ nhấn nhẹ xuống' },
      { slug: 'anh', role: 'Chủ thể', hint: 'Ký hiệu Anh' },
      { slug: 'lam_viec', role: 'Hành động', hint: 'Hai cổ tay gõ thao tác lao động' }
    ]
  },
  {
    orderIndex: 66,
    slug: 'buoi-trua-em-ngu',
    title: 'Buổi trưa em ngủ trưa',
    meaning: 'Buổi trưa em chợp mắt ngủ một giấc ngắn lấy lại sức.',
    structure: 'Thời gian (Buổi trưa) + Chủ (Em) + Hành động (Ngủ)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Thời gian Buổi trưa đưa lên đầu câu, kết thúc bằng ký hiệu Ngủ áp má nghiêng đầu.',
    words: [
      { slug: 'buoi_trua', role: 'Thời gian', hint: 'Mặt trời đứng bóng trên đỉnh đầu' },
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'ngu', role: 'Hành động', hint: 'Áp lòng bàn tay vào má nghiêng đầu ngủ' }
    ]
  },
  {
    orderIndex: 67,
    slug: 'buoi-chieu-me-nau-an',
    title: 'Buổi chiều mẹ nấu ăn',
    meaning: 'Vào buổi chiều, mẹ chuẩn bị bữa cơm nóng sốt.',
    structure: 'Thời gian (Buổi chiều) + Chủ (Mẹ) + Hành động (Nấu)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Buổi chiều đứng đầu, theo sau là người mẹ và động tác Nấu nướng.',
    words: [
      { slug: 'buoi_chieu', role: 'Thời gian', hint: 'Mặt trời xế tà buông dần' },
      { slug: 'me', role: 'Chủ ngữ', hint: 'Ký hiệu Mẹ' },
      { slug: 'nau', role: 'Hành động', hint: 'Cử chỉ đảo xào nấu nướng thức ăn' }
    ]
  },
  {
    orderIndex: 68,
    slug: 'thu-hai-em-di-hoc',
    title: 'Thứ hai em đi học',
    meaning: 'Ngày thứ hai đầu tuần em hào hứng cắp sách đến trường.',
    structure: 'Thời gian (Thứ hai) + Chủ (Em) + Hoạt động (Học) + Di chuyển (Đi)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Thứ hai làm mốc thời gian dẫn đầu câu.',
    words: [
      { slug: 'thu_hai', role: 'Thời gian', hint: 'Ký hiệu ngón tay số 2 ngày Thứ hai' },
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'hoc', role: 'Học tập', hint: 'Ký hiệu Học' },
      { slug: 'di', role: 'Di chuyển', hint: 'Ký hiệu Đi' }
    ]
  },
  {
    orderIndex: 69,
    slug: 'thu-bay-em-giat-do',
    title: 'Thứ bảy em giặt đồ',
    meaning: 'Thứ bảy cuối tuần em giặt giũ quần áo gọn gàng.',
    structure: 'Thời gian (Thứ bảy) + Chủ (Em) + Việc nhà (Giặt đồ)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Mốc Thứ bảy mở đầu, sau đó làm cử chỉ vò giặt quần áo.',
    words: [
      { slug: 'thu_bay', role: 'Thời gian', hint: 'Ký hiệu ngày Thứ bảy' },
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'giat_do', role: 'Hành động', hint: 'Hai bàn tay nắm vò quần áo giặt giũ' }
    ]
  },
  {
    orderIndex: 70,
    slug: 'me-phoi-do',
    title: 'Mẹ phơi đồ ngoài sân',
    meaning: 'Mẹ mang quần áo vừa giặt ra phơi dưới ánh nắng.',
    structure: 'Chủ (Mẹ) + Hành động (Phơi đồ)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Phơi đồ nâng hai tay móc quần áo lên dây phơi.',
    words: [
      { slug: 'me', role: 'Chủ thể', hint: 'Ký hiệu Mẹ' },
      { slug: 'phoi_do', role: 'Hành động', hint: 'Hai tay nâng móc quần áo lên sào' }
    ]
  },
  {
    orderIndex: 71,
    slug: 'em-rua-chen',
    title: 'Em rửa chén bát sau bữa cơm',
    meaning: 'Ăn xong, em phụ rửa sạch sẽ chén bát.',
    structure: 'Chủ (Em) + Việc nhà (Rửa chén)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Tay trái đỡ lòng bát, tay phải xoay tròn rửa chén.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'rua_chen', role: 'Hành động', hint: 'Bàn tay xoay cọ rửa bát đĩa' }
    ]
  },
  {
    orderIndex: 72,
    slug: 'anh-nghe-dien-thoai',
    title: 'Anh nghe điện thoại',
    meaning: 'Có chuông gọi đến, anh cầm điện thoại lên nghe.',
    structure: 'Chủ (Anh) + Thiết bị (Điện thoại) + Động từ (Nghe)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu ngón cái và ngón út tạo hình ống nghe áp sát tai.',
    words: [
      { slug: 'anh', role: 'Chủ ngữ', hint: 'Ký hiệu Anh' },
      { slug: 'dien_thoai', role: 'Thiết bị', hint: 'Tay tạo hình ống nghe áp tai' },
      { slug: 'nghe', role: 'Động từ', hint: 'Ngón tay trỏ chỉ vào tai nghe' }
    ]
  },
  {
    orderIndex: 73,
    slug: 'chi-chup-hinh',
    title: 'Chị chụp hình lưu niệm',
    meaning: 'Chị giơ máy ảnh lên bấm chụp bức hình đẹp.',
    structure: 'Chủ (Chị) + Hành động (Chụp hình)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Dễ',
    explanation: 'Hai tay cầm máy ảnh và ngón trỏ bấm nút chụp.',
    words: [
      { slug: 'chi', role: 'Chủ thể', hint: 'Ký hiệu Chị' },
      { slug: 'chup_hinh', role: 'Hành động', hint: 'Hai tay giữ máy bấm ngón trỏ chụp' }
    ]
  },
  {
    orderIndex: 74,
    slug: 'em-xem-rap-chieu-phim',
    title: 'Em đi xem phim ở rạp chiếu phim',
    meaning: 'Em cùng bạn tới rạp chiếu phim thưởng thức bộ phim mới.',
    structure: 'Chủ (Em) + Địa điểm (Rạp chiếu phim) + Động từ (Xem)',
    category: 'Thời gian & Sinh hoạt',
    difficulty: 'Trung bình',
    explanation: 'Rạp chiếu phim đưa lên trước hành động Xem.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'rap_chieu_phim', role: 'Địa điểm', hint: 'Ký hiệu màn ảnh rộng rạp phim' },
      { slug: 'xem', role: 'Động từ', hint: 'Ký hiệu Xem' }
    ]
  },

  // ==========================================
  // CHỦ ĐỀ 7: THỂ THAO & VẬN ĐỘNG (10 CÂU)
  // ==========================================
  {
    orderIndex: 75,
    slug: 'anh-da-bong',
    title: 'Anh chơi đá bóng',
    meaning: 'Anh hăng hái ra sân tham gia trận bóng đá cùng bạn bè.',
    structure: 'Chủ (Anh) + Môn thể thao (Bóng đá) + Động từ (Chạy)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Bóng đá đặc tả quả bóng tròn lăn, kết hợp chạy bứt tốc thể thao.',
    words: [
      { slug: 'anh', role: 'Chủ ngữ', hint: 'Ký hiệu Anh' },
      { slug: 'bong_da', role: 'Môn thể thao', hint: 'Hai bàn tay đá gót mô phỏng bóng lăn' },
      { slug: 'chay', role: 'Động từ', hint: 'Hai bàn tay nắm đánh tay sải bước' }
    ]
  },
  {
    orderIndex: 76,
    slug: 'chi-thich-boi-loi',
    title: 'Chị thích bơi lội',
    meaning: 'Chị rất yêu thích môn thể thao bơi lội dưới làn nước mát.',
    structure: 'Chủ (Chị) + Hoạt động (Bơi lội) + Cảm xúc (Thích)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Nêu hoạt động Bơi lội trước, sau đó biểu đạt cảm xúc Thích.',
    words: [
      { slug: 'chi', role: 'Chủ thể', hint: 'Ký hiệu Chị' },
      { slug: 'boi_loi', role: 'Hoạt động', hint: 'Hai tay sải bơi nhịp nhàng' },
      { slug: 'thich', role: 'Cảm xúc', hint: 'Bàn tay xoa nhẹ trước ngực' }
    ]
  },
  {
    orderIndex: 77,
    slug: 'em-thich-bong-ro',
    title: 'Em thích chơi bóng rổ',
    meaning: 'Em đam mê ném bóng vào rổ cùng đội bóng trường.',
    structure: 'Chủ (Em) + Môn chơi (Bóng rổ) + Cảm xúc (Thích)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu nhồi bóng và ném rổ đặt trước thái độ Thích.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'bong_ro', role: 'Môn thể thao', hint: 'Hai tay ném bóng vào rổ' },
      { slug: 'thich', role: 'Cảm xúc', hint: 'Xoa ngực cười' }
    ]
  },
  {
    orderIndex: 78,
    slug: 'anh-choi-bong-ban',
    title: 'Anh chơi bóng bàn',
    meaning: 'Anh cầm vợt giao đấu bóng bàn dứt khoát.',
    structure: 'Chủ (Anh) + Môn chơi (Bóng bàn) + Nhanh nhẹn (Nhanh)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Cử chỉ vung vợt bóng bàn nhỏ kết hợp tính chất Nhanh.',
    words: [
      { slug: 'anh', role: 'Chủ thể', hint: 'Ký hiệu Anh' },
      { slug: 'bong_ban', role: 'Môn thể thao', hint: 'Tay cầm vợt bóng bàn vung đánh' },
      { slug: 'nhanh', role: 'Tốc độ', hint: 'Tay lướt nhanh dứt khoát' }
    ]
  },
  {
    orderIndex: 79,
    slug: 'chi-choi-cau-long',
    title: 'Chị chơi cầu lông',
    meaning: 'Chị đánh cầu lông rèn luyện sức khỏe mỗi chiều.',
    structure: 'Chủ (Chị) + Môn chơi (Cầu lông) + Hành động (Chạy)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu vung vợt cầu lông đập cầu.',
    words: [
      { slug: 'chi', role: 'Chủ thể', hint: 'Ký hiệu Chị' },
      { slug: 'cau_long', role: 'Môn thể thao', hint: 'Tay cầm vợt cầu lông vung đập' },
      { slug: 'chay', role: 'Vận động', hint: 'Đánh tay chạy linh hoạt' }
    ]
  },
  {
    orderIndex: 80,
    slug: 'em-choi-da-cau',
    title: 'Em chơi đá cầu',
    meaning: 'Giờ ra chơi, em cùng các bạn tung tăng đá cầu.',
    structure: 'Chủ (Em) + Trò chơi (Đá cầu) + Cảm xúc (Vui vẻ/Cười)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu tâng quả cầu lông chân kết hợp nụ cười rạng rỡ.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'da_cau', role: 'Trò chơi', hint: 'Ký hiệu tâng quả cầu đá' },
      { slug: 'cuoi', role: 'Cảm xúc', hint: 'Ký hiệu Cười tươi' }
    ]
  },
  {
    orderIndex: 81,
    slug: 'anh-chay-dien-kinh',
    title: 'Anh thi chạy điền kinh',
    meaning: 'Anh là vận động viên sải bước thi chạy điền kinh tốc độ.',
    structure: 'Chủ (Anh) + Môn thi (Điền kinh) + Hành động (Nhanh)',
    category: 'Thể thao & Vận động',
    difficulty: 'Trung bình',
    explanation: 'Ký hiệu Điền kinh đường chạy kết hợp cử chỉ Nhanh.',
    words: [
      { slug: 'anh', role: 'Chủ thể', hint: 'Ký hiệu Anh' },
      { slug: 'dien_kinh', role: 'Môn thi đấu', hint: 'Ký hiệu Điền kinh sải chân' },
      { slug: 'nhanh', role: 'Tốc độ', hint: 'Cử chỉ Nhanh vun vút' }
    ]
  },
  {
    orderIndex: 82,
    slug: 'em-nhay-day',
    title: 'Em tập nhảy dây',
    meaning: 'Em quay dây nhảy nhịp nhàng rèn luyện thể lực.',
    structure: 'Chủ (Em) + Môn tập (Nhảy dây) + Cảm xúc (Thích)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Hai tay xoay dây nhảy quanh người rồi làm ký hiệu Thích.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'nhay_day', role: 'Hoạt động', hint: 'Hai tay quay cổ tay nhảy dây' },
      { slug: 'thich', role: 'Cảm xúc', hint: 'Xoa ngực thích thú' }
    ]
  },
  {
    orderIndex: 83,
    slug: 'anh-choi-bong-chuyen',
    title: 'Anh chơi bóng chuyền',
    meaning: 'Anh cùng đồng đội đệm bóng và đập bóng chuyền.',
    structure: 'Chủ (Anh) + Môn chơi (Bóng chuyền) + Sức mạnh (Mạnh)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Hai tay chụm đệm bóng chuyền lên cao.',
    words: [
      { slug: 'anh', role: 'Chủ thể', hint: 'Ký hiệu Anh' },
      { slug: 'bong_chuyen', role: 'Môn thể thao', hint: 'Hai bàn tay chụm đón đệm bóng chuyền' },
      { slug: 'manh', role: 'Cường độ', hint: 'Nắm tay siết dũng mãnh' }
    ]
  },
  {
    orderIndex: 84,
    slug: 'ong-noi-tap-the-duc',
    title: 'Ông nội tập thể dục thể thao',
    meaning: 'Mỗi sáng ông nội đều đặn tập thể dục giữ gìn sức khỏe.',
    structure: 'Chủ (Ông nội) + Hoạt động (Thể dục thể thao) + Sức khỏe (Khỏe)',
    category: 'Thể thao & Vận động',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Thể dục thể thao vung hai cánh tay rồi làm ký hiệu Khỏe.',
    words: [
      { slug: 'ong_noi', role: 'Chủ thể', hint: 'Ký hiệu Ông nội' },
      { slug: 'the_duc_the_thao', role: 'Hoạt động', hint: 'Vung hai tay co gập tập thể dục' },
      { slug: 'khoe', role: 'Kết quả', hint: 'Gập khuỷu tay khỏe khoắn' }
    ]
  },

  // ==========================================
  // CHỦ ĐỀ 8: PHỦ ĐỊNH & KHƯỚC TỪ (10 CÂU)
  // ==========================================
  {
    orderIndex: 85,
    slug: 'anh-tu-choi-uong-ruou',
    title: 'Anh từ chối uống rượu',
    meaning: 'Anh kiên quyết từ chối khi được mời uống rượu.',
    structure: 'Chủ (Anh) + Đồ uống (Rượu) + Động từ (Uống) + Phủ định (Từ chối)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Nâng cao',
    explanation: 'Sự việc (Uống rượu) nêu trước, ký hiệu Từ chối đặt ở CUỐI CÂU kèm lắc đầu dứt khoát.',
    words: [
      { slug: 'anh', role: 'Chủ ngữ', hint: 'Ký hiệu Anh' },
      { slug: 'ruou', role: 'Đồ uống có cồn', hint: 'Ký hiệu chai rượu nâng ly' },
      { slug: 'uong', role: 'Hành động', hint: 'Ký hiệu Uống' },
      { slug: 'tu_choi', role: 'Phủ định khước từ', hint: 'Lòng bàn tay đẩy ra ngoài lắc đầu dứt khoát' }
    ]
  },
  {
    orderIndex: 86,
    slug: 'em-khong-nen-uong-bia',
    title: 'Em không nên uống bia',
    meaning: 'Em nhận thức rõ nhỏ tuổi thì không nên dùng đồ uống có cồn.',
    structure: 'Chủ (Em) + Đồ uống (Bia) + Động từ (Uống) + Lời khuyên (Không nên)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Trung bình',
    explanation: 'Lời khuyên phủ định "Không nên" đưa về cuối câu sau hành vi Uống bia.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Ký hiệu Em' },
      { slug: 'bia', role: 'Đồ uống', hint: 'Cử chỉ bọt bia nâng cốc' },
      { slug: 'uong', role: 'Hành động', hint: 'Ký hiệu Uống' },
      { slug: 'khong_nen', role: 'Phủ định', hint: 'Ngón trỏ lắc sang hai bên cảnh báo' }
    ]
  },
  {
    orderIndex: 87,
    slug: 'em-khong-quen-lam-bai-tap',
    title: 'Em không bao giờ quên làm bài tập',
    meaning: 'Em luôn có trách nhiệm nhớ hoàn thành bài tập đầy đủ.',
    structure: 'Chủ (Em) + Việc (Làm bài tập) + Khẳng định nhớ (Không quên)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Trung bình',
    explanation: 'Đối tượng công việc nêu trước, sau đó chốt bằng ký hiệu Không quên.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'lam_bai_tap', role: 'Nhiệm vụ', hint: 'Ký hiệu Làm bài tập' },
      { slug: 'khong_quen', role: 'Ghi nhớ', hint: 'Chạm trán rồi lắc ngón khẳng định nhớ' }
    ]
  },
  {
    orderIndex: 88,
    slug: 'anh-khong-can-mua-o-to',
    title: 'Anh không cần mua ô tô',
    meaning: 'Nhu cầu đi lại gần nên anh chưa cần thiết mua xe ô tô.',
    structure: 'Chủ (Anh) + Phương tiện (Ô tô) + Mua (Mua) + Phủ định (Không cần)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Trung bình',
    explanation: 'Sự vật và hành động mua nêu trước, từ Không cần đặt ở cuối.',
    words: [
      { slug: 'anh', role: 'Chủ thể', hint: 'Ký hiệu Anh' },
      { slug: 'o_to', role: 'Phương tiện', hint: 'Hai tay cầm vô lăng lái ô tô' },
      { slug: 'mua_sac', role: 'Giao dịch', hint: 'Ký hiệu Mua' },
      { slug: 'khong_can', role: 'Phủ định nhu cầu', hint: 'Gạt tay ngang ngực lắc đầu không cần' }
    ]
  },
  {
    orderIndex: 89,
    slug: 'me-khong-cho-em-di',
    title: 'Mẹ không cho em đi chơi một mình',
    meaning: 'Mẹ không đồng ý cho phép em đi ra ngoài khi trời tối.',
    structure: 'Chủ (Mẹ) + Người nhận (Em) + Hành động (Đi) + Phủ định (Không cho)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Trung bình',
    explanation: 'Hành động Đi nêu trước, từ cấm đoán Không cho đặt cuối.',
    words: [
      { slug: 'me', role: 'Chủ thể', hint: 'Ký hiệu Mẹ' },
      { slug: 'em', role: 'Người con', hint: 'Chỉ tay vào em' },
      { slug: 'di', role: 'Hành động', hint: 'Ngón tay bước đi' },
      { slug: 'khong_cho', role: 'Cấm đoán', hint: 'Chém tay xuống lắc đầu dứt khoát' }
    ]
  },
  {
    orderIndex: 90,
    slug: 'em-tu-choi-an-thit',
    title: 'Em từ chối ăn thịt',
    meaning: 'Hôm nay ăn chay nên em từ chối dùng món thịt.',
    structure: 'Chủ (Em) + Món ăn (Thịt) + Ăn (Ăn) + Khước từ (Từ chối)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Dễ',
    explanation: 'Món thịt và hành động ăn đưa lên trước, từ chối ở cuối.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'thit', role: 'Món ăn', hint: 'Ký hiệu miếng thịt cắn' },
      { slug: 'an', role: 'Động từ', hint: 'Ký hiệu Ăn' },
      { slug: 'tu_choi', role: 'Khước từ', hint: 'Lòng bàn tay đẩy ra ngoài' }
    ]
  },
  {
    orderIndex: 91,
    slug: 'hoc-sinh-khong-nghe-loi-sai',
    title: 'Học sinh không nghe lời là sai',
    meaning: 'Việc không vâng lời thầy cô cha mẹ là hành vi chưa đúng.',
    structure: 'Chủ (Học sinh) + Hành vi (Không nghe lời) + Đánh giá (Sai)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Trung bình',
    explanation: 'Ký hiệu Không nghe lời kết hợp đánh giá Sai bắt chéo tay.',
    words: [
      { slug: 'hoc_sinh', role: 'Chủ thể', hint: 'Ký hiệu Học sinh' },
      { slug: 'khong_nghe_loi', role: 'Hành vi', hint: 'Chỉ tai rồi lắc tay không nghe' },
      { slug: 'sai', role: 'Đánh giá', hint: 'Ngón trỏ gạt má biểu thị sai' }
    ]
  },
  {
    orderIndex: 92,
    slug: 'anh-khong-quen-ban',
    title: 'Anh không hề quen người đó',
    meaning: 'Người này xa lạ nên anh không có quen biết từ trước.',
    structure: 'Chủ (Anh) + Người kia (Bạn) + Phủ định nhận biết (Không quen)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Không quen làm sau cùng thể hiện sự xa lạ.',
    words: [
      { slug: 'anh', role: 'Chủ thể', hint: 'Ký hiệu Anh' },
      { slug: 'ban', role: 'Người đối diện', hint: 'Ký hiệu Bạn' },
      { slug: 'khong_quen', role: 'Phủ định', hint: 'Chạm cằm rồi gạt tay lắc đầu' }
    ]
  },
  {
    orderIndex: 93,
    slug: 'em-dung-lai-khong-chay',
    title: 'Em dừng lại không chạy nữa',
    meaning: 'Đã đến đích hoặc thấy mệt nên em dừng chân.',
    structure: 'Chủ (Em) + Chạy (Chạy) + Mệnh lệnh dừng (Dừng lại)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Dừng lại chặt bàn tay xuống lòng tay kia ngăn hành động.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'chay', role: 'Hành động', hint: 'Đánh tay chạy' },
      { slug: 'dung_lai', role: 'Dừng lại', hint: 'Chặt cạnh bàn tay dứt khoát' }
    ]
  },
  {
    orderIndex: 94,
    slug: 'em-khong-nen-luoi-bieng',
    title: 'Em không nên lười biếng',
    meaning: 'Bản thân cần tự nhắc nhở chăm chỉ, không được lười nhác.',
    structure: 'Chủ (Em) + Thói xấu (Lười biếng) + Lời khuyên (Không nên)',
    category: 'Phủ định & Khước từ',
    difficulty: 'Dễ',
    explanation: 'Nêu tật xấu Lười biếng trước rồi cảnh báo Không nên.',
    words: [
      { slug: 'em', role: 'Chủ thể', hint: 'Ký hiệu Em' },
      { slug: 'luoi_bieng', role: 'Thói xấu', hint: 'Ký hiệu Lười biếng ủ rũ' },
      { slug: 'khong_nen', role: 'Cảnh báo', hint: 'Lắc ngón trỏ cảnh báo' }
    ]
  },

  // ==========================================
  // CHỦ ĐỀ 9: TÍNH TỪ & MIÊU TẢ (10 CÂU)
  // ==========================================
  {
    orderIndex: 95,
    slug: 'banh-xeo-rat-ngon-mieng',
    title: 'Bánh xèo rất ngon miệng',
    meaning: 'Món bánh xèo có hương vị giòn thơm hấp dẫn.',
    structure: 'Chủ đề (Bánh xèo) + Tính chất vị giác (Ngon miệng)',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Ngon miệng nhấn mạnh bằng nụ cười thỏa mãn.',
    words: [
      { slug: 'banh_xeo', role: 'Chủ đề ẩm thực', hint: 'Ký hiệu Bánh xèo tráng chảo' },
      { slug: 'ngon_mieng', role: 'Đặc tính', hint: 'Ngón tay quẹt khóe môi mặt thỏa mãn' }
    ]
  },
  {
    orderIndex: 96,
    slug: 'mua-he-thoi-tiet-nong',
    title: 'Mùa hè thời tiết rất nóng bức',
    meaning: 'Thời tiết vào mùa hè oi ả với nhiệt độ cao.',
    structure: 'Bối cảnh (Mùa hè) + Chủ đề (Thời tiết) + Cảm giác nhiệt (Nóng)',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Lược bỏ từ láy nóng bức, chỉ dùng ký hiệu gốc Nóng kết hợp quạt tay cau mày.',
    words: [
      { slug: 'mua_he', role: 'Thời điểm mùa vụ', hint: 'Ký hiệu ánh nắng chói hè' },
      { slug: 'thoi_tiet', role: 'Chủ đề', hint: 'Hai bàn tay mở xoay khí hậu' },
      { slug: 'nong', role: 'Nhiệt độ', hint: 'Kéo cổ áo quạt phẩy mặt nhăn nóng' }
    ]
  },
  {
    orderIndex: 97,
    slug: 'mua-dong-thoi-tiet-lanh',
    title: 'Mùa đông thời tiết rất lạnh giá',
    meaning: 'Vào mùa đông không khí buốt giá cần mặc thêm áo ấm.',
    structure: 'Bối cảnh (Mùa đông) + Chủ đề (Thời tiết) + Cảm giác nhiệt (Lạnh)',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Lạnh run hai cánh tay ôm sát ngực.',
    words: [
      { slug: 'mua_dong', role: 'Thời điểm', hint: 'Ký hiệu Mùa đông gió bấc' },
      { slug: 'thoi_tiet', role: 'Chủ đề', hint: 'Ký hiệu Thời tiết' },
      { slug: 'lanh', role: 'Nhiệt độ', hint: 'Hai tay ôm cánh tay run vì lạnh' }
    ]
  },
  {
    orderIndex: 98,
    slug: 'cong-vien-mat-me',
    title: 'Công viên rất mát mẻ',
    meaning: 'Hàng cây xanh trong công viên mang lại cảm giác dễ chịu.',
    structure: 'Địa điểm (Công viên) + Cảm giác (Mát mẻ)',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Ký hiệu Mát mẻ xòe hai tay phe phẩy trước mặt mỉm cười sảng khoái.',
    words: [
      { slug: 'cong_vien', role: 'Địa điểm', hint: 'Ký hiệu Công viên cây xanh' },
      { slug: 'mat_me', role: 'Không khí', hint: 'Hai tay phẩy gió mát trước mặt' }
    ]
  },
  {
    orderIndex: 99,
    slug: 'em-thich-mau-do',
    title: 'Em thích màu đỏ',
    meaning: 'Em đặc biệt yêu thích màu sắc đỏ tươi sáng.',
    structure: 'SOV: Chủ (Em) + Bổ ngữ (Màu đỏ) + Cảm xúc (Thích)',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Màu đỏ (bổ ngữ) đứng trước động từ Thích theo chuẩn SOV.',
    words: [
      { slug: 'em', role: 'Chủ ngữ', hint: 'Ký hiệu Em' },
      { slug: 'mau_do', role: 'Màu sắc', hint: 'Ngón trỏ quệt nhẹ môi đỏ' },
      { slug: 'thich', role: 'Cảm xúc', hint: 'Xoa nhẹ ngực mỉm cười' }
    ]
  },
  {
    orderIndex: 100,
    slug: 'anh-thich-mau-xanh-la-cay',
    title: 'Anh thích màu xanh lá cây',
    meaning: 'Anh yêu thích gam màu xanh lá cây tươi mát của thiên nhiên.',
    structure: 'SOV: Chủ (Anh) + Bổ ngữ (Màu xanh lá cây) + Cảm xúc (Thích)',
    category: 'Tính từ & Miêu tả',
    difficulty: 'Dễ',
    explanation: 'Màu xanh lá cây làm trước động từ Thích.',
    words: [
      { slug: 'anh', role: 'Chủ ngữ', hint: 'Ký hiệu Anh' },
      { slug: 'mau_xanh_la_cay', role: 'Màu sắc', hint: 'Ký hiệu màu lá cây xòe ngón' },
      { slug: 'thich', role: 'Cảm xúc', hint: 'Xoa ngực tán thành' }
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

// Kiểm tra tính hợp lệ của tất cả 100 câu
console.log('--- KIỂM TRA TÍNH TOÀN VẸN CỦA 100 CÂU ---');
let hasError = false;
let chaoCount = 0;
enrichedSentences.forEach((s, sIdx) => {
  // Kiểm tra từ chào
  const jsonStr = JSON.stringify(s).toLowerCase();
  if (jsonStr.includes('chào') || jsonStr.includes('chao')) {
    console.error(`CẢNH BÁO: Phát hiện chữ 'chào' trong câu ${s.orderIndex} (${s.slug}):`);
    console.error(JSON.stringify(s, null, 2));
    chaoCount++;
    hasError = true;
  }
  s.words.forEach(w => {
    if (!slugMap.has(w.slug)) {
      console.error(`LỖI: Slug '${w.slug}' không tồn tại trong từ điển VSL400 (Câu ${s.orderIndex}: ${s.slug})`);
      hasError = true;
    }
  });
});

if (hasError) {
  console.error(`Có lỗi xảy ra! Không thể ghi tệp.`);
  process.exit(1);
}

console.log(`✅ Toàn bộ ${enrichedSentences.length} câu đều hợp lệ 100%! Không chứa từ 'chào'.`);

// 1. Ghi tệp backend seed
const backendPath = path.join(__dirname, '..', 'backend-core', 'src', 'modules', 'seed', 'vsl400-sentences-seed.json');
fs.writeFileSync(backendPath, JSON.stringify(enrichedSentences, null, 2), 'utf-8');
console.log(`Đã ghi thành công ${enrichedSentences.length} câu vào ${backendPath}`);

// 2. Ghi tệp backend dist nếu tồn tại thư mục
const distPath = path.join(__dirname, '..', 'backend-core', 'dist', 'modules', 'seed', 'vsl400-sentences-seed.json');
if (fs.existsSync(path.dirname(distPath))) {
  fs.writeFileSync(distPath, JSON.stringify(enrichedSentences, null, 2), 'utf-8');
  console.log(`Đã ghi thành công ${enrichedSentences.length} câu vào dist ${distPath}`);
}

// 3. Ghi tệp frontend data
const frontendPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'sentencesData.js');
const frontendContent = `// Signlingo - Danh sách 100 Câu thường gặp VSL chuẩn ngữ pháp
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
fs.writeFileSync(frontendPath, frontendContent, 'utf-8');
console.log(`Đã ghi thành công ${enrichedSentences.length} câu vào frontend ${frontendPath}`);

