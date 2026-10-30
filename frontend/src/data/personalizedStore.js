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

  // Mức 1: Người mới bắt đầu (Beginner)
  if (currentLevel === 'beginner') {
    const stage1Lessons = [
      {
        id: 'p-beg-1',
        title: 'Khởi động ngón tay & Định vị bàn tay',
        desc: 'Làm quen góc máy camera, tư thế lưng thẳng và độ linh hoạt 5 đầu ngón tay',
        duration: '2 phút',
        level: 'Dễ',
        badge: 'Khởi động',
        completed: true,
        score: 95,
        word: 'Chào'
      },
      {
        id: 'p-beg-2',
        title: 'Bảng chữ cái VSL: Chữ cái A & B',
        desc: 'Nắm bàn tay chữ A và mở phẳng khép ngón chữ B chuẩn xác góc 90 độ',
        duration: '3 phút',
        level: 'Dễ',
        badge: 'Khuyên học hôm nay',
        highlight: true,
        completed: true,
        score: 91,
        word: 'Chữ cái A'
      },
      {
        id: 'p-beg-3',
        title: 'Bảng chữ cái VSL: Chữ cái C & D',
        desc: 'Uốn vòm chữ C tự nhiên và vươn thẳng ngón trỏ chữ D',
        duration: '3 phút',
        level: 'Dễ',
        completed: false,
        score: 0,
        word: 'Chữ cái A'
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
        title: 'Chặng 1: Nền Tảng Khớp Tay & Chữ Cái Vỡ Lòng',
        subtitle: 'Dành riêng cho người mới bắt đầu tiếp cận Ngôn ngữ Ký hiệu Việt Nam',
        icon: '🔤',
        progress: cap.hasBooster ? 50 : 66,
        color: '#0284c7',
        bgColor: '#f0f9ff',
        lessons: stage1Lessons
      },
      {
        id: 'stage-2',
        title: 'Chặng 2: Số Đếm & Ký Hiệu Đời Sống Cơ Bản',
        subtitle: 'Xòe ngón tay theo quy chuẩn số đếm và các lời chào giao tiếp đầu tiên',
        icon: '🔢',
        progress: 25,
        color: '#059669',
        bgColor: '#ecfdf5',
        lessons: [
          {
            id: 'p-beg-4',
            title: 'Số đếm từ 1 đến 5',
            desc: 'Thực hành các thế ngón tay từ 1 đến 5 chuẩn VSL',
            duration: '3 phút',
            level: 'Dễ',
            completed: true,
            score: 95,
            word: 'Số 5'
          },
          {
            id: 'p-beg-5',
            title: 'Ký hiệu "Chào" thân thiện',
            desc: 'Chạm nhẹ thái dương đưa dứt khoát ra ngoài kèm ánh mắt vui tươi',
            duration: '3 phút',
            level: 'Dễ',
            badge: 'Luyện tập AI',
            completed: false,
            score: 0,
            word: 'Chào'
          },
          {
            id: 'p-beg-6',
            title: 'Ký hiệu "Cảm ơn" tri ân',
            desc: 'Đặt đầu ngón tay lên cằm rồi hạ nhẹ bàn tay về phía trước đối tác',
            duration: '3 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Cảm ơn'
          }
        ]
      },
      {
        id: 'stage-3',
        title: 'Chặng 3: Phản Xạ Giao Tiếp Nhập Môn',
        subtitle: 'Tự tin chào hỏi và hỏi thăm người khiếm thính trong đời sống thường nhật',
        icon: '👋',
        progress: 0,
        color: '#d97706',
        bgColor: '#fffbeb',
        lessons: [
          {
            id: 'p-beg-7',
            title: 'Ký hiệu "Tạm biệt" & "Hẹn gặp lại"',
            desc: 'Vẫy nhẹ bàn tay ngang vai kết hợp cử chỉ chào tạm biệt ấm áp',
            duration: '3 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Tạm biệt'
          },
          {
            id: 'p-beg-8',
            title: 'Thử thách AI: Chào hỏi tổng hợp 60s',
            desc: 'Vượt qua chuỗi phản xạ 3 cử chỉ chào hỏi liên tiếp với camera AI',
            duration: '4 phút',
            level: 'Trung bình',
            badge: cap.fastTrackUnlocked ? '⚡ Mở khóa sớm' : 'Khóa',
            completed: false,
            score: 0,
            word: 'Chào'
          }
        ]
      }
    ];

    return stages;
  }

  // Mức 2: Đã biết cơ bản (Elementary)
  if (currentLevel === 'elementary') {
    const stages = [
      {
        id: 'stage-1',
        title: 'Chặng 1: Giao Tiếp Lịch Sự & Lời Cảm Ơn, Xin Lỗi',
        subtitle: 'Bỏ qua chữ cái cơ bản, đi thẳng vào các cử chỉ hội thoại thiết yếu',
        icon: '💬',
        progress: 60,
        color: '#0284c7',
        bgColor: '#f0f9ff',
        lessons: [
          {
            id: 'p-elem-1',
            title: 'Ký hiệu "Xin lỗi" chân thành',
            desc: 'Nắm bàn tay xoay tròn nhẹ nhàng trên ngực trái (vùng trái tim)',
            duration: '3 phút',
            level: 'Trung bình',
            badge: 'Khuyên học hôm nay',
            highlight: true,
            completed: true,
            score: 90,
            word: 'Xin lỗi'
          },
          {
            id: 'p-elem-2',
            title: 'Ký hiệu "Cảm ơn" & Cúi đầu lịch thiệp',
            desc: 'Kết hợp tay chạm cằm đưa xuôi và ánh mắt chân thành',
            duration: '3 phút',
            level: 'Dễ',
            completed: true,
            score: 88,
            word: 'Cảm ơn'
          },
          {
            id: 'p-elem-3',
            title: 'Hỏi thăm: "Bạn có khỏe không?"',
            desc: 'Biểu đạt sắc thái nét mặt kết hợp cử chỉ hỏi thăm thân mật',
            duration: '4 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Chào'
          }
        ]
      },
      {
        id: 'stage-2',
        title: 'Chặng 2: Mối Quan Hệ Gia Đình & Xưng Hô',
        subtitle: 'Học cách xưng hô Bố, Mẹ, Ông, Bà và biểu cảm gắn kết gia đình',
        icon: '👨‍👩‍👧',
        progress: 30,
        color: '#e11d48',
        bgColor: '#fff1f2',
        lessons: [
          {
            id: 'p-elem-4',
            title: 'Ký hiệu "Bố / Cha"',
            desc: 'Vuốt nhẹ hai bên nhân trung tạo hình ria mép truyền thống',
            duration: '3 phút',
            level: 'Dễ',
            completed: true,
            score: 93,
            word: 'Bố / Cha'
          },
          {
            id: 'p-elem-5',
            title: 'Ký hiệu "Mẹ"',
            desc: 'Chạm nhẹ ngón trỏ vào cạnh cằm hoặc dái tai biểu trưng khuyên tai',
            duration: '3 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Mẹ'
          },
          {
            id: 'p-elem-6',
            title: 'Ký hiệu "Gia đình" hạnh phúc',
            desc: 'Hai tay tạo hình chữ F xoay vòng tròn khép kín bao bọc',
            duration: '4 phút',
            level: 'Khá',
            completed: false,
            score: 0,
            word: 'Gia đình'
          }
        ]
      },
      {
        id: 'stage-3',
        title: 'Chặng 3: Ẩm Thực & Sinh Hoạt Đời Thường',
        subtitle: 'Ký hiệu món ăn truyền thống, ăn uống và thói quen sinh hoạt',
        icon: '🍲',
        progress: 0,
        color: '#ca8a04',
        bgColor: '#fefce8',
        lessons: [
          {
            id: 'p-elem-7',
            title: 'Ký hiệu món "Phở"',
            desc: 'Tay trái khum hình bát phở, tay phải hai ngón gắp đưa lên miệng',
            duration: '3 phút',
            level: 'Trung bình',
            completed: false,
            score: 0,
            word: 'Phở'
          },
          {
            id: 'p-elem-8',
            title: 'Ký hiệu "Uống nước"',
            desc: 'Tay cong chữ C như cầm cốc nâng lên miệng tự nhiên',
            duration: '2 phút',
            level: 'Dễ',
            completed: false,
            score: 0,
            word: 'Uống nước'
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
        word: 'Xin lỗi'
      });
    }

    return stages;
  }

  // Mức 3: Đã có nền tảng / Nâng cao (Intermediate)
  const stages = [
    {
      id: 'stage-1',
      title: 'Chặng 1: Giao Tiếp Tốc Độ Cao & Tình Huống Đời Thực',
      subtitle: 'Nâng cao tốc độ phản xạ và sự uyển chuyển của cơ bàn tay',
      icon: '⚡',
      progress: 40,
      color: '#7c3aed',
      bgColor: '#faf5ff',
      lessons: [
        {
          id: 'p-adv-1',
          title: 'Hỏi giúp đỡ: "Bạn có cần giúp không?"',
          desc: 'Bàn tay mở ngửa đặt trên mu bàn tay trái đưa về phía đối phương dứt khoát',
          duration: '4 phút',
          level: 'Trung bình',
          badge: 'Khuyên học hôm nay',
          highlight: true,
          completed: true,
          score: 92,
          word: 'Bạn có cần giúp không?'
        },
        {
          id: 'p-adv-2',
          title: 'Hỏi giờ & Khái niệm thời gian',
          desc: 'Gõ ngón trỏ lên mặt đồng hồ cổ tay trái kết hợp khẩu hình tự nhiên',
          duration: '3 phút',
          level: 'Trung bình',
          completed: false,
          score: 0,
          word: 'Mấy giờ rồi?'
        },
        {
          id: 'p-adv-3',
          title: '⚡ Thử thách phản xạ tốc độ cao AI (5s)',
          desc: 'Phản xạ tức thì 5 câu hỏi liên tiếp với độ chính xác cao',
          duration: '5 phút',
          level: 'Khó',
          badge: 'Thử thách AI',
          completed: false,
          score: 0,
          word: 'Chào'
        }
      ]
    },
    {
      id: 'stage-2',
      title: 'Chặng 2: Sắc Thái Nét Mặt & Ngữ Pháp Không Gian',
      subtitle: 'Khai thác tối đa cử động nhíu mày, nụ cười và không gian 3 chiều',
      icon: '🎭',
      progress: 10,
      color: '#0891b2',
      bgColor: '#ecfeff',
      lessons: [
        {
          id: 'p-adv-4',
          title: 'Biểu cảm câu hỏi Yes / No',
          desc: 'Nhướng mày, hơi rướn đầu về phía trước khi đưa ra câu hỏi xác nhận',
          duration: '4 phút',
          level: 'Khá',
          completed: false,
          score: 0,
          word: 'Chào'
        },
        {
          id: 'p-adv-5',
          title: 'Biểu cảm câu hỏi Wh- (Tại sao, Khi nào)',
          desc: 'Hơi nheo mắt hoặc nhíu mày kết hợp cử chỉ tay nghi vấn',
          duration: '4 phút',
          level: 'Khó',
          completed: false,
          score: 0,
          word: 'Bạn có cần giúp không?'
        }
      ]
    },
    {
      id: 'stage-3',
      title: 'Chặng 3: Thử Thách Chuyên Gia VSL 95%+',
      subtitle: 'Chinh phục độ chuẩn xác tuyệt đối các khớp xương theo mô hình AI Holistic',
      icon: '🏆',
      progress: 0,
      color: '#e11d48',
      bgColor: '#fff1f2',
      lessons: [
        {
          id: 'p-adv-6',
          title: 'Đối thoại liên hoàn 3 ngữ cảnh',
          desc: 'Ghép nối chuỗi câu Chào hỏi -> Giúp đỡ -> Lời cảm ơn liền mạch',
          duration: '6 phút',
          level: 'Chuyên gia',
          completed: false,
          score: 0,
          word: 'Chào'
        }
      ]
    }
  ];

  return stages;
}

// 5. Tính toán và lưu Lộ trình Cá nhân
export function getPersonalizedPath() {
  try {
    const profile = getUserProfile();
    const capability = analyzeLearnerCapability();
    const raw = localStorage.getItem(PERSONALIZED_PATH_KEY);
    
    if (!raw) {
      const generated = generatePersonalizedPath(profile.learningLevel || 'beginner', capability);
      localStorage.setItem(PERSONALIZED_PATH_KEY, JSON.stringify(generated));
      return generated;
    }
    return JSON.parse(raw);
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
