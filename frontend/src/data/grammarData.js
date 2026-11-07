// Signlingo - Dữ liệu Lý thuyết Ngữ pháp Ngôn ngữ Ký hiệu Việt Nam (VSL)
// Căn cứ theo tài liệu nghiên cứu: 'MỘT SỐ ĐẶC TRƯNG NGỮ PHÁP CỦA NGÔN NGỮ KÍ HIỆU'

export const VSL_GRAMMAR_RULES = [
  {
    id: 'rule-sov',
    order: 1,
    title: 'Cấu trúc câu: "Chủ đề – Lời dẫn" & SOV',
    shortDesc: 'Trật tự Chủ ngữ + Bổ ngữ (Sự vật) + Động từ (Hành động)',
    tag: 'Cấu trúc cốt lõi',
    badgeColor: '#0284c7',
    iconName: 'Layers',
    summary: 'Trong VSL, sự vật/chủ đề chính luôn được làm ký hiệu trước để định vị không gian, sau đó mới thực hiện hành động hoặc lời dẫn giải.',
    spokenExample: {
      text: 'Tôi thích màu đỏ',
      breakdown: ['Tôi (Chủ ngữ)', 'thích (Động từ)', 'màu đỏ (Bổ ngữ)'],
      type: 'SVO (Chủ - Động - Bổ)'
    },
    signExample: {
      text: 'Tôi / Màu đỏ / Thích',
      breakdown: ['Tôi (Chủ đề)', 'Màu đỏ (Sự vật/Bổ ngữ)', 'Thích (Động từ/Lời dẫn)'],
      type: 'SOV (Chủ - Bổ - Động)'
    },
    deepDive: `Đặc điểm đặc trưng nhất của Ngôn ngữ Ký hiệu Việt Nam là nguyên lý "Chủ đề – Lời dẫn". Khi giao tiếp, người điếc trước hết phải kiến tạo "chủ đề" (sự vật, con người, món ăn, sự việc cụ thể) trong trường không gian thị giác của người đối diện. Sau khi hình ảnh sự vật đã rõ ràng, họ mới đưa ra "lời dẫn" (nhận xét, trạng thái, hành động tương tác với sự vật đó).

Chính vì vậy, cấu trúc câu đơn giản trong VSL luôn tuân theo trật tự:
👉 Chủ ngữ + Bổ ngữ + Động từ (SOV), hoàn toàn khác với tiếng Việt nói (SVO: Chủ ngữ + Động từ + Bổ ngữ).`,
    sampleSentenceSlugs: ['em-thich-mau-do', 'anh-an-pho', 'hoc-sinh-doc-sach', 'em-an-banh-bao'],
    tips: [
      'Đừng dịch từng chữ theo thứ tự tiếng Việt nói (SVO) vì sẽ làm người khiếm thính khó hình dung sự vật.',
      'Luôn tự hỏi: "Sự vật nào là đối tượng chính cần được đưa ra làm bối cảnh trước?"'
    ]
  },
  {
    id: 'rule-noun-numeral',
    order: 2,
    title: 'Cấu trúc cụm từ: Danh từ + Số từ',
    shortDesc: 'Đảo ngược vị trí số đếm ra sau sự vật (Danh từ đứng trước)',
    tag: 'Trật tự cụm từ',
    badgeColor: '#059669',
    iconName: 'Hash',
    summary: 'Khác với tiếng nói (Số từ + Danh từ), VSL luôn làm ký hiệu Danh từ trước rồi mới xòe ngón tay thể hiện Số lượng sau.',
    spokenExample: {
      text: '4 sinh viên',
      breakdown: ['4 (Số từ)', 'sinh viên (Danh từ)'],
      type: 'Số từ + Danh từ'
    },
    signExample: {
      text: 'Sinh viên / 4',
      breakdown: ['Sinh viên (Danh từ định hình)', '4 (Số từ định lượng)'],
      type: 'Danh từ + Số từ'
    },
    deepDive: `Trong tư duy thị giác, việc xòe số 4 ra trước sẽ vô nghĩa nếu người xem chưa biết "4 cái gì". Người khiếm thính cần biết đối tượng là ai (người, xe, quả cam, sinh viên...), sau đó mới đếm số lượng của đối tượng đó.

Tương tự:
- Tiếng Việt nói: "2 quả chuối" ➔ VSL: "Quả chuối / 2".
- Tiếng Việt nói: "3 quyển sách" ➔ VSL: "Sách / 3".
- Tiếng Việt nói: "1 chiếc ô tô" ➔ VSL: "Ô tô / 1".`,
    sampleSentenceSlugs: ['hoc-sinh-doc-sach', 'sinh-vien-viet-sach'],
    tips: [
      'Quy tắc này áp dụng cho hầu hết các danh từ đếm được trong sinh hoạt thường nhật.',
      'Số ngón tay được giữ cố định ở không gian bên cạnh ký hiệu danh từ vừa thực hiện.'
    ]
  },
  {
    id: 'rule-compound',
    order: 3,
    title: 'Quy tắc Từ ghép (Compound Signs)',
    shortDesc: 'Lắp ghép liên hoàn các ký hiệu đơn lẻ tạo nghĩa mới',
    tag: 'Cấu tạo từ',
    badgeColor: '#7c3aed',
    iconName: 'Boxes',
    summary: 'Rất nhiều khái niệm mới và từ ghép trong VSL được hình thành bằng cách lắp ghép tuần tự hai hoặc nhiều ký hiệu riêng lẻ.',
    spokenExample: {
      text: 'Hoa hồng, Uống sữa, Bác sĩ',
      breakdown: ['Hoa + Hồng (Từ ghép)', 'Uống + Sữa (Cụm động từ)'],
      type: 'Phát âm ghép tiếng'
    },
    signExample: {
      text: 'Hoa + Màu hồng; Uống + Sữa',
      breakdown: ['Ký hiệu Hoa + Ký hiệu Màu hồng = Hoa hồng', 'Ký hiệu Bắt mạch + Ký hiệu Người = Bác sĩ'],
      type: 'Lắp ghép ký hiệu liên hoàn'
    },
    deepDive: `Cũng giống như ngôn ngữ nói phát âm từng tiếng riêng biệt để tạo từ ghép, trong ngôn ngữ ký hiệu, rất nhiều từ ghép được tạo ra bằng cách lắp ghép đơn thuần các ký hiệu riêng lẻ lại với nhau.

Các ví dụ điển hình trong bộ từ điển VSL400:
- "Hoa hồng" = Ký hiệu Hoa + Ký hiệu Màu hồng.
- "Uống sữa" = Ký hiệu Uống + Ký hiệu Sữa.
- "Quán cà phê" = Ký hiệu Quán nước + Ký hiệu Cà phê.
- "Trường học" = Ký hiệu Mái nhà + Ký hiệu Học.`,
    sampleSentenceSlugs: ['em-uong-sua', 'bo-uong-ca-phe', 'em-hoc-o-truong-hoc'],
    tips: [
      'Chuyển động giữa hai ký hiệu thành phần cần liền mạch, không ngắt quãng quá lâu.',
      'Ký hiệu ghép thường có nhịp chuyển động rút ngắn lại so với khi thực hiện đơn lẻ.'
    ]
  },
  {
    id: 'rule-question',
    order: 4,
    title: 'Cấu trúc Câu hỏi & Ngữ điệu cơ thể (NMMs)',
    shortDesc: 'Từ để hỏi ở Cuối câu & Biểu cảm nét mặt là chìa khóa',
    tag: 'Câu nghi vấn',
    badgeColor: '#ea580c',
    iconName: 'HelpCircle',
    summary: 'Từ nghi vấn (Tại sao, Khi nào, Thế nào...) luôn đặt ở cuối câu. Đối với câu hỏi Có/Không, ngữ điệu cơ thể quyết định tính chất câu hỏi.',
    spokenExample: {
      text: 'Tại sao bạn đi học muộn? Bác có khỏe không?',
      breakdown: ['Tại sao (Đầu câu nói)', 'Bác có khỏe không (Có... không)'],
      type: 'Từ nghi vấn ở đầu/giữa'
    },
    signExample: {
      text: 'Bạn / Đi học / Muộn / Tại sao? | Bác / Khỏe? [Nhướng mày]',
      breakdown: ['Chủ đề sự việc trước', 'Từ nghi vấn (Tại sao) ở CUỐI CÂU', 'Biểu cảm rướn người nhướng mày'],
      type: 'Từ để hỏi cuối câu + NMMs'
    },
    deepDive: `Trong VSL, trật tự câu hỏi và câu tường thuật có cùng bản chất: Yếu tố chủ đề làm trước, lời dẫn làm sau.
Phân biệt hai dạng câu hỏi:
1. Câu hỏi Có/Không (Yes/No):
Trật tự từ không đổi. Biểu cảm cơ thể (Non-manual markers) là yếu tố quyết định: hơi rướn đầu về trước, nhướng hai cung mày, mở to mắt và nhìn thẳng vào người đối diện.
Ví dụ: "Bác có khỏe không?" ➔ Làm ký hiệu "Bác + Khỏe" kết hợp ánh mắt thăm dò và nhướng mày.

2. Câu hỏi mở (Wh-questions: Tại sao, Thế nào, Bao nhiêu, Khi nào, Ai):
Từ nghi vấn LUÔN ĐẶT Ở CUỐI CÂU:
- Nói: "Tại sao bạn đi học muộn?" ➔ VSL: "Bạn / Đi học / Muộn / Tại sao?"
- Nói: "Bạn có bao nhiêu tiền?" ➔ VSL: "Bạn / Tiền / Bao nhiêu?"`,
    sampleSentenceSlugs: ['bac-khoe'],
    tips: [
      'Nét mặt (NMMs) mang giá trị ngữ pháp tương đương dấu chấm hỏi (?) trong văn viết.',
      'Đừng đặt từ "Tại sao" ở đầu câu như thói quen tiếng Việt nói.'
    ]
  },
  {
    id: 'rule-negation',
    order: 5,
    title: 'Cấu trúc Câu phủ định: Đặt từ phủ định sau cùng',
    shortDesc: 'Từ phủ định (Không, Chưa, Từ chối) đặt ở CUỐI CÂU',
    tag: 'Phủ định',
    badgeColor: '#dc2626',
    iconName: 'XCircle',
    summary: 'Ngược với tiếng nói đặt "không" trước động từ, VSL nêu toàn bộ sự việc trước rồi mới chốt lại bằng từ phủ định và cái lắc đầu.',
    spokenExample: {
      text: 'Anh từ chối uống rượu. Em không nên uống bia.',
      breakdown: ['từ chối (trước hành động uống)', 'không nên (trước uống bia)'],
      type: 'Từ phủ định đứng trước'
    },
    signExample: {
      text: 'Anh / Rượu / Uống / Từ chối. Em / Bia / Uống / Không nên.',
      breakdown: ['Chủ thể + Sự việc (Rượu uống)', 'Từ chối / Không nên (Đặt ở CUỐI)', 'Lắc đầu dứt khoát đồng thời'],
      type: 'Từ phủ định ở CUỐI CÂU'
    },
    deepDive: `Người khiếm thính cần nắm bắt trọn vẹn "bức tranh sự việc đang được đề cập" (ví dụ: hành vi uống rượu, việc đi học, việc uống thuốc), rồi sau đó mới đón nhận thông tin phán xét: Sự việc ấy Có hay Không, Đồng ý hay Từ chối.

Các dạng phủ định trong VSL:
1. Đặt ký hiệu phủ định chuyên biệt ở cuối: "từ chối", "không nên", "không cần", "không quen".
2. Đồng thời kết hợp lắc đầu nhẹ nhàng hoặc dứt khoát khi thực hiện ký hiệu phủ định để tăng sức thuyết phục.`,
    sampleSentenceSlugs: ['anh-tu-choi-uong-ruou', 'em-khong-nen-uong-bia', 'em-khong-quen-lam-bai-tap'],
    tips: [
      'Lắc đầu là một thành tố ngữ pháp bắt buộc trong câu phủ định.',
      'Nếu bạn làm ký hiệu "Không" ở đầu câu, người xem sẽ bị ngắt quãng dòng suy nghĩ.'
    ]
  },
  {
    id: 'rule-adjective',
    order: 6,
    title: 'Quy tắc Tính từ: Lược bỏ từ đệm trong từ láy',
    shortDesc: 'Dùng tính từ gốc, biểu đạt mức độ bằng nét mặt & lực nhấn',
    tag: 'Tính từ & Miêu tả',
    badgeColor: '#0891b2',
    iconName: 'Smile',
    summary: 'Tiếng Việt dùng từ láy và phó từ (rất, nóng nực, mát mẻ). VSL chỉ dùng ký hiệu gốc (Nóng, Mát) và biểu cảm nét mặt.',
    spokenExample: {
      text: 'Thời tiết mùa hè rất nóng bức. Bánh xèo rất ngon miệng.',
      breakdown: ['rất nóng bức (từ láy + phó từ)', 'rất ngon miệng'],
      type: 'Từ láy & Trợ từ chỉ mức độ'
    },
    signExample: {
      text: 'Mùa hè / Thời tiết / Nóng [Cau mặt]. Bánh xèo / Ngon miệng [Cười thỏa mãn].',
      breakdown: ['Lược bỏ từ "rất", "bức"', 'Giữ lại tính từ gốc Nóng, Ngon miệng', 'Cường độ thể hiện qua nét mặt'],
      type: 'Ký hiệu gốc + Biểu cảm NMMs'
    },
    deepDive: `Trong ngôn ngữ nói tiếng Việt có rất nhiều từ láy miêu tả mức độ tinh tế: "đỏ rực, đỏ hoe, đỏ chót", "nóng nực, nóng ran, nóng bức", "mát mẻ, mát rượi".

Trong ngôn ngữ ký hiệu:
- Người điếc chỉ sử dụng DUY NHẤT một ký hiệu gốc (ví dụ: Màu đỏ, Nóng, Mát, Lạnh).
- Mức độ "rất", "cực kỳ" hay các sắc thái tinh tế của từ láy được chuyển tải 100% bằng:
  1. Biểu cảm khuôn mặt (Non-manual markers): cau trán, mở to mắt, cười rạng rỡ, phồng má...
  2. Tốc độ cử chỉ: Cử chỉ vung nhanh, dứt khoát thể hiện mức độ mạnh.
  3. Biên độ và độ căng của cơ tay: Động tác siết chặt hoặc mở rộng hết cỡ.`,
    sampleSentenceSlugs: ['mua-he-thoi-tiet-nong', 'banh-xeo-rat-ngon-mieng', 'bac-si-tot-bung'],
    tips: [
      'Đừng tìm kiếm ký hiệu cho các từ đệm như "rất", "quá", "lắm" – hãy biểu cảm qua khuôn mặt của bạn!',
      'Nụ cười khi làm từ "Ngon miệng" hay cái nhíu mày khi làm từ "Nóng" chính là từ "RẤT".'
    ]
  },
  {
    id: 'rule-directional-verbs',
    order: 7,
    title: 'Động từ chuyển động có hướng (Directional Verbs)',
    shortDesc: 'Hướng chuyển động của bàn tay chỉ rõ Chủ thể và Đối tượng nhận',
    tag: 'Không gian 3D',
    badgeColor: '#4f46e5',
    iconName: 'Navigation',
    summary: 'Điểm bắt đầu và kết thúc của cử chỉ trong không gian 3 chiều thay thế cho các đại từ riêng rẽ (Tôi -> Bạn vs Bạn -> Tôi).',
    spokenExample: {
      text: 'Tôi giúp bạn. Bác sĩ khám bệnh cho em.',
      breakdown: ['Tôi giúp bạn (3 từ riêng rẽ)', 'khám bệnh cho em (phải có từ "cho")'],
      type: 'Tuyến tính từng từ'
    },
    signExample: {
      text: 'Giúp đỡ [Từ ngực tôi hướng ra phía bạn]. Bác sĩ / Em / Khám bệnh [Hướng về em].',
      breakdown: ['Gốc tay ở vị trí chủ thể', 'Đích tay ở vị trí người nhận', 'Tích hợp đại từ ngay trong hướng cử chỉ'],
      type: 'Động từ không gian 3 chiều'
    },
    deepDive: `Ngôn ngữ ký hiệu tận dụng không gian 3 chiều xung quanh người nói như một sân khấu trực quan:
- Vị trí trước ngực: Ngôi thứ nhất (Tôi, Em).
- Vị trí đối diện: Ngôi thứ hai (Bạn, Anh, Chị).
- Vị trí hai bên: Ngôi thứ ba (Người đó, Bác sĩ, Bố mẹ).

Đối với các "Động từ định hướng" như: Giúp đỡ (giup_do), Cho, Tặng, Nhìn, Khám bệnh, Dạy học:
- Nếu tôi giúp bạn: Tay xuất phát từ ngực tôi và di chuyển hướng thẳng về phía bạn.
- Nếu bạn giúp tôi: Tay xuất phát từ phía bạn và di chuyển quay về chạm ngực tôi.
Nhờ quy tắc này, người điếc không cần thực hiện thêm các đại từ rời rạc, giúp tốc độ truyền tin tăng gấp đôi!`,
    sampleSentenceSlugs: ['bo-me-giup-do-em', 'em-giup-do-ba-noi', 'bac-si-kham-benh-em'],
    tips: [
      'Xác định rõ "Ai là người phát ra hành động" và "Ai là người đón nhận hành động" trước khi chuyển động tay.',
      'Giữ góc nghiêng của bàn tay hướng chính xác về phía đối tượng trong không gian.'
    ]
  },
  {
    id: 'rule-economy',
    order: 8,
    title: 'Quy tắc Rút gọn & Kết hợp hai tay đồng thời',
    shortDesc: 'Lược bỏ toàn bộ hư từ (ở, là, thì, bị, được, bằng) để tối ưu thị giác',
    tag: 'Tối ưu tốc độ',
    badgeColor: '#0d9488',
    iconName: 'Zap',
    summary: 'VSL loại bỏ triệt để các trợ từ/hư từ không mang hình ảnh, đồng thời kết hợp hai tay để cùng lúc truyền tải 2 dữ liệu.',
    spokenExample: {
      text: 'Em đang học ở trường học. Buổi sáng em thức dậy.',
      breakdown: ['đang, ở (hư từ nối)', 'thức dậy vào buổi sáng'],
      type: 'Nhiều hư từ ngữ pháp'
    },
    signExample: {
      text: 'Em / Trường học / Học. Buổi sáng / Em / Thức dậy.',
      breakdown: ['Lược bỏ sạch các từ "đang", "ở", "vào"', 'Thời gian đưa lên làm bối cảnh đầu câu', 'Hai tay phối hợp nhịp nhàng'],
      type: 'Rút gọn hư từ & Thời gian đầu câu'
    },
    deepDive: `Trong ngôn ngữ nói tiếng Việt, các từ như "ở, tại, là, thì, mà, của, bằng, được, bị, đang, đã, sẽ" đóng vai trò ngữ pháp quan trọng nhưng không mang hình ảnh cụ thể.

Người điếc coi trọng tính kinh tế của ký hiệu (Sign Economy):
1. Rút gọn hư từ: Lược bỏ hoàn toàn những từ nối này, chỉ giữ lại thực từ giàu hình ảnh (người, địa điểm, hành động).
   - "Bố đi làm bằng xe máy" ➔ Bố / Xe máy / Đi.
   - "Em đang học ở trường học" ➔ Em / Trường học / Học.
2. Thời gian làm bối cảnh: Luôn đưa mốc thời gian (Buổi sáng, Buổi tối, Bây giờ, Chủ nhật) lên đầu câu để tạo bối cảnh thời gian trước khi diễn giải hành động.
3. Kết hợp hai tay đồng thời: Tay trái có thể giữ cố định vị trí của sự vật trong khi tay phải tiếp tục làm ký hiệu miêu tả hành động liên quan.`,
    sampleSentenceSlugs: ['em-hoc-o-truong-hoc', 'buoi-sang-em-thuc-day', 'buoi-toi-bo-xem-tivi', 'chu-nhat-em-di-cong-vien'],
    tips: [
      'Đừng cố tìm ký hiệu cho các từ "ở", "là", "bằng" – việc bỏ qua chúng là hoàn toàn đúng ngữ pháp VSL!',
      'Đặt yếu tố thời gian ở vị trí đầu tiên của câu ký hiệu.'
    ]
  }
];

// Bộ câu hỏi trắc nghiệm ôn tập ngữ pháp VSL
export const VSL_GRAMMAR_QUIZ = [
  {
    id: 'q1',
    question: 'Trong câu đơn giản của Ngôn ngữ Ký hiệu Việt Nam (VSL), trật tự các thành phần câu là gì?',
    options: [
      { id: 'A', text: 'Chủ ngữ + Động từ + Bổ ngữ (SVO) giống hệt tiếng Việt nói', isCorrect: false },
      { id: 'B', text: 'Chủ ngữ + Bổ ngữ + Động từ (SOV) theo nguyên lý Chủ đề – Lời dẫn', isCorrect: true },
      { id: 'C', text: 'Động từ + Chủ ngữ + Bổ ngữ (VSO)', isCorrect: false },
      { id: 'D', text: 'Bổ ngữ + Động từ + Chủ ngữ (OVS)', isCorrect: false }
    ],
    explanation: 'Chính xác! VSL tuân thủ cấu trúc SOV: Chủ ngữ + Bổ ngữ (sự vật/chủ đề) + Động từ (hành động/lời dẫn).'
  },
  {
    id: 'q2',
    question: 'Khi biểu đạt cụm từ "4 sinh viên" trong VSL, người điếc sẽ thực hiện theo thứ tự nào?',
    options: [
      { id: 'A', text: 'Sinh viên trước, Số 4 sau (Danh từ + Số từ)', isCorrect: true },
      { id: 'B', text: 'Số 4 trước, Sinh viên sau (Số từ + Danh từ)', isCorrect: false },
      { id: 'C', text: 'Chỉ làm số 4, không cần làm sinh viên', isCorrect: false },
      { id: 'D', text: 'Làm đồng thời cả 2 từ cùng lúc', isCorrect: false }
    ],
    explanation: 'Đúng! Cấu trúc cụm từ trong VSL là Danh từ + Số từ để xác định rõ đối tượng trong không gian trước khi định lượng.'
  },
  {
    id: 'q3',
    question: 'Trong câu hỏi mở (Wh-questions như: Tại sao, Khi nào, Thế nào...), từ để hỏi được đặt ở vị trí nào?',
    options: [
      { id: 'A', text: 'Luôn luôn đứng ở đầu câu', isCorrect: false },
      { id: 'B', text: 'Đứng ở giữa câu, ngay trước vị ngữ', isCorrect: false },
      { id: 'C', text: 'Luôn luôn đặt ở CUỐI CÂU', isCorrect: true },
      { id: 'D', text: 'Không cần làm ký hiệu từ để hỏi, chỉ cần nét mặt', isCorrect: false }
    ],
    explanation: 'Rất chính xác! Trong VSL, yếu tố sự việc được làm trước, từ nghi vấn luôn được đưa về CUỐI CÂU (ví dụ: Bạn / Đi học / Muộn / Tại sao?).'
  },
  {
    id: 'q4',
    question: 'Khi nói câu "Thời tiết mùa hè rất nóng", trong VSL từ "rất" được biểu đạt như thế nào?',
    options: [
      { id: 'A', text: 'Làm thêm một ký hiệu riêng biệt mang nghĩa "Rất"', isCorrect: false },
      { id: 'B', text: 'Lược bỏ từ "rất", mức độ được biểu cảm qua nét mặt (NMMs) và cường độ động tác', isCorrect: true },
      { id: 'C', text: 'Lặp lại ký hiệu Nóng 3 lần liên tục', isCorrect: false },
      { id: 'D', text: 'Không được biểu đạt mức độ vì VSL không có tính từ', isCorrect: false }
    ],
    explanation: 'Tuyệt vời! VSL không dùng hư từ chỉ mức độ ("rất", "quá") mà sử dụng biểu cảm nét mặt (nhíu mày, thở hắt) và độ dứt khoát của cơ thể.'
  }
];
