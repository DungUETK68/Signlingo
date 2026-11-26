// Bộ xây dựng chương trình học hợp lý, ngân hàng câu hỏi lý thuyết & bài tập thử thách
// Dùng chung cho cả "Lộ trình chuẩn" (12 chuyên đề) và "Lộ trình cá nhân" (4 chặng thích ứng)

import { VSL400_WORDS } from './vsl400Words';
import { VSL_GRAMMAR_RULES, VSL_GRAMMAR_QUIZ } from './grammarData';

export const STANDARD_COMPLETED_KEY = 'signlingo_standard_completed_v1';

// Đọc danh sách bài tập / bài học đã hoàn thành ở Lộ trình chuẩn (localStorage)
export function getStandardCompletedMap() {
  try {
    const raw = localStorage.getItem(STANDARD_COMPLETED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

export function markStandardLessonCompleted(lessonId, score = 100) {
  if (!lessonId) return {};
  try {
    const map = getStandardCompletedMap();
    const prev = map[lessonId] || 0;
    map[lessonId] = Math.max(prev, Math.round(score || 100));
    localStorage.setItem(STANDARD_COMPLETED_KEY, JSON.stringify(map));
    window.dispatchEvent(
      new CustomEvent('signlingo_data_updated', {
        detail: { action: 'complete_lesson', lessonId, score },
      })
    );
    return map;
  } catch (e) {
    return {};
  }
}

// Ngân hàng câu hỏi trắc nghiệm lý thuyết chuyên sâu theo từng quy tắc ngữ pháp & chủ đề VSL
const RULE_THEORY_BANK = {
  'rule-facial-expression': [
    {
      id: 'tf-face-1',
      question: 'Trong Ngôn ngữ Ký hiệu Việt Nam (VSL), biểu cảm nét mặt đóng vai trò gì khi giao tiếp?',
      options: [
        { id: 'A', text: 'Chỉ để trang trí, không ảnh hưởng đến ý nghĩa của ký hiệu', isCorrect: false },
        { id: 'B', text: 'Đóng vai trò như ngữ điệu giọng nói, thể hiện thái độ, cảm xúc và sắc thái ngữ pháp', isCorrect: true },
        { id: 'C', text: 'Luôn phải giữ khuôn mặt nghiêm nghị không cảm xúc với mọi từ', isCorrect: false },
        { id: 'D', text: 'Thay thế hoàn toàn cho cử chỉ bàn tay', isCorrect: false },
      ],
      explanation: 'Biểu cảm nét mặt và ánh mắt (Non-manual markers) tương đương ngữ điệu giọng nói, quyết định sắc thái lịch sự khi cảm ơn, xin lỗi hay mức độ cảm xúc.',
    },
    {
      id: 'tf-face-2',
      question: 'Khi thực hiện ký hiệu "Cảm ơn" hoặc "Xin lỗi", người học cần kết hợp yếu tố nào để tự nhiên và đúng chuẩn?',
      options: [
        { id: 'A', text: 'Nhìn sang hướng khác để tránh giao tiếp bằng mắt', isCorrect: false },
        { id: 'B', text: 'Ánh mắt nhìn thẳng chân thành kết hợp nét mặt phù hợp (mỉm cười nhẹ khi cảm ơn, hối lỗi khi xin lỗi)', isCorrect: true },
        { id: 'C', text: 'Làm động tác thật nhanh hết mức có thể', isCorrect: false },
        { id: 'D', text: 'Đưa tay cao quá đỉnh đầu', isCorrect: false },
      ],
      explanation: 'Giao tiếp bằng mắt (eye contact) và nét mặt đồng điệu với ý nghĩa từ là chuẩn mực văn hóa cốt lõi của cộng đồng Người Điếc.',
    },
  ],
  'rule-spatial-grammar': [
    {
      id: 'tf-space-1',
      question: 'Trong không gian ký hiệu VSL về chủ đề Gia đình & Xưng hô, thứ bậc tuổi tác thường được thể hiện như thế nào?',
      options: [
        { id: 'A', text: 'Người lớn tuổi định vị ở vị trí cao hơn, người nhỏ tuổi hơn hạ tay thấp hơn trong không gian trước ngực', isCorrect: true },
        { id: 'B', text: 'Tất cả mọi thành viên đều đặt ở cùng một độ cao dưới thắt lưng', isCorrect: false },
        { id: 'C', text: 'Người nhỏ tuổi luôn đặt cao hơn người lớn tuổi', isCorrect: false },
        { id: 'D', text: 'Phải quay lưng lại khi nói về ông bà', isCorrect: false },
      ],
      explanation: 'VSL tận dụng không gian 3 chiều trực quan: vị trí cao/thấp và trái/phải giúp phân biệt thế hệ (ông bà, bố mẹ, anh chị, em) và nhánh nội/ngoại rõ ràng.',
    },
    {
      id: 'tf-space-2',
      question: 'Với các động từ định hướng trong không gian (như "Giúp đỡ", "Cho", "Khám bệnh"), hướng di chuyển của bàn tay cho biết điều gì?',
      options: [
        { id: 'A', text: 'Cho biết thời tiết lúc giao tiếp', isCorrect: false },
        { id: 'B', text: 'Chỉ rõ ai là chủ thể thực hiện và ai là người tiếp nhận hành động mà không cần thêm hư từ "cho"', isCorrect: true },
        { id: 'C', text: 'Không mang ý nghĩa gì, di chuyển hướng nào cũng giống nhau', isCorrect: false },
        { id: 'D', text: 'Cho biết số lượng đồ vật', isCorrect: false },
      ],
      explanation: 'Điểm xuất phát và điểm đích của bàn tay trong không gian 3D tích hợp sẵn chủ thể và đối tượng nhận (ví dụ: tôi giúp bạn -> tay hướng từ ngực tôi về phía bạn).',
    },
  ],
  'rule-sov': [
    {
      id: 'tf-sov-1',
      question: 'Khi chuyển câu tiếng Việt "Anh ăn phở" sang Ngôn ngữ Ký hiệu Việt Nam, trật tự ký hiệu chuẩn là gì?',
      options: [
        { id: 'A', text: 'Anh → Ăn → Phở (giống nguyên xi tiếng Việt nói)', isCorrect: false },
        { id: 'B', text: 'Anh → Phở → Ăn (Chủ ngữ + Món ăn/Bổ ngữ + Động từ)', isCorrect: true },
        { id: 'C', text: 'Ăn → Phở → Anh', isCorrect: false },
        { id: 'D', text: 'Phở → Anh → Đang', isCorrect: false },
      ],
      explanation: 'Theo quy tắc Chủ đề – Lời dẫn (SOV), đối tượng "Phở" được đưa ra định hình trước rồi mới thực hiện hành động "Ăn".',
    },
    {
      id: 'tf-sov-2',
      question: 'Vì sao VSL ưu tiên đặt sự vật/bổ ngữ lên trước động từ hành động?',
      options: [
        { id: 'A', text: 'Để kiến tạo hình ảnh sự vật rõ ràng trong không gian thị giác trước khi diễn tả tác động lên sự vật đó', isCorrect: true },
        { id: 'B', text: 'Vì VSL không có động từ', isCorrect: false },
        { id: 'C', text: 'Để làm câu dài hơn tiếng Việt nói', isCorrect: false },
        { id: 'D', text: 'Do quy định ngẫu nhiên không có lý do thị giác', isCorrect: false },
      ],
      explanation: 'Tư duy thị giác cần thấy "cái gì" trước rồi mới thấy "làm gì với cái đó", giúp người đối diện nắm bắt thông điệp tức thì.',
    },
  ],
  'rule-compound-words': [
    {
      id: 'tf-comp-1',
      question: 'Quy tắc tạo "Từ ghép" trong Ngôn ngữ Ký hiệu Việt Nam hoạt động như thế nào?',
      options: [
        { id: 'A', text: 'Đánh vần từng chữ cái của tất cả các từ dài', isCorrect: false },
        { id: 'B', text: 'Lắp ghép tuần tự, liền mạch các ký hiệu đơn lẻ mang đặc trưng hình ảnh (ví dụ: Mái nhà + Học = Trường học)', isCorrect: true },
        { id: 'C', text: 'Bỏ hết ký hiệu đầu, chỉ giữ ký hiệu cuối', isCorrect: false },
        { id: 'D', text: 'Dừng nghỉ 5 giây giữa hai ký hiệu thành phần', isCorrect: false },
      ],
      explanation: 'Từ ghép VSL kết hợp mượt mà hai ký hiệu gốc mang tính biểu trưng cao (như Hoa + Màu hồng = Hoa hồng; Nhà + Học = Trường học).',
    },
    {
      id: 'tf-comp-2',
      question: 'Khi biểu diễn một từ ghép VSL gồm hai ký hiệu thành phần, nhịp độ chuyển động cần lưu ý điều gì?',
      options: [
        { id: 'A', text: 'Chuyển tiếp liền mạch, gọn nhịp giữa hai ký hiệu để tạo thành một đơn vị từ thống nhất', isCorrect: true },
        { id: 'B', text: 'Hạ tay xuống buông thõng sau ký hiệu thứ nhất rồi mới làm ký hiệu thứ hai', isCorrect: false },
        { id: 'C', text: 'Chỉ làm bằng một ngón tay út', isCorrect: false },
        { id: 'D', text: 'Nhắm mắt khi chuyển giữa hai ký hiệu', isCorrect: false },
      ],
      explanation: 'Sự liền mạch và rút gọn nhẹ biên độ giúp người xem nhận biết đó là một từ ghép thay vì hai câu tách rời.',
    },
  ],
  'rule-negation': [
    {
      id: 'tf-neg-1',
      question: 'Trong câu phủ định VSL (ví dụ: "Anh từ chối uống rượu"), từ mang nghĩa phủ định được đặt ở đâu?',
      options: [
        { id: 'A', text: 'Đặt ở đầu câu trước chủ ngữ', isCorrect: false },
        { id: 'B', text: 'Nêu sự việc trước (Anh / Rượu / Uống) rồi chốt từ phủ định (Từ chối / Không) ở CUỐI CÂU kèm lắc đầu', isCorrect: true },
        { id: 'C', text: 'Lược bỏ luôn từ phủ định', isCorrect: false },
        { id: 'D', text: 'Đặt ngay sau chủ ngữ giống tiếng Việt nói', isCorrect: false },
      ],
      explanation: 'Trong VSL, toàn bộ sự việc được trình bày trước để người xem hiểu bối cảnh, sau đó mới phủ định ở cuối câu kết hợp cái lắc đầu dứt khoát.',
    },
    {
      id: 'tf-neg-2',
      question: 'Cử chỉ phi thủ công (không dùng tay) nào đi kèm bắt buộc để nhấn mạnh câu phủ định trong VSL?',
      options: [
        { id: 'A', text: 'Gật đầu liên tục', isCorrect: false },
        { id: 'B', text: 'Lắc đầu nhẹ hoặc dứt khoát đồng thời với ký hiệu phủ định', isCorrect: true },
        { id: 'C', text: 'Ngước nhìn lên trần nhà', isCorrect: false },
        { id: 'D', text: 'Nghiêng người sang trái 90 độ', isCorrect: false },
      ],
      explanation: 'Cái lắc đầu là thành tố ngữ pháp quan trọng đồng hành cùng các ký hiệu "Không", "Chưa", "Không cần", "Từ chối".',
    },
  ],
  'rule-tense-time': [
    {
      id: 'tf-time-1',
      question: 'Ngôn ngữ Ký hiệu Việt Nam biểu đạt thời gian và thì (quá khứ, hiện tại, tương lai) bằng cách nào?',
      options: [
        { id: 'A', text: 'Chia đuôi động từ giống tiếng Anh (-ed, -ing)', isCorrect: false },
        { id: 'B', text: 'Không chia động từ; đặt từ chỉ mốc thời gian (Hôm qua, Bây giờ, Buổi sáng, Chủ nhật...) ở ĐẦU CÂU', isCorrect: true },
        { id: 'C', text: 'Luôn thêm ký hiệu "Đã" và "Đang" vào trước mọi động từ', isCorrect: false },
        { id: 'D', text: 'Đặt mốc thời gian ở giữa động từ và bổ ngữ', isCorrect: false },
      ],
      explanation: 'Đặt từ chỉ thời gian lên đầu câu giúp thiết lập khung thời gian tham chiếu ngay từ đầu (ví dụ: Buổi sáng / Em / Thức dậy).',
    },
    {
      id: 'tf-time-2',
      question: 'Câu "Chủ nhật em đi công viên" khi chuyển sang trật tự VSL chuẩn sẽ lược bỏ hư từ và sắp xếp như thế nào?',
      options: [
        { id: 'A', text: 'Em / Đi / Công viên / Vào / Chủ nhật', isCorrect: false },
        { id: 'B', text: 'Chủ nhật / Em / Công viên / Đi', isCorrect: true },
        { id: 'C', text: 'Đi / Chủ nhật / Công viên / Em', isCorrect: false },
        { id: 'D', text: 'Công viên / Đang / Đi / Chủ nhật', isCorrect: false },
      ],
      explanation: 'Mốc thời gian "Chủ nhật" đứng đầu làm bối cảnh, tiếp theo là Chủ ngữ "Em", Địa điểm "Công viên" và Động từ "Đi" ở cuối.',
    },
  ],
  'rule-noun-numeral': [
    {
      id: 'tf-num-1',
      question: 'Khi diễn đạt số lượng sự vật như "3 quyển sách" hay "4 sinh viên" trong VSL, thứ tự nào là đúng?',
      options: [
        { id: 'A', text: 'Làm ký hiệu Số lượng trước rồi mới làm Danh từ sau', isCorrect: false },
        { id: 'B', text: 'Làm ký hiệu Danh từ (Sách / Sinh viên) trước, sau đó mới biểu thị Số từ (3 / 4)', isCorrect: true },
        { id: 'C', text: 'Chỉ cần giơ ngón tay đếm số, bỏ qua danh từ', isCorrect: false },
        { id: 'D', text: 'Viết con số lên không trung bằng cùi chỏ', isCorrect: false },
      ],
      explanation: 'Người đối diện cần biết đối tượng là gì (Sách, Sinh viên) trước khi nhận thông tin định lượng bao nhiêu (Danh từ + Số từ).',
    },
  ],
  'rule-questions': [
    {
      id: 'tf-q-1',
      question: 'Trong câu hỏi tìm thông tin VSL (Ai, Ở đâu, Bao nhiêu, Tại sao, Thế nào), từ để hỏi nằm ở đâu?',
      options: [
        { id: 'A', text: 'Đặt ở CUỐI CÂU kết hợp ánh mắt và nét mặt nghi vấn', isCorrect: true },
        { id: 'B', text: 'Luôn đứng đầu câu trước chủ ngữ', isCorrect: false },
        { id: 'C', text: 'Đặt xen giữa hai âm tiết của danh từ', isCorrect: false },
        { id: 'D', text: 'Không bao giờ dùng từ để hỏi trong VSL', isCorrect: false },
      ],
      explanation: 'Sự việc được nêu làm chủ đề trước, từ để hỏi chốt ở cuối câu (ví dụ: Bạn / Tiền / Bao nhiêu?).',
    },
  ],
};

// Chuẩn hóa thông tin từ vựng đầy đủ video 3 góc quay từ VSL400 / kho từ
export function resolveFullWord(rawWordOrLesson, allWords = VSL400_WORDS) {
  if (!rawWordOrLesson) return null;
  const targetName = String(rawWordOrLesson.word || rawWordOrLesson.wordName || rawWordOrLesson.title || '')
    .replace(/^Ký hiệu\s*["“]?/i, '')
    .replace(/["”]?\s*(chuẩn VSL|chân thành|ngọt ngào)?$/i, '')
    .split('&')[0]
    .replace(/["”]/g, '')
    .trim();

  const targetSlug = String(rawWordOrLesson.slug || '').trim().toLowerCase();

  const found =
    allWords.find(
      (w) =>
        (targetSlug && (w.slug || '').toLowerCase() === targetSlug) ||
        (targetName && (w.word || '').toLowerCase() === targetName.toLowerCase())
    ) ||
    allWords.find(
      (w) =>
        targetName &&
        ((w.word || '').toLowerCase().includes(targetName.toLowerCase()) ||
          targetName.toLowerCase().includes((w.word || '').toLowerCase()))
    );

  if (found) {
    return {
      ...found,
      id: found.id || `vsl-${found.slug}`,
      word: found.word,
      wordName: found.word,
      title: found.word,
      slug: found.slug,
      videoFront: found.videoFront || found.videoUrl || `/vsl400_videos/${found.slug}_front.mp4`,
      videoLeft: found.videoLeft || found.videoSide || `/vsl400_videos/${found.slug}_left.mp4`,
      videoRight: found.videoRight || `/vsl400_videos/${found.slug}_right.mp4`,
      videoSide: found.videoSide || found.videoLeft || `/vsl400_videos/${found.slug}_left.mp4`,
      difficulty: found.difficulty || rawWordOrLesson.level || 'Dễ',
      topicTitle: found.topicLabel || rawWordOrLesson.topicTitle || 'Từ vựng VSL',
    };
  }

  if (!targetName) return null;
  const fallbackSlug = targetSlug || 'cam_on';
  return {
    id: rawWordOrLesson.id || `vsl-${fallbackSlug}`,
    word: targetName,
    wordName: targetName,
    title: targetName,
    slug: fallbackSlug,
    videoFront: rawWordOrLesson.videoFront || rawWordOrLesson.videoUrl || `/vsl400_videos/${fallbackSlug}_front.mp4`,
    videoLeft: rawWordOrLesson.videoSideUrl || `/vsl400_videos/${fallbackSlug}_left.mp4`,
    videoRight: `/vsl400_videos/${fallbackSlug}_right.mp4`,
    videoSide: rawWordOrLesson.videoSideUrl || `/vsl400_videos/${fallbackSlug}_left.mp4`,
    difficulty: rawWordOrLesson.difficulty || rawWordOrLesson.level || 'Dễ',
    topicTitle: rawWordOrLesson.topicTitle || 'Từ vựng VSL',
  };
}

/**
 * 1. Sinh bộ câu hỏi Trắc nghiệm Lý thuyết (Ngữ pháp + Kiến thức ký hiệu của chuyên đề/chặng)
 */
export function buildTheoryQuizQuestions({ grammarRuleId, topicTitle, wordsPool = [], count = 4 }) {
  const normalizedRuleId =
    grammarRuleId === 'rule-compound'
      ? 'rule-compound-words'
      : grammarRuleId === 'rule-question'
        ? 'rule-questions'
        : grammarRuleId;

  const specificQuestions = RULE_THEORY_BANK[normalizedRuleId] || [];
  const matchedRule = VSL_GRAMMAR_RULES.find(
    (r) =>
      r.id === grammarRuleId ||
      (grammarRuleId === 'rule-compound-words' && r.id === 'rule-compound') ||
      (grammarRuleId === 'rule-questions' && r.id === 'rule-question')
  );

  const dynamicQuestions = [];

  if (matchedRule && matchedRule.spokenExample && matchedRule.signExample) {
    dynamicQuestions.push({
      id: `dyn-rule-${matchedRule.id}`,
      question: `Theo quy tắc "${matchedRule.title}", cách chuyển câu mẫu "${matchedRule.spokenExample.text}" sang ký hiệu VSL chuẩn là gì?`,
      options: [
        { id: 'A', text: matchedRule.signExample.text, isCorrect: true },
        { id: 'B', text: `${matchedRule.spokenExample.text} (giữ nguyên mọi hư từ tiếng nói)`, isCorrect: false },
        { id: 'C', text: 'Chỉ đánh vần chữ cái đầu tiên của câu', isCorrect: false },
        { id: 'D', text: 'Đảo ngược toàn bộ các từ từ cuối lên đầu bất kể ngữ cảnh', isCorrect: false },
      ],
      explanation: matchedRule.summary,
    });
  }

  // Câu hỏi kiến thức tổng quát về lược bỏ hư từ & quan sát 3 góc quay
  dynamicQuestions.push({
    id: 'dyn-economy-vsl',
    question: `Khi ghép câu giao tiếp thuộc chủ đề "${topicTitle || 'VSL'}", các hư từ tiếng Việt như "đang", "ở", "là", "bằng" được xử lý thế nào?`,
    options: [
      { id: 'A', text: 'Bắt buộc phải đánh vần từng chữ cái cho mỗi hư từ', isCorrect: false },
      { id: 'B', text: 'Lược bỏ các hư từ không mang hình ảnh, tập trung vào thực từ chính và ngữ cảnh không gian', isCorrect: true },
      { id: 'C', text: 'Thay thế tất cả hư từ bằng tiếng vỗ tay', isCorrect: false },
      { id: 'D', text: 'Lặp lại chủ ngữ hai lần thay cho hư từ', isCorrect: false },
    ],
    explanation: 'Tính kinh tế thị giác (Sign Economy) trong VSL giúp câu ký hiệu ngắn gọn, giàu hình tượng và truyền đạt nhanh chóng.',
  });

  if (wordsPool.length >= 2) {
    const sampleNames = wordsPool
      .slice(0, 3)
      .map((w) => w.word || w.title)
      .filter(Boolean)
      .join(', ');
    dynamicQuestions.push({
      id: 'dyn-practice-method',
      question: `Khi học nhóm ký hiệu (${sampleNames}) trong phần này, yếu tố nào cần kiểm tra đồng thời để AI chấm điểm chuẩn xác?`,
      options: [
        { id: 'A', text: 'Chỉ cần vung tay nhanh, không cần quan tâm hình dạng ngón tay', isCorrect: false },
        { id: 'B', text: 'Hình dạng bàn tay/ngón tay, vị trí đặt tay so với cơ thể và quỹ đạo chuyển động đúng nhịp', isCorrect: true },
        { id: 'C', text: 'Đứng cách xa camera 5 mét trong phòng tối', isCorrect: false },
        { id: 'D', text: 'Giấu một bên vai ra khỏi khung hình camera', isCorrect: false },
      ],
      explanation: 'Hệ thống AI MediaPipe + FastDTW đối chiếu cả 3 tiêu chí: góc gập ngón tay, vị trí không gian so với thân người và quỹ đạo chuyển động.',
    });
  }

  const combined = [...specificQuestions, ...dynamicQuestions, ...VSL_GRAMMAR_QUIZ];
  const seen = new Set();
  const unique = [];
  for (const q of combined) {
    if (!seen.has(q.id)) {
      seen.add(q.id);
      unique.push(q);
    }
    if (unique.length >= count) break;
  }
  return unique;
}

/**
 * 2. Sinh bộ câu hỏi Trắc nghiệm Toàn từ từ Video Mẫu (xem video -> chọn đúng từ vựng)
 */
export function buildVideoQuizQuestions(wordsPool = [], allWords = VSL400_WORDS, count = 5) {
  const resolvedTargets = wordsPool
    .map((w) => resolveFullWord(w, allWords))
    .filter(Boolean);

  // Bổ sung nếu chặng có ít hơn count từ
  const pool = [...resolvedTargets];
  if (pool.length < count) {
    for (const w of allWords) {
      if (pool.length >= count) break;
      if (!pool.some((p) => p.slug === w.slug)) {
        const full = resolveFullWord(w, allWords);
        if (full) pool.push(full);
      }
    }
  }

  const selectedTargets = pool.slice(0, Math.min(count, pool.length));
  const distractorPool = [
    ...resolvedTargets,
    ...allWords.slice(0, 60).map((w) => resolveFullWord(w, allWords)).filter(Boolean),
  ];

  return selectedTargets.map((target, qIdx) => {
    const distractors = [];
    const usedNames = new Set([target.word.toLowerCase()]);

    // Xáo trộn nhẹ dựa trên chỉ số để ổn định nhưng đa dạng đáp án nhiễu
    const offset = (qIdx * 7 + 3) % Math.max(1, distractorPool.length);
    for (let i = 0; i < distractorPool.length && distractors.length < 3; i++) {
      const cand = distractorPool[(offset + i) % distractorPool.length];
      if (cand && cand.word && !usedNames.has(cand.word.toLowerCase())) {
        usedNames.add(cand.word.toLowerCase());
        distractors.push(cand.word);
      }
    }

    const rawOptions = [
      { text: target.word, isCorrect: true },
      ...distractors.map((d) => ({ text: d, isCorrect: false })),
    ];

    // Xếp vị trí đáp án đúng luân phiên A/B/C/D để không bị trùng một cột
    const shift = qIdx % rawOptions.length;
    const rotated = [
      ...rawOptions.slice(shift),
      ...rawOptions.slice(0, shift),
    ];
    const letters = ['A', 'B', 'C', 'D'];

    return {
      id: `vq-${target.slug}-${qIdx}`,
      targetWord: target,
      options: rotated.map((opt, idx) => ({
        id: letters[idx] || String(idx + 1),
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
    };
  });
}

/**
 * 3. Sinh hàng đợi Thử thách Thực hiện Ký hiệu từ Từ có sẵn (Camera AI)
 */
export function buildSignChallengeQueue(wordsPool = [], allWords = VSL400_WORDS, count = 4) {
  const resolved = wordsPool
    .map((w) => resolveFullWord(w, allWords))
    .filter(Boolean);

  const unique = [];
  const seen = new Set();
  for (const w of resolved) {
    if (!seen.has(w.slug)) {
      seen.add(w.slug);
      unique.push(w);
    }
    if (unique.length >= count) break;
  }

  if (unique.length === 0) {
    return allWords
      .slice(0, count)
      .map((w) => resolveFullWord(w, allWords))
      .filter(Boolean);
  }
  return unique;
}

/**
 * 4. Sinh hàng đợi Ôn lại Từ vựng Đã lưu & Củng cố Từ cũ (tích hợp SRS)
 */
export function buildSavedReviewQueue({
  trackedWords = [],
  topicId = null,
  stageWords = [],
  allWords = VSL400_WORDS,
  maxCount = 5,
}) {
  // 1. Ưu tiên các từ người học đã bấm Lưu (isSavedBookmark) hoặc đang đến hạn ôn (isDue)
  const bookmarkedOrDue = trackedWords.filter((item) => item.isSavedBookmark || item.isDue);
  const inSameTopic = topicId
    ? bookmarkedOrDue.filter((item) => item.topicId === topicId)
    : [];
  const otherSaved = bookmarkedOrDue.filter(
    (item) => !topicId || item.topicId !== topicId
  );

  // 2. Các từ khác đã học trong SRS chưa đạt Nhớ Dài Hạn
  const otherTracked = trackedWords.filter(
    (item) => !item.isSavedBookmark && !item.isDue && (item.memoryLevel || 0) < 5
  );

  const orderedCandidates = [...inSameTopic, ...otherSaved, ...otherTracked];
  const queue = [];
  const seenSlugs = new Set();

  for (const item of orderedCandidates) {
    const slug = (item.slug || '').toLowerCase();
    if (slug && !seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      queue.push(item);
    }
    if (queue.length >= maxCount) break;
  }

  // 3. Nếu người học mới bắt đầu chưa lưu đủ từ, bổ sung từ các từ trong chặng/chuyên đề để luôn ôn tập được ngay
  if (queue.length < Math.min(3, maxCount) && stageWords.length > 0) {
    for (const sw of stageWords) {
      const full = resolveFullWord(sw, allWords);
      if (full && !seenSlugs.has(full.slug)) {
        seenSlugs.add(full.slug);
        queue.push({
          id: full.id,
          slug: full.slug,
          wordName: full.word,
          title: full.word,
          topicId: topicId || full.topic || 'greeting',
          topicTitle: full.topicTitle || 'Từ vựng trọng tâm',
          difficulty: full.difficulty || 'Dễ',
          videoFront: full.videoFront,
          videoSide: full.videoSide,
          memoryLevel: 0,
          isSavedBookmark: false,
        });
      }
      if (queue.length >= maxCount) break;
    }
  }

  return queue;
}

/**
 * 5. Nâng cấp danh sách bài học của 1 Chuyên đề Lộ trình chuẩn thành Chu trình 5 Giai đoạn khoa học:
 *    - Giai đoạn 1: Lý thuyết Ngữ pháp + Trắc nghiệm Lý thuyết
 *    - Giai đoạn 2: Từ vựng ký hiệu chuẩn (có trạm Trắc nghiệm Video giữa chặng nếu chuyên đề nhiều từ)
 *    - Giai đoạn 3: Ôn lại từ vựng đã lưu & củng cố từ cũ
 *    - Giai đoạn 4: Thực hành Câu giao tiếp VSL
 *    - Giai đoạn 5: Bài tập & Thử thách tổng kết (Trắc nghiệm toàn từ qua Video mẫu + Thử thách thực hiện ký hiệu từ từ có sẵn)
 */
export function enrichStandardTopicCurriculum(topic, serverCompletedMap = new Map()) {
  if (!topic) return topic;
  const localCompleted = getStandardCompletedMap();

  const isDone = (id, slug, title) => {
    const lid = String(id || '').toLowerCase();
    const lslug = String(slug || '').toLowerCase();
    const ltitle = String(title || '').toLowerCase().trim();
    if (localCompleted[id] !== undefined) return { completed: true, score: localCompleted[id] };
    if (serverCompletedMap.has(lid)) return { completed: true, score: serverCompletedMap.get(lid) };
    if (lslug && serverCompletedMap.has(lslug)) return { completed: true, score: serverCompletedMap.get(lslug) };
    if (ltitle && serverCompletedMap.has(ltitle)) return { completed: true, score: serverCompletedMap.get(ltitle) };
    return null;
  };

  const rawLessons = Array.isArray(topic.lessons) ? topic.lessons : [];

  // Tách các thành phần gốc (tránh nhân đôi nếu hàm được gọi lại)
  const rawGrammar = rawLessons.filter(
    (l) => l.type === 'grammar' || (l.slug && l.slug.startsWith('ngu-phap-'))
  );
  const rawWords = rawLessons
    .filter(
      (l) =>
        (l.type === 'word' ||
          (!l.type &&
            !l.sentenceSlug &&
            !l.grammarRuleId &&
            !(l.slug && l.slug.startsWith('ngu-phap-')))) &&
        !['quiz_theory', 'quiz_video', 'challenge_sign', 'saved_review'].includes(l.type)
    )
    .map((w) => {
      const done = isDone(w.id, w.slug, w.title);
      return {
        ...w,
        type: 'word',
        phase: 2,
        completed: done ? true : !!w.completed,
        score: done ? done.score : w.score || 0,
      };
    });

  // Khôi phục danh sách bài luyện câu nếu đồng bộ từ backend chưa có sampleSentences
  let rawSentences = rawLessons.filter((l) => l.type === 'sentence' || l.sentenceSlug);
  if (rawSentences.length === 0 && Array.isArray(topic.sampleSentences)) {
    rawSentences = topic.sampleSentences.map((sent) => ({
      id: `sent-${topic.id}-${sent.slug}`,
      type: 'sentence',
      sentenceSlug: sent.slug,
      title: `Câu VSL: "${sent.title}"`,
      description: `Thực hành câu giao tiếp ứng dụng chuyên đề "${topic.title}".`,
      duration: '3-4 phút',
      level: 'Thực hành',
      badge: 'Luyện câu',
      topicId: topic.id,
      topicTitle: topic.title,
      completed: false,
      score: 0,
    }));
  }
  rawSentences = rawSentences.map((s) => {
    const done = isDone(s.id, s.sentenceSlug, s.title);
    return {
      ...s,
      type: 'sentence',
      phase: 4,
      completed: done ? true : !!s.completed,
      score: done ? done.score : s.score || 0,
    };
  });

  // Giai đoạn 1: Ngữ pháp + Trắc nghiệm lý thuyết
  const phase1 = [];
  if (rawGrammar.length > 0) {
    rawGrammar.forEach((g) => {
      const done = isDone(g.id, g.slug, g.title);
      phase1.push({
        ...g,
        type: 'grammar',
        phase: 1,
        grammarRuleId: g.grammarRuleId || topic.grammarRuleId,
        completed: done ? true : !!g.completed,
        score: done ? done.score : g.score || 0,
      });
    });
  } else if (topic.grammarRuleId && topic.grammarRuleTitle) {
    const gid = `gram-${topic.id}`;
    const done = isDone(gid, null, topic.grammarRuleTitle);
    phase1.push({
      id: gid,
      type: 'grammar',
      phase: 1,
      grammarRuleId: topic.grammarRuleId,
      title: `Bài học Ngữ pháp: ${topic.grammarRuleTitle}`,
      description: topic.grammarTip || 'Nắm vững quy tắc ngữ pháp chuẩn để ghép câu tự nhiên.',
      duration: '5 phút',
      level: 'Lý thuyết',
      badge: 'Ngữ pháp',
      topicId: topic.id,
      topicTitle: topic.title,
      completed: done ? true : false,
      score: done ? done.score : 0,
    });
  }

  const theoryQuizId = `act-theory-${topic.id}`;
  const theoryDone = isDone(theoryQuizId, theoryQuizId, null);
  phase1.push({
    id: theoryQuizId,
    type: 'quiz_theory',
    phase: 1,
    grammarRuleId: topic.grammarRuleId || 'rule-sov',
    title: `Trắc nghiệm Lý thuyết: Ngữ pháp & Quy tắc "${topic.title}"`,
    description: 'Kiểm tra nhanh kiến thức ngữ pháp VSL và quy tắc biểu đạt trước khi vào thực hành.',
    duration: '3 phút',
    level: 'Trắc nghiệm',
    badge: 'Trắc nghiệm lý thuyết',
    topicId: topic.id,
    topicTitle: topic.title,
    targetWords: rawWords.slice(0, 6),
    questionCount: 4,
    completed: !!theoryDone,
    score: theoryDone ? theoryDone.score : 0,
  });

  // Giai đoạn 2: Từ vựng ký hiệu (chèn 1 bài Trắc nghiệm Video giữa chặng nếu >= 12 từ để củng cố tức thì)
  const phase2 = [];
  const midSplit = 10;
  if (rawWords.length >= 12) {
    phase2.push(...rawWords.slice(0, midSplit));
    const midVideoId = `act-mid-vidquiz-${topic.id}`;
    const midVideoDone = isDone(midVideoId, midVideoId, null);
    phase2.push({
      id: midVideoId,
      type: 'quiz_video',
      phase: 2,
      title: `Kiểm tra nhanh: Đoán từ qua Video mẫu (Nhóm từ đầu)`,
      description: 'Quan sát video mẫu của 5 từ vừa học và chọn đáp án chính xác để khắc sâu trí nhớ thị giác.',
      duration: '3 phút',
      level: 'Nhận diện',
      badge: 'Trắc nghiệm video',
      topicId: topic.id,
      topicTitle: topic.title,
      targetWords: rawWords.slice(0, midSplit),
      questionCount: 5,
      completed: !!midVideoDone,
      score: midVideoDone ? midVideoDone.score : 0,
    });
    phase2.push(...rawWords.slice(midSplit));
  } else {
    phase2.push(...rawWords);
  }

  // Giai đoạn 3: Ôn lại từ vựng đã lưu & từ cũ
  const savedReviewId = `act-saved-review-${topic.id}`;
  const savedReviewDone = isDone(savedReviewId, savedReviewId, null);
  const phase3 = [
    {
      id: savedReviewId,
      type: 'saved_review',
      phase: 3,
      title: 'Ôn lại Từ vựng Đã lưu & Củng cố Trí nhớ',
      description: 'Ôn tập các từ bạn đã lưu và các từ đã học theo cơ chế lặp lại ngắt quãng để nhớ lâu bền.',
      duration: '4 phút',
      level: 'Ôn tập SRS',
      badge: 'Ôn từ đã lưu',
      topicId: topic.id,
      topicTitle: topic.title,
      targetWords: rawWords.slice(0, 6),
      completed: !!savedReviewDone,
      score: savedReviewDone ? savedReviewDone.score : 0,
    },
  ];

  // Giai đoạn 4: Câu giao tiếp thực hành
  const phase4 = [...rawSentences];

  // Giai đoạn 5: Bài tập & Thử thách tổng kết chuyên đề
  const fullVideoQuizId = `act-full-vidquiz-${topic.id}`;
  const fullVideoDone = isDone(fullVideoQuizId, fullVideoQuizId, null);
  const signChallengeId = `act-sign-challenge-${topic.id}`;
  const signChallengeDone = isDone(signChallengeId, signChallengeId, null);

  const phase5 = [
    {
      id: fullVideoQuizId,
      type: 'quiz_video',
      phase: 5,
      title: `Trắc nghiệm nhận diện từ qua Video mẫu: "${topic.title}"`,
      description: 'Thử thách nhận diện chính xác ý nghĩa các ký hiệu qua video mẫu đa góc quay của toàn chuyên đề.',
      duration: '4 phút',
      level: 'Thử thách',
      badge: 'Trắc nghiệm video',
      topicId: topic.id,
      topicTitle: topic.title,
      targetWords: rawWords,
      questionCount: 6,
      completed: !!fullVideoDone,
      score: fullVideoDone ? fullVideoDone.score : 0,
    },
    {
      id: signChallengeId,
      type: 'challenge_sign',
      phase: 5,
      title: `Thử thách Ký hiệu: Biểu diễn từ có sẵn trước Camera AI`,
      description: 'Hệ thống đưa ra các từ vựng trọng tâm của chuyên đề, bạn tự nhớ và thực hiện ký hiệu đạt chuẩn AI.',
      duration: '5 phút',
      level: 'Thực chiến AI',
      badge: 'Thử thách ký hiệu',
      topicId: topic.id,
      topicTitle: topic.title,
      targetWords: rawWords.slice(0, 8),
      questionCount: 4,
      completed: !!signChallengeDone,
      score: signChallengeDone ? signChallengeDone.score : 0,
    },
  ];

  const allLessons = [...phase1, ...phase2, ...phase3, ...phase4, ...phase5];
  const completedCount = allLessons.filter((l) => l.completed).length;

  return {
    ...topic,
    lessons: allLessons,
    totalLessons: allLessons.length,
    completedLessons: completedCount,
    vocabCount: rawWords.length,
    grammarCount: phase1.filter((l) => l.type === 'grammar').length,
    sentenceCount: phase4.length,
    challengeCount: allLessons.filter((l) =>
      ['quiz_theory', 'quiz_video', 'challenge_sign'].includes(l.type)
    ).length,
    savedReviewCount: phase3.length,
  };
}
