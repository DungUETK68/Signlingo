// Store và thuật toán cá nhân hóa lộ trình học theo khả năng (Adaptive Learning Engine)
import { useState, useEffect } from 'react';
import { USER_PROFILE } from './mockData';

export const USER_PROFILE_KEY = 'signlingo_user_profile';
export const PREFERENCES_KEY = 'signlingo_learning_preferences';
export const PRACTICE_HISTORY_KEY = 'signlingo_practice_history';
export const PERSONALIZED_PATH_KEY = 'signlingo_personalized_path';
export const PERSONALIZED_EVENT = 'signlingo_personalized_updated';

// 1. Quản lý Hồ Sơ Người Dùng (Local Storage)
export function getUserProfile() {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) {
      // Mặc định tạo tài khoản mẫu ban đầu
      const initial = {
        ...USER_PROFILE,
        isLoggedIn: true,
        hasCompletedOnboarding: true,
        learningLevel: 'beginner', // 'beginner' | 'elementary' | 'intermediate'
        learningGoalMinutes: 15,
        priorityTopic: 'greeting'
      };
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
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
        { word: 'Chào', score: 94, passed: true, date: '2026-10-28', badJoints: [] },
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

  // MỨC 1: Người mới bắt đầu (Beginner)
  if (currentLevel === 'beginner') {
    const stage1Lessons = [
      {
        id: 'p-beg-1',
        title: 'Ký hiệu "Chào" chuẩn VSL',
        desc: 'Bàn tay mở chạm nhẹ thái dương đưa dứt khoát ra ngoài kèm nụ cười thân thiện',
        duration: '2 phút',
        level: 'Dễ',
        badge: 'Căn bản',
        completed: true,
        score: 95,
        word: 'Chào'
      },
      {
        id: 'p-beg-2',
        title: 'Ký hiệu "Cảm ơn" tri ân',
        desc: 'Đặt đầu ngón tay lên cằm rồi hạ nhẹ bàn tay về phía trước đối tác giao tiếp',
        duration: '2 phút',
        level: 'Dễ',
        badge: 'Khuyên học hôm nay',
        highlight: true,
        completed: true,
        score: 92,
        word: 'Cảm ơn'
      },
      {
        id: 'p-beg-3',
        title: 'Ký hiệu "Xin lỗi" chân thành',
        desc: 'Nắm bàn tay xoay tròn nhẹ nhàng trên ngực trái (vùng trái tim)',
        duration: '3 phút',
        level: 'Trung bình',
        completed: false,
        score: 0,
        word: 'Xin lỗi'
      }
    ];

    // Nếu AI phát hiện cần bổ trợ ngón tay -> Chèn bài thích ứng
    if (cap.hasBooster) {
      stage1Lessons.splice(2, 0, {
        id: 'p-booster-1',
        title: '🤖 Bài bổ trợ AI: Tinh chỉnh góc mở ngón tay',
        desc: 'AI tự động bổ sung dựa trên kết quả thực hành để sửa góc khép mở ngón tay',
        duration: '2 phút',
        level: 'Dễ',
        isAiBooster: true,
        badge: 'Bài thích ứng AI',
        completed: false,
        score: 0,
        word: 'Chào'
      });
    }

    const stages = [
      {
        id: 'stage-1',
        title: 'Chặng 1: Nền Tảng Chào Hỏi & Lịch Sự',
        subtitle: 'Bắt đầu với các ký hiệu chào hỏi, cảm ơn, xin lỗi cốt lõi nhất của người khiếm thính',
        icon: '👋',
        progress: cap.hasBooster ? 50 : 66,
        color: '#0284c7',
        bgColor: '#f0f9ff',
        lessons: stage1Lessons
      },
      {
        id: 'stage-2',
        title: 'Chặng 2: Xưng Hô Gia Đình Gần Gũi',
        subtitle: 'Học cách xưng hô Bố, Mẹ, Anh, Chị, Em theo quy chuẩn VSL',
        icon: '👨‍👩‍👧',
        progress: 25,
        color: '#059669',
        bgColor: '#ecfdf5',
        lessons: [
          {
            id: 'p-beg-4',
            title: 'Ký hiệu "Bố"',
            desc: 'Ký hiệu vuốt nhẹ hai bên ria mép truyền thống thể hiện người cha',
            duration: '2 phút',
            level: 'Dễ',
            completed: true,
            score: 94,
            word: 'Bố'
          },
          {
            id: 'p-beg-5',
            title: 'Ký hiệu "Mẹ"',
            desc: 'Ngón tay trỏ chạm nhẹ cạnh cằm hoặc dái tai biểu trưng cho khuyên tai người mẹ',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Mẹ'
          },
          {
            id: 'p-beg-6',
            title: 'Ký hiệu "Anh" & "Chị"',
            desc: 'Cử chỉ biểu thị bậc anh lớn và chị gái trong gia đình',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Anh'
          },
          {
            id: 'p-beg-7',
            title: 'Ký hiệu "Em"',
            desc: 'Bàn tay hạ thấp ngang ngực thể hiện người nhỏ tuổi hơn',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Em'
          }
        ]
      },
      {
        id: 'stage-3',
        title: 'Chặng 3: Sức Khỏe & Sinh Hoạt Cơ Bản',
        subtitle: 'Ký hiệu hỏi thăm thể trạng khỏe mạnh và các nhu cầu ăn uống hàng ngày',
        icon: '🥣',
        progress: 0,
        color: '#d97706',
        bgColor: '#fffbeb',
        lessons: [
          {
            id: 'p-beg-8',
            title: 'Ký hiệu "Khỏe"',
            desc: 'Hai bàn tay nắm gập vuông góc trước ngực thể hiện sức mạnh và sức khỏe tốt',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Khỏe'
          },
          {
            id: 'p-beg-9',
            title: 'Ký hiệu "Ăn"',
            desc: 'Các ngón tay chụm lại đưa vào sát miệng 2 lần',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Ăn'
          },
          {
            id: 'p-beg-10',
            title: 'Ký hiệu "Uống" & "Nước"',
            desc: 'Bàn tay cong chữ C như cầm cốc nâng lên miệng kết hợp chạm cằm',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Uống'
          }
        ]
      }
    ];

    return stages;
  }

  // MỨC 2: Đã biết cơ bản (Elementary)
  if (currentLevel === 'elementary') {
    const stages = [
      {
        id: 'stage-1',
        title: 'Chặng 1: Ẩm Thực & Món Ăn Truyền Thống VSL',
        subtitle: 'Ký hiệu các món ăn Việt Nam quen thuộc và thức uống hàng ngày',
        icon: '🍲',
        progress: 40,
        color: '#0284c7',
        bgColor: '#f0f9ff',
        lessons: [
          {
            id: 'p-elem-1',
            title: 'Ký hiệu món "Phở"',
            desc: 'Tay trái khum hình bát phở, tay phải hai ngón gắp đưa lên miệng',
            duration: '3 phút',
            level: 'Trung bình',
            badge: 'Khuyên học hôm nay',
            highlight: true,
            completed: true,
            score: 92,
            word: 'Phở'
          },
          {
            id: 'p-elem-2',
            title: 'Ký hiệu món "Bún"',
            desc: 'Ký hiệu sợi bún mềm cuộn tròn gắp ăn kèm nước dùng',
            duration: '3 phút',
            level: 'Trung bình',
            completed: true,
            score: 90,
            word: 'Bún'
          },
          {
            id: 'p-elem-3',
            title: 'Ký hiệu món "Bánh bao"',
            desc: 'Hai bàn tay chụm tròn lại tạo hình chiếc bánh bao xốp',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bánh bao'
          },
          {
            id: 'p-elem-4',
            title: 'Ký hiệu "Trà" & "Sữa"',
            desc: 'Ký hiệu nhấp tách trà thanh lịch và động tác vắt sữa nhịp nhàng',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Trà'
          },
          {
            id: 'p-elem-5',
            title: 'Ký hiệu "Thịt"',
            desc: 'Ngón cái và ngón trỏ véo nhẹ phần thịt mu bàn tay',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Thịt'
          }
        ]
      },
      {
        id: 'stage-2',
        title: 'Chặng 2: Họ Hàng & Đại Gia Đình',
        subtitle: 'Học cách xưng hô Bác, Chú, Cô, Ông nội, Bà nội kính mến',
        icon: '🏡',
        progress: 25,
        color: '#e11d48',
        bgColor: '#fff1f2',
        lessons: [
          {
            id: 'p-elem-6',
            title: 'Ký hiệu "Bác"',
            desc: 'Ký hiệu biểu thị người lớn tuổi hơn cha mẹ một bậc',
            duration: '2 phút',
            level: 'Dễ',
            completed: true,
            score: 95,
            word: 'Bác'
          },
          {
            id: 'p-elem-7',
            title: 'Ký hiệu "Chú" & "Cô"',
            desc: 'Ký hiệu nam giới và nữ giới bậc em của cha mẹ',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Chú'
          },
          {
            id: 'p-elem-8',
            title: 'Ký hiệu "Ông nội"',
            desc: 'Ký hiệu vuốt chòm râu dài dưới cằm kết hợp chỉ bên nội',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Ông nội'
          },
          {
            id: 'p-elem-9',
            title: 'Ký hiệu "Bà nội"',
            desc: 'Ký hiệu búi tóc móm mém của người bà kính yêu',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Bà nội'
          }
        ]
      },
      {
        id: 'stage-3',
        title: 'Chặng 3: Ghép Câu Giao Tiếp Ẩm Thực (Quy Tắc SOV)',
        subtitle: 'Luyện tập ghép câu hoàn chỉnh: Đưa món ăn lên trước hành động',
        icon: '💬',
        progress: 0,
        color: '#ca8a04',
        bgColor: '#fefce8',
        lessons: [
          {
            id: 'p-elem-10',
            title: 'Câu thực hành: "Em ăn bánh bao"',
            desc: 'Cấu trúc SOV: Em + Bánh bao + Ăn liên tiếp',
            duration: '5 phút',
            level: 'Trung bình',
            badge: 'Luyện câu VSL',
            completed: false,
            score: 0,
            word: 'Bánh bao'
          },
          {
            id: 'p-elem-11',
            title: 'Câu thực hành: "Anh ăn phở"',
            desc: 'Cấu trúc SOV: Anh + Phở + Ăn liên tiếp',
            duration: '5 phút',
            level: 'Trung bình',
            badge: 'Luyện câu VSL',
            completed: false,
            score: 0,
            word: 'Phở'
          }
        ]
      }
    ];

    if (cap.hasBooster) {
      stages[0].lessons.push({
        id: 'p-booster-elem',
        title: '🤖 Bài bổ trợ AI: Sửa độ cao bàn tay so với ngực',
        desc: 'AI điều chỉnh vị trí cổ tay để đạt chuẩn không gian ký hiệu VSL',
        duration: '2 phút',
        level: 'Trung bình',
        isAiBooster: true,
        badge: 'Bài thích ứng AI',
        completed: false,
        score: 0,
        word: 'Phở'
      });
    }

    return stages;
  }

  // MỨC 3: Đã có nền tảng / Nâng cao (Intermediate)
  const stages = [
    {
      id: 'stage-1',
      title: 'Chặng 1: Đời Sống Xã Hội & Học Tập',
      subtitle: 'Ký hiệu nhà trường, tri thức, hỗ trợ và mốc thời gian',
      icon: '🎓',
      progress: 50,
      color: '#7c3aed',
      bgColor: '#faf5ff',
      lessons: [
        {
          id: 'p-adv-1',
          title: 'Ký hiệu "Học" tri thức',
          desc: 'Mở tay như trang sách, tay kia nhặt kiến thức đưa lên trán',
          duration: '2 phút',
          level: 'Dễ',
          badge: 'Khuyên học hôm nay',
          highlight: true,
          completed: true,
          score: 93,
          word: 'Học'
        },
        {
          id: 'p-adv-2',
          title: 'Ký hiệu "Trường học"',
          desc: 'Ghép ký hiệu "Nhà" và ký hiệu "Học" biểu thị trường học',
          duration: '3 phút',
          level: 'Trung bình',
          completed: true,
          score: 91,
          word: 'Trường học'
        },
        {
          id: 'p-adv-3',
          title: 'Ký hiệu "Bây giờ"',
          desc: 'Hai bàn tay uốn cong ngửa nhẹ hạ xuống dứt khoát trước ngực',
          duration: '2 phút',
          level: 'Dễ',
          completed: false,
          score: 0,
          word: 'Bây giờ'
        },
        {
          id: 'p-adv-4',
          title: 'Ký hiệu "Giúp đỡ"',
          desc: 'Bàn tay mở đặt dưới mu bàn tay còn lại đưa về phía trước hỗ trợ',
          duration: '3 phút',
          level: 'Trung bình',
          completed: false,
          score: 0,
          word: 'Giúp đỡ'
        }
      ]
    },
    {
      id: 'stage-2',
      title: 'Chặng 2: Y Tế & Hoạt Động Thể Chất',
      subtitle: 'Ký hiệu ngành y, bệnh viện và các môn thể thao năng động',
      icon: '⚽',
      progress: 0,
      color: '#0891b2',
      bgColor: '#ecfeff',
      lessons: [
        {
          id: 'p-adv-5',
          title: 'Ký hiệu "Bác sĩ"',
          desc: 'Ngón tay gõ nhẹ lên cổ tay bắt mạch y tế',
          duration: '3 phút',
          level: 'Trung bình',
          completed: false,
          score: 0,
          word: 'Bác sĩ'
        },
        {
          id: 'p-adv-6',
          title: 'Ký hiệu "Bệnh viện"',
          desc: 'Ký hiệu chữ thập đỏ trên cánh tay kết hợp mái nhà',
          duration: '3 phút',
          level: 'Trung bình',
          completed: false,
          score: 0,
          word: 'Bệnh viện'
        },
        {
          id: 'p-adv-7',
          title: 'Ký hiệu "Bóng đá"',
          desc: 'Tay trái khum tròn quả bóng, tay phải hai ngón chân đá dứt khoát',
          duration: '3 phút',
          level: 'Trung bình',
          completed: false,
          score: 0,
          word: 'Bóng đá'
        },
        {
          id: 'p-adv-8',
          title: 'Ký hiệu "Bơi lội"',
          desc: 'Hai cánh tay quạt so le về phía trước như động tác bơi sải',
          duration: '3 phút',
          level: 'Trung bình',
          completed: false,
          score: 0,
          word: 'Bơi lội'
        }
      ]
    },
    {
      id: 'stage-3',
      title: 'Chặng 3: Phản Xạ Câu Giao Tiếp & Thử Thách AI',
      subtitle: 'Ghép chuỗi câu phức tạp và chinh phục tốc độ phản xạ cao',
      icon: '🏆',
      progress: 0,
      color: '#e11d48',
      bgColor: '#fff1f2',
      lessons: [
        {
          id: 'p-adv-9',
          title: 'Câu thực hành: "Bố mẹ giúp đỡ em"',
          desc: 'Chủ ngữ liên hợp + Bổ ngữ + Động từ định hướng',
          duration: '6 phút',
          level: 'Khá',
          badge: 'Luyện câu VSL',
          completed: false,
          score: 0,
          word: 'Giúp đỡ'
        },
        {
          id: 'p-adv-10',
          title: '⚡ Thử thách phản xạ tốc độ cao AI (5s)',
          desc: 'Thực hiện chuẩn xác ký hiệu trong vòng 5 giây trước ống kính AI',
          duration: '5 phút',
          level: 'Chuyên gia',
          badge: 'Thử thách 5s',
          completed: false,
          score: 0,
          word: 'Chào'
        }
      ]
    }
  ];

  if (cap.hasBooster) {
    stages[0].lessons.push({
      id: 'p-booster-adv',
      title: '🤖 Bài bổ trợ AI: Tinh chỉnh hướng chuyển động cổ tay',
      desc: 'AI hỗ trợ góc chuyển động không gian 3 chiều theo mẫu Holistic',
      duration: '2 phút',
      level: 'Trung bình',
      isAiBooster: true,
      badge: 'Bài thích ứng AI',
      completed: false,
      score: 0,
      word: 'Giúp đỡ'
    });
  }

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
      // Tự động kiểm tra và nâng cấp nếu cache cũ chứa các từ lỗi thời (như "Chữ cái A" hay "Số 5")
      const isLegacy = parsed.some(stage =>
        stage.lessons.some(l =>
          l.word === 'Chữ cái A' ||
          l.word === 'Số 5' ||
          l.word === 'Tạm biệt' ||
          l.word === 'Bố / Cha' ||
          l.word === 'Gia đình' ||
          l.word === 'Uống nước' ||
          l.word === 'Bạn có cần giúp không?' ||
          l.word === 'Mấy giờ rồi?'
        )
      );

      if (!isLegacy) {
        return parsed;
      }
    }

    const generated = generatePersonalizedPath(profile.learningLevel || 'beginner', capability);
    localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify(generated));
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
  localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify(newPath));
  window.dispatchEvent(new CustomEvent(PERSONALIZED_EVENT, { detail: { path: newPath, capability } }));
  return newPath;
}

// 7. Hook Sử Dụng Trong React
export function usePersonalizedPath() {
  const [profile, setProfile] = useState(getUserProfile());
  const [capability, setCapability] = useState(analyzeLearnerCapability());
  const [path, setPath] = useState(getPersonalizedPath());

  useEffect(() => {
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
    localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify(newPath));
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

    localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify(updatedPath));
    setPath(updatedPath);
    window.dispatchEvent(new CustomEvent(PERSONALIZED_EVENT, { detail: { path: updatedPath } }));
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

