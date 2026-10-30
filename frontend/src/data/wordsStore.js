import { useState, useEffect } from 'react';
import { DICTIONARY_WORDS, TOPICS } from './mockData';

const STORAGE_KEY = 'signlingo_custom_words';
const TOPICS_STORAGE_KEY = 'signlingo_custom_topics';
const EVENT_NAME = 'signlingo_data_updated';

// Lấy danh sách từ tùy chỉnh từ localStorage
export function getCustomWords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Lỗi đọc custom words từ localStorage:', e);
    return [];
  }
}

// Lấy danh sách chủ đề tùy chỉnh nếu có
export function getCustomTopics() {
  try {
    const raw = localStorage.getItem(TOPICS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Lấy toàn bộ từ vựng (Mock data + Custom words)
export function getAllWords() {
  const custom = getCustomWords();
  const customIds = new Set(custom.map(w => w.id));
  const deletedRaw = localStorage.getItem('signlingo_deleted_ids');
  const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
  
  const baseWords = DICTIONARY_WORDS.filter(w => !deletedIds.includes(w.id) && !customIds.has(w.id));
  return [...custom, ...baseWords];
}

// Lấy toàn bộ chủ đề kèm các bài học đã được bổ sung từ mới (phục vụ Tab Học tập)
export function getAllTopics() {
  const customWords = getCustomWords();
  const customTopics = getCustomTopics();

  // Clone TOPICS để không thay đổi trực tiếp mockData
  const baseTopics = TOPICS.map(t => ({
    ...t,
    lessons: [...t.lessons]
  }));

  // Gắn từng từ mới vào chủ đề tương ứng trong Tab Học tập
  customWords.forEach(word => {
    // Tìm chủ đề tương ứng theo ID hoặc theo Title
    let targetTopic = baseTopics.find(
      t => t.id === word.topic || 
           t.title.toLowerCase().includes((word.topicLabel || '').toLowerCase()) ||
           (word.topicLabel || '').toLowerCase().includes(t.title.toLowerCase())
    );

    const lessonItem = {
      id: `lesson-${word.id}`,
      wordId: word.id,
      title: word.word,
      description: word.description || 'Thực hiện cử chỉ chuẩn theo video hướng dẫn.',
      duration: word.duration || '3 phút',
      level: word.difficulty || 'Dễ',
      completed: false,
      score: 0,
      videoUrl: word.videoFront,
      isCustom: true
    };

    if (targetTopic) {
      // Nếu đã có bài học mang tên hoặc id này, cập nhật nội dung bài học
      const existingLessonIdx = targetTopic.lessons.findIndex(
        l => l.id === lessonItem.id || l.title.toLowerCase() === word.word.toLowerCase()
      );
      if (existingLessonIdx >= 0) {
        targetTopic.lessons[existingLessonIdx] = {
          ...targetTopic.lessons[existingLessonIdx],
          title: word.word,
          description: word.description || targetTopic.lessons[existingLessonIdx].description,
          videoUrl: word.videoFront || targetTopic.lessons[existingLessonIdx].videoUrl,
          duration: word.duration || targetTopic.lessons[existingLessonIdx].duration,
          level: word.difficulty || targetTopic.lessons[existingLessonIdx].level,
        };
      } else {
        targetTopic.lessons.push(lessonItem);
        targetTopic.totalLessons = targetTopic.lessons.length;
      }
    } else {
      // Nếu là chủ đề mới hoàn toàn, tạo chủ đề mới trong Lộ trình
      let newTopic = baseTopics.find(t => t.id === word.topic);
      if (!newTopic) {
        newTopic = {
          id: word.topic || `topic-${Date.now()}`,
          title: word.topicLabel || word.topic || 'Chủ đề mới',
          level: 'Mở rộng (Level 2)',
          levelCode: 'elementary',
          icon: '✨',
          description: `Các từ vựng bổ sung thuộc chủ đề ${word.topicLabel || word.topic}`,
          totalLessons: 1,
          completedLessons: 0,
          color: '#0284c7',
          bgColor: '#e0f2fe',
          accentColor: '#38bdf8',
          lessons: [lessonItem]
        };
        baseTopics.push(newTopic);
      } else {
        newTopic.lessons.push(lessonItem);
        newTopic.totalLessons = newTopic.lessons.length;
      }
    }
  });

  return baseTopics;
}

// Lưu từ mới (vào localStorage và đồng bộ lên backend nếu online)
export async function addCustomWord(wordData) {
  const current = getCustomWords();
  const newId = wordData.id || `w-custom-${Date.now()}`;
  
  const formattedWord = {
    id: newId,
    word: wordData.word.trim(),
    topic: wordData.topic || 'greeting',
    topicLabel: wordData.topicLabel || 'Chào hỏi',
    dialect: wordData.dialect || 'Toàn quốc',
    difficulty: wordData.difficulty || 'Dễ',
    duration: wordData.duration || '3 phút',
    description: wordData.description || '',
    details: wordData.details || wordData.description || '',
    handShape: wordData.handShape || 'Bàn tay mở tự nhiên chuẩn VSL',
    movement: wordData.movement || 'Di chuyển nhẹ nhàng theo hướng dẫn',
    videoFront: wordData.videoFront || '/chao.mp4',
    videoSide: wordData.videoSide || wordData.videoFront || '/chao.mp4',
    benchmarkId: `BM_CUSTOM_${Date.now()}`,
    benchmarkLandmarksExtracted: true,
    benchmarkAccuracy: 96.5,
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  // Cập nhật localStorage
  const updatedList = [formattedWord, ...current.filter(w => w.id !== newId)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  // Phát event đồng bộ UI toàn ứng dụng
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { action: 'add', word: formattedWord } }));

  // Đồng bộ lên backend API nếu có thể
  try {
    fetch('http://127.0.0.1:8000/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedWord)
    }).catch(() => {});
  } catch (err) {
    // Offline / fallback silently
  }

  return formattedWord;
}

// Xóa từ
export async function deleteWordById(wordId) {
  const current = getCustomWords();
  const isCustom = current.some(w => w.id === wordId);

  if (isCustom) {
    const updated = current.filter(w => w.id !== wordId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } else {
    // Ẩn từ mặc định
    const deletedRaw = localStorage.getItem('signlingo_deleted_ids');
    const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
    if (!deletedIds.includes(wordId)) {
      deletedIds.push(wordId);
      localStorage.setItem('signlingo_deleted_ids', JSON.stringify(deletedIds));
    }
  }

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { action: 'delete', id: wordId } }));

  // Gọi backend API nếu có
  try {
    fetch(`http://127.0.0.1:8000/api/words/${wordId}`, { method: 'DELETE' }).catch(() => {});
  } catch (e) {}
}

// Tải video lên backend hoặc fallback sang Blob URL
export async function uploadVideoFile(file) {
  // Tạo blob url dự phòng ngay lập tức để người dùng xem preview không có độ trễ
  const localPreviewUrl = URL.createObjectURL(file);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://127.0.0.1:8000/api/upload_video', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        videoUrl: data.videoUrl, // /uploads/video_...mp4
        previewUrl: localPreviewUrl,
        filename: data.filename
      };
    }
  } catch (e) {
    console.warn('Backend upload không khả dụng, sử dụng Local Blob URL:', e);
  }

  // Fallback: trả về local blob URL
  return {
    success: true,
    videoUrl: localPreviewUrl,
    previewUrl: localPreviewUrl,
    filename: file.name
  };
}

// Hook React để tự động lắng nghe và cập nhật danh sách từ & chủ đề
export function useSignWords() {
  const [words, setWords] = useState(getAllWords());
  const [topics, setTopics] = useState(getAllTopics());

  useEffect(() => {
    // Lấy dữ liệu từ backend nếu có lúc khởi chạy
    const syncBackendWords = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/words');
        if (res.ok) {
          const backendWords = await res.json();
          if (Array.isArray(backendWords) && backendWords.length > 0) {
            const local = getCustomWords();
            const merged = [...backendWords];
            local.forEach(lw => {
              if (!merged.some(bw => bw.id === lw.id)) {
                merged.push(lw);
              }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            setWords(getAllWords());
            setTopics(getAllTopics());
          }
        }
      } catch (err) {}
    };

    syncBackendWords();

    const handleUpdate = () => {
      setWords(getAllWords());
      setTopics(getAllTopics());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  return { words, topics, reload: () => { setWords(getAllWords()); setTopics(getAllTopics()); } };
}

// ==================== QUẢN LÝ BÀI HỌC / TỪ VỰNG ĐÃ LƯU (ÔN TẬP) ====================
const SAVED_STORAGE_KEY = 'signlingo_saved_lessons';
const SAVED_EVENT_NAME = 'signlingo_saved_lessons_updated';

const DEFAULT_SAVED_LESSONS = [
  {
    id: 'alpha-e',
    title: 'Chữ cái E',
    topicId: 'alphabet',
    topicTitle: 'Bảng chữ cái ngón tay',
    level: 'Căn bản (Level 1)',
    duration: '3 phút',
    difficulty: 'Trung bình',
    description: 'Bốn ngón cong gập đầu ngón tay tỳ lên ngón cái',
    savedAt: new Date().toISOString()
  },
  {
    id: 'greet-thanks',
    title: 'Cảm ơn',
    topicId: 'greeting',
    topicTitle: 'Chào hỏi & Làm quen',
    level: 'Sơ cấp (Level 2)',
    duration: '3 phút',
    difficulty: 'Dễ',
    description: 'Đặt đầu ngón tay lên cằm rồi hạ nhẹ bàn tay về phía trước',
    savedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export function getSavedLessons() {
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(DEFAULT_SAVED_LESSONS));
      return DEFAULT_SAVED_LESSONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SAVED_LESSONS;
  }
}

export function isLessonSaved(lessonId, lessonTitle) {
  const saved = getSavedLessons();
  return saved.some(item => item.id === lessonId || (lessonTitle && item.title.toLowerCase() === lessonTitle.toLowerCase()));
}

export function toggleSaveLesson(lesson, topic) {
  const saved = getSavedLessons();
  const exists = saved.some(item => item.id === lesson.id || (lesson.title && item.title.toLowerCase() === lesson.title.toLowerCase()));

  let updated;
  let isNowSaved = false;

  if (exists) {
    updated = saved.filter(item => item.id !== lesson.id && (!lesson.title || item.title.toLowerCase() !== lesson.title.toLowerCase()));
    isNowSaved = false;
  } else {
    const newItem = {
      id: lesson.id,
      title: lesson.title,
      topicId: topic?.id || lesson.topicId || 'custom',
      topicTitle: topic?.title || lesson.topicTitle || 'Bài học ký hiệu',
      level: topic?.level || lesson.level || 'Căn bản (Level 1)',
      duration: lesson.duration || '3 phút',
      difficulty: lesson.level || 'Dễ',
      description: lesson.description || '',
      videoUrl: lesson.videoUrl,
      wordId: lesson.wordId,
      savedAt: new Date().toISOString()
    };
    updated = [newItem, ...saved];
    isNowSaved = true;
  }

  localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(SAVED_EVENT_NAME, { detail: { lessonId: lesson.id, isSaved: isNowSaved, saved: updated } }));
  return isNowSaved;
}

export function removeSavedLesson(lessonId) {
  const saved = getSavedLessons();
  const updated = saved.filter(item => item.id !== lessonId);
  localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(SAVED_EVENT_NAME, { detail: { lessonId, isSaved: false, saved: updated } }));
  return updated;
}

export function useSavedLessons() {
  const [savedLessons, setSavedLessons] = useState(getSavedLessons());

  useEffect(() => {
    const handleUpdate = () => {
      setSavedLessons(getSavedLessons());
    };
    window.addEventListener(SAVED_EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(SAVED_EVENT_NAME, handleUpdate);
  }, []);

  const checkIsSaved = (lessonId, lessonTitle) => {
    return savedLessons.some(item => item.id === lessonId || (lessonTitle && item.title.toLowerCase() === lessonTitle.toLowerCase()));
  };

  return {
    savedLessons,
    isSaved: checkIsSaved,
    toggleSave: (lesson, topic) => toggleSaveLesson(lesson, topic),
    removeSaved: (lessonId) => removeSavedLesson(lessonId),
    reload: () => setSavedLessons(getSavedLessons())
  };
}
