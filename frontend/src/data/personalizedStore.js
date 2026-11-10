// Store và thuật toán cá nhân hóa lộ trình học theo khả năng (Adaptive Learning Engine)
import { useState, useEffect } from 'react';
import { USER_PROFILE } from './mockData';
import { VSL400_WORDS } from './vsl400Words.js';
import { getStoredToken, progressApi, adaptiveApi } from '../services/api';

export const USER_PROFILE_KEY = 'signlingo_user_profile';
export const PREFERENCES_KEY = 'signlingo_learning_preferences';
export const PRACTICE_HISTORY_KEY = 'signlingo_practice_history';
export const PERSONALIZED_PATH_KEY = 'signlingo_personalized_path';
export const PERSONALIZED_EVENT = 'signlingo_personalized_updated';

// Tra cứu siêu tốc thông tin chuẩn 400 từ vựng VSL (video chính diện, góc nghiêng, slug)
const VSL_WORDS_MAP = new Map();
VSL400_WORDS.forEach(w => {
  if (w.word) VSL_WORDS_MAP.set(w.word.toLowerCase().trim(), w);
  if (w.slug) VSL_WORDS_MAP.set(w.slug.toLowerCase().trim(), w);
});

export function getWordMetadata(wordName) {
  if (!wordName) return null;
  const clean = wordName
    .replace(/^Ký hiệu\s*["“]?/i, '')
    .replace(/["”]?\s*(chuẩn VSL|chân thành|ngọt ngào)?$/i, '')
    .trim()
    .toLowerCase();
  
  const found = VSL_WORDS_MAP.get(clean) || VSL400_WORDS.find(w => 
    w.word.toLowerCase() === clean || 
    clean.includes(w.word.toLowerCase()) || 
    w.word.toLowerCase().includes(clean)
  );
  
  if (found) {
    return {
      word: found.word,
      slug: found.slug,
      wordId: `vsl-${found.slug}`,
      videoUrl: found.videoFront,
      videoSideUrl: found.videoSide || found.videoLeft || `/vsl400_videos/${found.slug}_left.mp4`,
      difficulty: found.difficulty || 'Dễ',
      dominantHand: found.dominantHand || 'right'
    };
  }
  return null;
}

// 1. Quản lý Hồ Sơ Người Dùng (Local Storage)
export function getUserProfile() {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    const hasToken = !!getStoredToken();
    if (!raw) {
      // Mặc định tạo tài khoản mẫu ban đầu theo trạng thái token
      const initial = {
        ...USER_PROFILE,
        isLoggedIn: hasToken,
        hasCompletedOnboarding: hasToken,
        learningLevel: 'beginner', // 'beginner' | 'elementary' | 'intermediate'
        learningGoalMinutes: 15,
        priorityTopic: 'greeting'
      };
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!hasToken) {
      parsed.isLoggedIn = false;
    }
    return parsed;
  } catch (e) {
    return USER_PROFILE;
  }
}

export function saveUserProfile(newProfile) {
  try {
    const current = getUserProfile();
    const updated = { ...current, ...newProfile };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(PERSONALIZED_EVENT, { detail: { profile: updated } }));
    return updated;
  } catch (e) {
    console.error('Lỗi lưu user profile:', e);
    return newProfile;
  }
}

// 2. Lịch Sử Thực Hành & Động Cơ Đánh Giá Khả Năng Thích Ứng (Adaptive Engine)
export function getPracticeHistory() {
  try {
    const raw = localStorage.getItem(PRACTICE_HISTORY_KEY);
    if (!raw) {
      // Dữ liệu mẫu khởi đầu
      const defaultHistory = [
        { word: 'Tạm biệt', score: 94, passed: true, date: '2026-10-28', badJoints: [] },
        { word: 'Cảm ơn', score: 78, passed: false, date: '2026-10-29', badJoints: [1, 2] },
        { word: 'Số 5', score: 95, passed: true, date: '2026-10-30', badJoints: [] }
      ];
      localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify(defaultHistory));
      return defaultHistory;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function recordPracticeSession(session) {
  try {
    const history = getPracticeHistory();
    const updated = [
      {
        ...session,
        id: `sess-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      },
      ...history
    ].slice(0, 30); // Giữ 30 phiên gần nhất

    localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify(updated));
    
    // Tự động phân tích và cập nhật lại Lộ trình cá nhân dựa trên kết quả mới
    recalculateAdaptivePath();

    window.dispatchEvent(new CustomEvent(PERSONALIZED_EVENT, { detail: { history: updated } }));
    return updated;
  } catch (e) {
    console.error('Lỗi ghi nhận lịch sử luyện tập:', e);
  }
}

// 3. Phân Tích Năng Lực Học Tập (Ability & Velocity Analysis)
export function analyzeLearnerCapability() {
  const history = getPracticeHistory();
  const profile = getUserProfile();

  if (!history || history.length === 0) {
    return {
      status: 'NEW_LEARNER',
      statusTitle: 'Khởi đầu mới',
      avgScore: 85,
      paceLevel: 'Tiêu chuẩn',
      recommendation: 'Hệ thống đã thiết lập lộ trình theo mức độ ban đầu bạn đã chọn.',
      adaptiveTag: 'Tiêu chuẩn'
    };
  }

  const recent = history.slice(0, 5);
  const avgScore = Math.round(recent.reduce((sum, h) => sum + (h.score || 0), 0) / recent.length);
  const passRate = Math.round((recent.filter(h => h.passed).length / recent.length) * 100);

  // Phân loại khả năng thích ứng:
  if (avgScore >= 88 && passRate >= 80) {
    return {
      status: 'FAST_PACED',
      statusTitle: 'Tiếp thu xuất sắc (Vượt cấp)',
      avgScore,
      paceLevel: 'Tốc độ cao',
      badgeColor: '#16a34a',
      badgeBg: '#dcfce7',
      recommendation: 'Phản xạ khớp tay rất nhạy bén! AI đã mở khóa sớm các chặng tiếp theo và bổ sung bài thử thách tốc độ.',
      adaptiveTag: 'Tăng tốc',
      hasBooster: false,
      fastTrackUnlocked: true
    };
  } else if (avgScore < 75 || passRate < 50) {
    return {
      status: 'NEEDS_REINFORCEMENT',
      statusTitle: 'Cần củng cố ngón tay',
      avgScore,
      paceLevel: 'Cẩn thận & Từng bước',
      badgeColor: '#ea580c',
      badgeBg: '#ffedd5',
      recommendation: 'AI phát hiện góc mở ngón tay và vị trí tiếp xúc đang còn chệch. Hệ thống tự động thêm bài luyện đệm bổ trợ.',
      adaptiveTag: 'Bổ trợ ngón tay',
      hasBooster: true,
      fastTrackUnlocked: false
    };
  } else {
    return {
      status: 'STEADY',
      statusTitle: 'Tiến độ vững vàng',
      avgScore,
      paceLevel: 'Tiêu chuẩn',
      badgeColor: '#0284c7',
      badgeBg: '#e0f2fe',
      recommendation: 'Nhịp độ học tập rất ổn định. Tiếp tục hoàn thành 2 bài mỗi ngày để xây dựng phản xạ tự nhiên.',
      adaptiveTag: 'Chuẩn xác',
      hasBooster: false,
      fastTrackUnlocked: false
    };
  }
}

// 4. Sinh Cấu Trúc Lộ Trình Cá Nhân Hóa Dựa Vào Trình Độ & Khả Năng Thích Ứng
export function generatePersonalizedPath(level, capability) {
  const currentLevel = level || 'beginner';
  const cap = capability || analyzeLearnerCapability();
  const profile = getUserProfile();
  const priority = profile.priorityTopic || 'greeting';

  let stages = [];

  // MỨC 1: Người mới bắt đầu (Beginner)
  if (currentLevel === 'beginner') {
    const stage1Lessons = [
      {
        id: 'p-beg-1',
        type: 'word',
        title: 'Ký hiệu "Cảm ơn" chuẩn VSL',
        desc: 'Đặt đầu ngón tay lên cằm rồi hạ nhẹ bàn tay về phía trước đối tác giao tiếp',
        duration: '2 phút',
        level: 'Dễ',
        badge: 'Căn bản',
        completed: true,
        score: 95,
        word: 'Cảm ơn'
      },
      {
        id: 'p-beg-2',
        type: 'word',
        title: 'Ký hiệu "Xin lỗi" chân thành',
        desc: 'Nắm bàn tay xoay tròn nhẹ nhàng trên ngực trái (vùng trái tim)',
        duration: '3 phút',
        level: 'Dễ',
        badge: 'Khuyên học hôm nay',
        highlight: true,
        completed: false,
        score: 0,
        word: 'Xin lỗi'
      },
      {
        id: 'p-beg-3',
        type: 'word',
        title: 'Ký hiệu "Giúp đỡ"',
        desc: 'Bàn tay mở đặt dưới mu bàn tay còn lại đưa về phía trước hỗ trợ',
        duration: '2 phút',
        level: 'Trung bình',
        completed: false,
        score: 0,
        word: 'Giúp đỡ'
      },
      {
        id: 'p-beg-4',
        type: 'word',
        title: 'Ký hiệu "Khỏe"',
        desc: 'Hai bàn tay nắm gập vuông góc trước ngực thể hiện sức mạnh',
        duration: '2 phút',
        level: 'Dễ',
        completed: false,
        score: 0,
        word: 'Khỏe'
      },
      {
        id: 'p-beg-gram-1',
        type: 'grammar',
        title: '💡 Điểm hội tụ Ngữ pháp: Biểu cảm nét mặt khi giao tiếp',
        desc: 'Nét mặt là ngữ điệu của người khiếm thính. Giữ ánh mắt ấm áp, miệng mỉm cười nhẹ khi cảm ơn và chào hỏi.',
        duration: '3 phút',
        level: 'Lý thuyết',
        badge: 'Ngữ pháp VSL',
        grammarRuleId: 'rule-facial-expression',
        completed: false
      },
      {
        id: 'p-beg-sent-1',
        type: 'sentence',
        sentenceSlug: 'em-cam-on-anh',
        title: 'Câu thực hành: "Em cảm ơn anh"',
        desc: 'Cấu trúc SOV: Em + Người nhận (Anh) + Động từ (Cảm ơn)',
        duration: '4 phút',
        level: 'Thực hành',
        badge: 'Luyện câu VSL',
        completed: false
      }
    ];

    if (cap.hasBooster) {
      stage1Lessons.splice(2, 0, {
        id: 'p-booster-1',
        type: 'word',
        title: '🤖 Bài bổ trợ AI: Sửa góc mở ngón tay',
        desc: 'AI tự động bổ sung dựa trên camera để sửa góc khép mở ngón tay đạt chuẩn VSL',
        duration: '2 phút',
        level: 'Dễ',
        isAiBooster: true,
        badge: 'Bài thích ứng AI',
        completed: false,
        score: 0,
        word: 'Cảm ơn'
      });
    }

    stages = [
      {
        id: 'stage-1',
        topicId: 'greeting',
        title: 'Chặng 1: Nền Tảng Xã Giao & Biểu Cảm Vỡ Lòng',
        subtitle: 'Làm chủ các cử chỉ giao tiếp cốt lõi và nét mặt thân thiện chuẩn VSL',
        icon: '👋',
        progress: 16,
        color: '#0284c7',
        bgColor: '#f0f9ff',
        lessons: stage1Lessons
      },
      {
        id: 'stage-2',
        topicId: 'family',
        title: 'Chặng 2: Xưng Hô Gia Đình Gần Gũi',
        subtitle: 'Định vị không gian người thân và xưng hô chuẩn mực theo quy ước VSL',
        icon: '👨‍👩‍👧‍👦',
        progress: 0,
        color: '#059669',
        bgColor: '#ecfdf5',
        lessons: [
          {
            id: 'p-beg-5',
            type: 'word',
            title: 'Ký hiệu "Bố"',
            desc: 'Ký hiệu vuốt nhẹ hai bên ria mép truyền thống thể hiện người cha',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Bố'
          },
          {
            id: 'p-beg-6',
            type: 'word',
            title: 'Ký hiệu "Mẹ"',
            desc: 'Ngón tay trỏ chạm nhẹ cạnh cằm hoặc dái tai biểu trưng cho khuyên tai',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Mẹ'
          },
          {
            id: 'p-beg-7',
            type: 'word',
            title: 'Ký hiệu "Anh" & "Chị"',
            desc: 'Cử chỉ biểu thị bậc anh lớn và chị gái trong gia đình',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Anh'
          },
          {
            id: 'p-beg-8',
            type: 'word',
            title: 'Ký hiệu "Em"',
            desc: 'Bàn tay hạ thấp ngang ngực thể hiện người nhỏ tuổi hơn',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Em'
          },
          {
            id: 'p-beg-gram-2',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Điểm quy chiếu xưng hô gia đình',
            desc: 'Người lớn tuổi hơn đặt ở vị trí cao hơn trước ngực, người nhỏ tuổi hơn hạ tay thấp hơn.',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-spatial-grammar',
            completed: false
          },
          {
            id: 'p-beg-sent-2',
            type: 'sentence',
            sentenceSlug: 'bo-me-giup-do-em',
            title: 'Câu thực hành: "Bố mẹ giúp đỡ em"',
            desc: 'Chủ ngữ liên hợp + Động từ định hướng tương tác',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      },
      {
        id: 'stage-3',
        topicId: 'food',
        title: 'Chặng 3: Ẩm Thực Cơ Bản & Nguyên Lý SOV',
        subtitle: 'Khám phá quy tắc ngữ pháp cốt lõi VSL: Đưa món ăn lên trước động từ Ăn/Uống',
        icon: '🍲',
        progress: 0,
        color: '#d97706',
        bgColor: '#fffbeb',
        lessons: [
          {
            id: 'p-beg-9',
            type: 'word',
            title: 'Ký hiệu "Phở"',
            desc: 'Tay trái khum hình bát, tay phải chụm ngón gắp đưa lên miệng',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Phở'
          },
          {
            id: 'p-beg-10',
            type: 'word',
            title: 'Ký hiệu "Bún"',
            desc: 'Ký hiệu sợi bún mềm cuộn tròn gắp ăn kèm nước dùng',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bún'
          },
          {
            id: 'p-beg-11',
            type: 'word',
            title: 'Ký hiệu "Bánh bao"',
            desc: 'Hai bàn tay chụm tròn lại tạo hình chiếc bánh bao xốp',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bánh bao'
          },
          {
            id: 'p-beg-12',
            type: 'word',
            title: 'Ký hiệu "Cà phê"',
            desc: 'Hai tay làm cử chỉ quấy thìa cà phê phin đậm đà thơm ngát',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Cà phê'
          },
          {
            id: 'p-beg-gram-3',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Trật tự SOV (Chủ - Bổ - Động)',
            desc: 'Luôn đưa món ăn/thức uống lên trước hành động (Chủ ngữ + Món ăn + Ăn/Uống), khác với tiếng Việt nói SVO.',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-sov',
            completed: false
          },
          {
            id: 'p-beg-sent-3',
            type: 'sentence',
            sentenceSlug: 'anh-an-pho',
            title: 'Câu thực hành: "Anh ăn phở"',
            desc: 'Cấu trúc SOV: Anh (Chủ) + Phở (Món ăn) + Ăn (Động từ)',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      },
      {
        id: 'stage-4',
        topicId: 'daily',
        title: 'Chặng 4: Sinh Hoạt Hàng Ngày & Đồ Dùng',
        subtitle: 'Gọi tên đồ dùng sinh hoạt và áp dụng quy tắc từ ghép VSL',
        icon: '🏠',
        progress: 0,
        color: '#7c3aed',
        bgColor: '#faf5ff',
        lessons: [
          {
            id: 'p-beg-13',
            type: 'word',
            title: 'Ký hiệu "Ba lô"',
            desc: 'Hai tay nắm dây đeo vai ba lô nhấc nhẹ lên lưng',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Ba lô'
          },
          {
            id: 'p-beg-14',
            type: 'word',
            title: 'Ký hiệu "Cái bàn"',
            desc: 'Ký hiệu mặt bàn phẳng rộng kèm 4 chân bàn vuông vắn',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Cái bàn'
          },
          {
            id: 'p-beg-15',
            type: 'word',
            title: 'Ký hiệu "Cái ghế"',
            desc: 'Hai ngón tay uốn cong móc vào cạnh bàn tay kia mô phỏng người ngồi ghế',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Cái ghế'
          },
          {
            id: 'p-beg-16',
            type: 'word',
            title: 'Ký hiệu "Cái cửa"',
            desc: 'Hai lòng bàn tay khép mở nhịp nhàng mô phỏng hai cánh cửa',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Cái cửa'
          },
          {
            id: 'p-beg-gram-4',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Quy tắc từ ghép trong VSL',
            desc: 'Ghép trực tiếp các ký hiệu đơn lẻ để tạo từ ghép: Cái + Bàn, Ba lô + Mua.',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-compound-words',
            completed: false
          },
          {
            id: 'p-beg-sent-4',
            type: 'sentence',
            sentenceSlug: 'em-mua-ba-lo',
            title: 'Câu thực hành: "Em mua chiếc ba lô"',
            desc: 'Cấu trúc SOV: Em + Ba lô + Mua liên tiếp',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      }
    ];
  }

  // MỨC 2: Sơ cấp (Elementary)
  else if (currentLevel === 'elementary') {
    stages = [
      {
        id: 'stage-1',
        topicId: 'food',
        title: 'Chặng 1: Ẩm Thực Truyền Thống & Kỹ Thuật Từ Ghép',
        subtitle: 'Làm chủ các món ăn phức tạp và nguyên lý lắp ghép ký hiệu VSL',
        icon: '🍲',
        progress: 0,
        color: '#0284c7',
        bgColor: '#f0f9ff',
        lessons: [
          {
            id: 'p-elem-1',
            type: 'word',
            title: 'Ký hiệu "Bánh chưng"',
            desc: 'Hai bàn tay xếp vuông vắn tạo hình chiếc bánh chưng xanh ngày Tết',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bánh chưng'
          },
          {
            id: 'p-elem-2',
            type: 'word',
            title: 'Ký hiệu "Bánh tét"',
            desc: 'Hai bàn tay cuộn tròn dài mô phỏng đòn bánh tét truyền thống',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bánh tét'
          },
          {
            id: 'p-elem-3',
            type: 'word',
            title: 'Ký hiệu "Bánh xèo"',
            desc: 'Cử chỉ lật chiếc bánh xèo giòn rụm trên chảo nóng',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bánh xèo'
          },
          {
            id: 'p-elem-4',
            type: 'word',
            title: 'Ký hiệu "Bia"',
            desc: 'Cử chỉ nâng ly bia chúc mừng sủi bọt vui vẻ',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Bia'
          },
          {
            id: 'p-elem-gram-1',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Từ ghép ẩm thực và văn hóa VSL',
            desc: 'Ghép ký hiệu loại hình bánh + hình dáng đặc trưng (vuông = bánh chưng, tròn dài = bánh tét).',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-compound-words',
            completed: false
          },
          {
            id: 'p-elem-sent-1',
            type: 'sentence',
            sentenceSlug: 'bo-an-banh-chung',
            title: 'Câu thực hành: "Bố ăn bánh chưng"',
            desc: 'Cấu trúc SOV: Bố + Bánh chưng + Ăn',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      },
      {
        id: 'stage-2',
        topicId: 'family',
        title: 'Chặng 2: Họ Hàng & Không Gian Đại Gia Đình',
        subtitle: 'Phân biệt chuẩn xác bên nội, bên ngoại và xưng hô nhiều thế hệ',
        icon: '🏡',
        progress: 0,
        color: '#e11d48',
        bgColor: '#fff1f2',
        lessons: [
          {
            id: 'p-elem-5',
            type: 'word',
            title: 'Ký hiệu "Ông nội" & "Bà nội"',
            desc: 'Ký hiệu râu dài và búi tóc móm mém bên nội thân thương',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Ông nội'
          },
          {
            id: 'p-elem-6',
            type: 'word',
            title: 'Ký hiệu "Ông ngoại" & "Bà ngoại"',
            desc: 'Định vị nhánh bên ngoại ở phía chếch phải trường nhìn',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bà ngoại'
          },
          {
            id: 'p-elem-7',
            type: 'word',
            title: 'Ký hiệu "Bác"',
            desc: 'Ký hiệu người lớn tuổi hơn cha mẹ một bậc đầy kính trọng',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Bác'
          },
          {
            id: 'p-elem-8',
            type: 'word',
            title: 'Ký hiệu "Chú" & "Cô"',
            desc: 'Ký hiệu xưng hô nam giới và nữ giới bậc em của cha mẹ',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Chú'
          },
          {
            id: 'p-elem-gram-2',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Phân nhánh Không gian Nội vs Ngoại',
            desc: 'Trường ký hiệu VSL định vị nhánh nội ở phía trước/trái và nhánh ngoại ở phía phải, giúp người đối diện nhận diện ngay lập tức.',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-spatial-grammar',
            completed: false
          },
          {
            id: 'p-elem-sent-2',
            type: 'sentence',
            sentenceSlug: 'ba-ngoai-yeu-thuong-chau',
            title: 'Câu thực hành: "Bà ngoại yêu thương cháu"',
            desc: 'Định vị bà ngoại bên phải + Hành động yêu thương hướng về cháu',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      },
      {
        id: 'stage-3',
        topicId: 'actions',
        title: 'Chặng 3: Hành Động Tương Tác & Phủ Định VSL',
        subtitle: 'Diễn đạt hành động chuyển động và khước từ dứt khoát bằng cử chỉ lắc đầu',
        icon: '⚡',
        progress: 0,
        color: '#7c3aed',
        bgColor: '#f5f3ff',
        lessons: [
          {
            id: 'p-elem-9',
            type: 'word',
            title: 'Ký hiệu "Dừng lại"',
            desc: 'Bàn tay dựng đứng dứt khoát trước ngực ra hiệu dừng lại',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Dừng lại'
          },
          {
            id: 'p-elem-10',
            type: 'word',
            title: 'Ký hiệu "Không cho"',
            desc: 'Bàn tay mở hất nhẹ từ chối dứt khoát',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Không cho'
          },
          {
            id: 'p-elem-11',
            type: 'word',
            title: 'Ký hiệu "Không cần"',
            desc: 'Hai tay gạt nhẹ sang hai bên thể hiện không có nhu cầu',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Không cần'
          },
          {
            id: 'p-elem-12',
            type: 'word',
            title: 'Ký hiệu "Không nên"',
            desc: 'Ngón trỏ lắc nhẹ sang hai bên nhắc nhở không nên làm',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Không nên'
          },
          {
            id: 'p-elem-gram-3',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Cấu trúc Câu phủ định trong VSL',
            desc: 'Từ phủ định (Không, Chưa, Không cần) đứng sau động từ hoặc ở cuối câu kết hợp động tác lắc đầu dứt khoát.',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-negation',
            completed: false
          },
          {
            id: 'p-elem-sent-3',
            type: 'sentence',
            sentenceSlug: 'em-dung-lai-khong-chay',
            title: 'Câu thực hành: "Em dừng lại không chạy nữa"',
            desc: 'Cấu trúc phủ định kép: Em + Dừng lại + Chạy + Không',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      },
      {
        id: 'stage-4',
        topicId: 'time',
        title: 'Chặng 4: Thời Gian, Lịch Trình & Kế Hoạch',
        subtitle: 'Định vị mốc thời gian lên đầu câu để xác lập ngữ cảnh cho hành động',
        icon: '⏰',
        progress: 0,
        color: '#ca8a04',
        bgColor: '#fefce8',
        lessons: [
          {
            id: 'p-elem-13',
            type: 'word',
            title: 'Ký hiệu "Buổi sáng"',
            desc: 'Bàn tay mở hướng lên mô phỏng mặt trời mọc buổi sớm mai',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Buổi sáng'
          },
          {
            id: 'p-elem-14',
            type: 'word',
            title: 'Ký hiệu "Buổi tối"',
            desc: 'Hai bàn tay đan chéo hạ xuống mô phỏng màn đêm buông',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Buổi tối'
          },
          {
            id: 'p-elem-15',
            type: 'word',
            title: 'Ký hiệu "Bây giờ"',
            desc: 'Hai bàn tay uốn cong ngửa nhẹ hạ xuống dứt khoát trước ngực',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Bây giờ'
          },
          {
            id: 'p-elem-16',
            type: 'word',
            title: 'Ký hiệu "Chủ nhật"',
            desc: 'Ký hiệu ngày nghỉ cuối tuần vui vẻ chuẩn VSL',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Chủ nhật'
          },
          {
            id: 'p-elem-gram-4',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Vị trí của Từ chỉ Thời gian trong câu',
            desc: 'VSL không chia động từ; luôn đặt từ chỉ thời gian ở đầu câu để xác lập khung thời gian tham chiếu cho toàn câu.',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-tense-time',
            completed: false
          },
          {
            id: 'p-elem-sent-4',
            type: 'sentence',
            sentenceSlug: 'buoi-sang-em-thuc-day',
            title: 'Câu thực hành: "Buổi sáng em thức dậy"',
            desc: 'Thời gian (Buổi sáng) + Chủ (Em) + Hành động (Thức dậy)',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      }
    ];
  }

  // MỨC 3: Trung cấp (Intermediate)
  else {
    stages = [
      {
        id: 'stage-1',
        topicId: 'education',
        title: 'Chặng 1: Học Đường, Tri Thức & Nghề Nghiệp',
        subtitle: 'Giao tiếp thành thạo trong môi trường làm việc, nhà trường và học tập',
        icon: '🎓',
        progress: 0,
        color: '#4f46e5',
        bgColor: '#eef2ff',
        lessons: [
          {
            id: 'p-int-1',
            type: 'word',
            title: 'Ký hiệu "Học"',
            desc: 'Mở tay như trang sách, tay kia nhặt kiến thức đưa lên trán',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Học'
          },
          {
            id: 'p-int-2',
            type: 'word',
            title: 'Ký hiệu "Trường học"',
            desc: 'Ghép ký hiệu "Nhà" và ký hiệu "Học" biểu thị trường học',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Trường học'
          },
          {
            id: 'p-int-3',
            type: 'word',
            title: 'Ký hiệu "Báo cáo"',
            desc: 'Hai tay cầm xấp tài liệu báo cáo đưa ra trang trọng',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Báo cáo'
          },
          {
            id: 'p-int-4',
            type: 'word',
            title: 'Ký hiệu "Bút bi"',
            desc: 'Ngón tay bấm ngòi bút bi và thao tác viết lượn sóng',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Bút bi'
          },
          {
            id: 'p-int-gram-1',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Cấu trúc cụm từ Danh từ + Số từ',
            desc: 'Trong VSL luôn làm ký hiệu Danh từ trước rồi mới xòe ngón tay chỉ số lượng (Sinh viên + 4, Sách + 2).',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-noun-numeral',
            completed: false
          },
          {
            id: 'p-int-sent-1',
            type: 'sentence',
            sentenceSlug: 'hoc-sinh-doc-sach',
            title: 'Câu thực hành: "Học sinh đọc sách"',
            desc: 'Cấu trúc SOV: Học sinh (Chủ) + Sách (Vật) + Đọc (Động từ)',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      },
      {
        id: 'stage-2',
        topicId: 'health',
        title: 'Chặng 2: Y Tế, Sức Khỏe & Câu Hỏi Nghi Vấn',
        subtitle: 'Hỏi thăm tình trạng sức khỏe, giao tiếp y tế và đặt câu hỏi mở',
        icon: '🩺',
        progress: 0,
        color: '#dc2626',
        bgColor: '#fee2e2',
        lessons: [
          {
            id: 'p-int-5',
            type: 'word',
            title: 'Ký hiệu "Bác sĩ"',
            desc: 'Ngón tay gõ nhẹ lên cổ tay bắt mạch y tế',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bác sĩ'
          },
          {
            id: 'p-int-6',
            type: 'word',
            title: 'Ký hiệu "Bệnh viện"',
            desc: 'Ký hiệu chữ thập đỏ trên cánh tay kết hợp mái nhà',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bệnh viện'
          },
          {
            id: 'p-int-7',
            type: 'word',
            title: 'Ký hiệu "Y tá"',
            desc: 'Ký hiệu mũ y tá viền trắng kết hợp chăm sóc tận tình',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Y tá'
          },
          {
            id: 'p-int-8',
            type: 'word',
            title: 'Ký hiệu "Khám bệnh" & "Đau"',
            desc: 'Đặt tay lên vùng bị đau kết hợp nét mặt nhăn nhó biểu cảm',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Khám bệnh'
          },
          {
            id: 'p-int-gram-2',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Quy tắc Câu hỏi trong VSL',
            desc: 'Trong câu hỏi lấy thông tin, từ nghi vấn (Đâu, Bao nhiêu, Thế nào) đặt ở cuối câu kết hợp nét mặt nghi vấn.',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-questions',
            completed: false
          },
          {
            id: 'p-int-sent-2',
            type: 'sentence',
            sentenceSlug: 'bac-si-kham-benh-em',
            title: 'Câu thực hành: "Bác sĩ khám bệnh cho em"',
            desc: 'Bác sĩ (Chủ) + Em (Đối tượng) + Khám bệnh (Hành động)',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      },
      {
        id: 'stage-3',
        topicId: 'travel',
        title: 'Chặng 3: Địa Điểm, Giao Thông & Di Chuyển 3D',
        subtitle: 'Chỉ đường, sử dụng phương tiện giao thông và mô tả chuyển động thị giác',
        icon: '🚗',
        progress: 0,
        color: '#0284c7',
        bgColor: '#e0f2fe',
        lessons: [
          {
            id: 'p-int-9',
            type: 'word',
            title: 'Ký hiệu "Chợ"',
            desc: 'Hai tay gánh đôi giỏ hàng đi mua bán sầm uất',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Chợ'
          },
          {
            id: 'p-int-10',
            type: 'word',
            title: 'Ký hiệu "Công viên"',
            desc: 'Ký hiệu cây xanh thoáng mát kết hợp khu dạo bộ thư thái',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Công viên'
          },
          {
            id: 'p-int-11',
            type: 'word',
            title: 'Ký hiệu "Máy bay"',
            desc: 'Ngón cái, ngón trỏ và ngón út xòe cánh máy bay lượn trên cao',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Máy bay'
          },
          {
            id: 'p-int-12',
            type: 'word',
            title: 'Ký hiệu "Bóng đá"',
            desc: 'Tay trái khum tròn quả bóng, tay phải hai ngón chân đá dứt khoát',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bóng đá'
          },
          {
            id: 'p-int-gram-3',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Không gian 3D & Định hướng chuyển động',
            desc: 'Mô phỏng chân thực hướng di chuyển từ điểm bắt đầu đến điểm đến trong không gian hình học trước ngực.',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-spatial-grammar',
            completed: false
          },
          {
            id: 'p-int-sent-3',
            type: 'sentence',
            sentenceSlug: 'em-di-nha-sach',
            title: 'Câu thực hành: "Em đi đến nhà sách"',
            desc: 'Em + Nhà sách (Địa điểm) + Đi (Chuyển động)',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      },
      {
        id: 'stage-4',
        topicId: 'emotions',
        title: 'Chặng 4: Cảm Xúc, Tính Chất & Hội Thoại Tự Nhiên',
        subtitle: 'Biểu đạt cảm xúc sâu sắc và phản xạ giao tiếp trôi chảy như người điếc bản ngữ',
        icon: '💖',
        progress: 0,
        color: '#db2777',
        bgColor: '#fdf2f8',
        lessons: [
          {
            id: 'p-int-13',
            type: 'word',
            title: 'Ký hiệu "Yêu thương"',
            desc: 'Hai tay bắt chéo ôm trước ngực thể hiện tình cảm dạt dào',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Yêu thương'
          },
          {
            id: 'p-int-14',
            type: 'word',
            title: 'Ký hiệu "Chăm chỉ"',
            desc: 'Hai tay nắm xoay đều trước ngực thể hiện sự cần mẫn siêng năng',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Chăm chỉ'
          },
          {
            id: 'p-int-15',
            type: 'word',
            title: 'Ký hiệu "Bơi lội"',
            desc: 'Hai cánh tay quạt so le về phía trước như động tác bơi sải',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bơi lội'
          },
          {
            id: 'p-int-16',
            type: 'word',
            title: 'Ký hiệu "Bóng bàn"',
            desc: 'Tay cầm vợt bóng bàn vung cắt bóng khéo léo',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bóng bàn'
          },
          {
            id: 'p-int-gram-4',
            type: 'grammar',
            title: '💡 Điểm hội tụ Ngữ pháp: Ngữ điệu cơ thể toàn diện',
            desc: 'Nét mặt biểu đạt sắc thái và cường độ của tính từ: mở to mắt khi ngạc nhiên, mỉm cười khi hạnh phúc.',
            duration: '3 phút',
            level: 'Lý thuyết',
            badge: 'Ngữ pháp VSL',
            grammarRuleId: 'rule-facial-expression',
            completed: false
          },
          {
            id: 'p-int-sent-4',
            type: 'sentence',
            sentenceSlug: 'banh-xeo-rat-ngon-mieng',
            title: 'Câu thực hành: "Bánh xèo rất ngon miệng"',
            desc: 'Chủ đề (Bánh xèo) + Lời dẫn (Rất ngon miệng)',
            duration: '4 phút',
            level: 'Thực hành',
            badge: 'Luyện câu VSL',
            completed: false
          }
        ]
      }
    ];
  }

  // Nếu người học có chủ đề ưu tiên (priorityTopic) -> Ưu tiên đưa chặng đó lên đầu
  if (priority && priority !== 'greeting') {
    const pIdx = stages.findIndex(s => s.topicId === priority);
    if (pIdx > 0) {
      const targetStage = stages.splice(pIdx, 1)[0];
      stages.unshift(targetStage);
    }
  }

  // Tự động chuẩn hóa toàn bộ các bài từ vựng trong lộ trình cá nhân khớp 100% video và slug VSL400
  stages = stages.map(stg => ({
    ...stg,
    lessons: stg.lessons.map(ls => {
      if (ls.word || ls.type === 'word' || (!ls.type && !ls.grammarRuleId && !ls.sentenceSlug)) {
        const targetWord = ls.word || ls.title;
        const meta = getWordMetadata(targetWord);
        if (meta) {
          return {
            ...ls,
            word: meta.word,
            slug: meta.slug,
            wordId: meta.wordId,
            videoUrl: meta.videoUrl,
            videoSideUrl: meta.videoSideUrl,
            level: ls.level || meta.difficulty || 'Dễ'
          };
        }
      }
      return ls;
    })
  }));

  return stages;
}

// 5. Tính toán và lưu Lộ trình Cá nhân
export function getPersonalizedPath() {
  try {
    const profile = getUserProfile();
    const capability = analyzeLearnerCapability();
    const raw = localStorage.getItem(PERSONALIZED_PATH_KEY);
    
    if (raw) {
      const parsed = JSON.parse(raw);
      // Nâng cấp cache cũ: kiểm tra version === 5 để đồng bộ video/slug chuẩn VSL400
      if (parsed && parsed.version === 5 && Array.isArray(parsed.stages) && parsed.stages.length > 0) {
        return parsed.stages;
      }
    }

    const generated = generatePersonalizedPath(profile.learningLevel || 'beginner', capability);
    localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify({ version: 5, stages: generated }));
    return generated;
  } catch (e) {
    return generatePersonalizedPath('beginner');
  }
}

// 6. Tái Cấu Trúc Lộ Trình Theo AI (Recalculate)
export function recalculateAdaptivePath() {
  const profile = getUserProfile();
  const capability = analyzeLearnerCapability();
  const newPath = generatePersonalizedPath(profile.learningLevel || 'beginner', capability);
  localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify({ version: 5, stages: newPath }));
  window.dispatchEvent(new CustomEvent(PERSONALIZED_EVENT, { detail: { path: newPath, capability } }));
  return newPath;
}

// 7. Hook Sử Dụng Trong React
export function usePersonalizedPath() {
  const [profile, setProfile] = useState(getUserProfile());
  const [capability, setCapability] = useState(analyzeLearnerCapability());
  const [path, setPath] = useState(getPersonalizedPath());

  useEffect(() => {
    // Đồng bộ tiến độ thực tế từ Backend NestJS khi tải
    const syncBackendProgress = async () => {
      const token = getStoredToken();
      if (!token) return;

      try {
        const [userProgress, recommendations] = await Promise.all([
          progressApi.getUserProgress().catch(() => []),
          adaptiveApi.getRecommendations().catch(() => null),
        ]);

        if (Array.isArray(userProgress) && userProgress.length > 0) {
          const completedSet = new Set(
            userProgress
              .filter(p => p.completed)
              .flatMap(p => [
                String(p.lessonId).toLowerCase(),
                p.lesson?.slug ? String(p.lesson.slug).toLowerCase() : null,
                p.lesson?.title ? String(p.lesson.title).toLowerCase().trim() : null,
              ])
              .filter(Boolean)
          );

          const currentPath = getPersonalizedPath();
          const synced = currentPath.map(stage => {
            const updatedLessons = stage.lessons.map(l => {
              const lid = String(l.id || '').toLowerCase();
              const lslug = String(l.slug || '').toLowerCase();
              const lword = String(l.word || l.title || '').toLowerCase().trim();
              if (completedSet.has(lid) || completedSet.has(lslug) || completedSet.has(lword)) {
                return { ...l, completed: true, score: l.score || 90 };
              }
              return l;
            });
            const compCount = updatedLessons.filter(l => l.completed).length;
            const progress = Math.round((compCount / updatedLessons.length) * 100);
            return { ...stage, lessons: updatedLessons, progress };
          });

          localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify({ version: 5, stages: synced }));
          setPath(synced);
        }

        if (recommendations && recommendations.learningLevel) {
          setCapability(prev => ({
            ...prev,
            paceLevel: recommendations.paceLevel || prev.paceLevel,
            recommendation: recommendations.recommendation || prev.recommendation,
          }));
        }
      } catch (e) {
        console.warn('Lỗi đồng bộ tiến độ cá nhân từ backend:', e);
      }
    };

    syncBackendProgress();

    const handleUpdate = () => {
      setProfile(getUserProfile());
      setCapability(analyzeLearnerCapability());
      setPath(getPersonalizedPath());
    };

    window.addEventListener(PERSONALIZED_EVENT, handleUpdate);
    return () => window.removeEventListener(PERSONALIZED_EVENT, handleUpdate);
  }, []);

  const updateLevel = (newLevel) => {
    const updatedProf = saveUserProfile({ learningLevel: newLevel });
    const newCapability = analyzeLearnerCapability();
    const newPath = generatePersonalizedPath(newLevel, newCapability);
    localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify({ version: 5, stages: newPath }));
    setProfile(updatedProf);
    setCapability(newCapability);
    setPath(newPath);
    window.dispatchEvent(new CustomEvent(PERSONALIZED_EVENT, { detail: { profile: updatedProf, path: newPath } }));
  };

  const completeLessonInPath = (lessonId, score = 90) => {
    const updatedPath = path.map(stage => {
      const updatedLessons = stage.lessons.map(l => {
        if (l.id === lessonId) {
          return { ...l, completed: true, score };
        }
        return l;
      });
      const completedCount = updatedLessons.filter(l => l.completed).length;
      const progress = Math.round((completedCount / updatedLessons.length) * 100);
      return { ...stage, lessons: updatedLessons, progress };
    });

    localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify({ version: 5, stages: updatedPath }));
    setPath(updatedPath);

    // Đồng bộ lưu hoàn thành bài học lên Backend NestJS
    progressApi.completeLesson(lessonId, score).catch(() => {});

    // Cộng XP cục bộ cho người dùng
    const current = getUserProfile();
    const updatedUser = saveUserProfile({
      ...current,
      totalXp: (current.totalXp || 0) + 150
    });
    setProfile(updatedUser);

    window.dispatchEvent(new CustomEvent(PERSONALIZED_EVENT, { detail: { path: updatedPath, profile: updatedUser } }));
  };

  return {
    profile,
    capability,
    path,
    updateLevel,
    recalculate: recalculateAdaptivePath,
    completeLesson: completeLessonInPath
  };
}

