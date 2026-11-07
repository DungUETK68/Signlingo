import { useState, useEffect } from 'react';
import { DICTIONARY_WORDS, TOPICS } from './mockData';
import { dictionaryApi } from '../services/api';

const STORAGE_KEY = 'signlingo_custom_words';
const TOPICS_STORAGE_KEY = 'signlingo_custom_topics';
const EVENT_NAME = 'signlingo_data_updated';

// Danh sách các ID từ seeding mẫu hoặc từ cũ cần loại bỏ triệt để
const LEGACY_SEEDING_IDS = new Set(['w-hello', 'w-bye', 'w-family', 'w-alpha-a', 'w-num-5', 'vsl-chao', 'w-chao', 'chao']);

// Lấy danh sách từ tùy chỉnh từ localStorage
export function getCustomWords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    // Danh sách slug và tên của các từ chuẩn trong bộ từ điển gốc
    const standardSlugs = new Set(DICTIONARY_WORDS.map(w => (w.slug || '').toLowerCase().trim()));
    const standardNames = new Set(DICTIONARY_WORDS.map(w => (w.word || '').toLowerCase().trim()));

    // Lọc bỏ triệt để:
    // 1. Các từ seeding ảnh/mock cũ hoặc từ 'chao'
    // 2. Các từ chuẩn VSL400 bị lưu lặp vào STORAGE_KEY (không phải do người dùng tự tạo mới)
    const cleaned = list.filter(w => {
      if (!w || !w.word) return false;
      if (w.id && LEGACY_SEEDING_IDS.has(w.id)) return false;
      if (w.slug === 'chao' || w.word === 'Chào') return false;
      const vFront = String(w.videoFront || '');
      const vThumb = String(w.thumbnail || '');
      if (vFront.includes('unsplash.com') || vThumb.includes('unsplash.com')) return false;

      // Nếu từ này trùng với từ chuẩn VSL400 và không có cờ isCustom thì loại bỏ để tránh nhân đôi
      const s = (w.slug || '').toLowerCase().trim();
      const n = (w.word || '').toLowerCase().trim();
      if (!w.isCustom && (standardSlugs.has(s) || standardNames.has(n))) {
        return false;
      }

      return true;
    });

    if (cleaned.length !== list.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
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

// Lấy toàn bộ từ vựng (Khử trùng lặp triệt để theo slug & tên từ vựng)
export function getAllWords() {
  const custom = getCustomWords();
  const deletedRaw = localStorage.getItem('signlingo_deleted_ids');
  const deletedIds = new Set(deletedRaw ? JSON.parse(deletedRaw) : []);

  const result = [];
  const seenSlugs = new Set();
  const seenNames = new Set();

  const addWord = (w) => {
    if (!w || !w.word) return;
    if (w.slug === 'chao' || w.word === 'Chào') return;
    if (w.id && deletedIds.has(w.id)) return;
    if (w.slug && deletedIds.has(w.slug)) return;

    const slugKey = (w.slug || w.word).toLowerCase().replace(/[^a-z0-9_]/g, '');
    const nameKey = w.word.toLowerCase().trim();

    if (!seenSlugs.has(slugKey) && !seenNames.has(nameKey)) {
      seenSlugs.add(slugKey);
      seenNames.add(nameKey);
      result.push(w);
    }
  };

  // 1. Từ do người dùng tự thêm (custom words) ưu tiên
  custom.forEach(addWord);

  // 2. Toàn bộ từ chuẩn VSL400 + Chào
  DICTIONARY_WORDS.forEach(addWord);

  return result;
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
    videoFront: wordData.videoFront || '/vsl400_videos/cam_on_front.mp4',
    videoLeft: wordData.videoLeft || wordData.videoSide || '/vsl400_videos/cam_on_left.mp4',
    videoRight: wordData.videoRight || '/vsl400_videos/cam_on_right.mp4',
    videoSide: wordData.videoSide || wordData.videoLeft || wordData.videoFront || '/vsl400_videos/cam_on_left.mp4',
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
    // Lấy dữ liệu từ backend NestJS nếu có lúc khởi chạy
    const syncBackendWords = async () => {
      try {
        const [backendWords, backendTopics] = await Promise.all([
          dictionaryApi.getWords().catch(() => []),
          dictionaryApi.getTopics().catch(() => []),
        ]);

        if (Array.isArray(backendWords) && backendWords.length > 0) {
          const standardSlugs = new Set(DICTIONARY_WORDS.map(w => (w.slug || '').toLowerCase().trim()));
          const standardNames = new Set(DICTIONARY_WORDS.map(w => (w.word || '').toLowerCase().trim()));

          // Chỉ lưu vào localStorage nếu có từ mới tùy chỉnh được tạo trên backend mà chưa có trong DICTIONARY_WORDS
          const trulyCustomFromBackend = backendWords
            .filter(bw => {
              const s = (bw.slug || '').toLowerCase().trim();
              const n = (bw.name || bw.word || '').toLowerCase().trim();
              return !standardSlugs.has(s) && !standardNames.has(n);
            })
            .map(bw => ({
              id: bw.id,
              word: bw.name || bw.word,
              slug: bw.slug,
              topic: bw.topicId || bw.topic || 'general',
              topicLabel: bw.category || bw.topicLabel || 'Từ vựng thông dụng',
              description: bw.meaning || bw.description || 'Thực hiện cử chỉ theo video mẫu.',
              details: bw.usageTips || bw.details || '',
              videoFront: bw.videoFront || bw.videoUrl || '/vsl400_videos/cam_on_front.mp4',
              videoUrl: bw.videoUrl || bw.videoFront || '/vsl400_videos/cam_on_front.mp4',
              videoLeft: bw.videoLeft || bw.videoSide || '/vsl400_videos/cam_on_left.mp4',
              videoRight: bw.videoRight || '/vsl400_videos/cam_on_right.mp4',
              videoSide: bw.videoLeft || bw.videoSide || bw.videoUrl || '/vsl400_videos/cam_on_left.mp4',
              thumbnail: bw.thumbnailUrl || bw.thumbnail || (bw.slug ? `/vsl400_videos/${bw.slug}_thumb.jpg` : '/vsl400_videos/cam_on_thumb.jpg'),
              difficulty: bw.difficulty || 'Dễ',
              dialect: 'Toàn quốc',
              isCustom: true
            }));

          if (trulyCustomFromBackend.length > 0) {
            const local = getCustomWords();
            const merged = [...trulyCustomFromBackend];
            local.forEach(lw => {
              if (!merged.some(bw => bw.id === lw.id || bw.slug === lw.slug)) {
                merged.push(lw);
              }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          }
          setWords(getAllWords());
        }

        if (Array.isArray(backendTopics) && backendTopics.length > 0) {
          const syncedTopics = backendTopics.map(bt => ({
            id: bt.slug || bt.id,
            title: bt.title,
            subtitle: bt.subtitle || '',
            icon: bt.icon || '👋',
            lessons: (bt.lessons || []).map((l, lIdx) => ({
              id: l.id || `lesson-${l.slug || lIdx}`,
              title: l.title,
              description: l.description || '',
              duration: l.duration || '5 phút',
              level: l.level || 'Cơ bản',
              completed: false,
              score: 0,
              videoUrl: l.videoUrl || '/vsl400_videos/cam_on_front.mp4'
            }))
          }));
          setTopics(syncedTopics);
        } else {
          setTopics(getAllTopics());
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ từ vựng & chủ đề từ backend:', err);
      }
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

// ==================== QUẢN LÝ CÂU GIAO TIẾP ĐÃ LƯU (ÔN TẬP CÂU) ====================
const SAVED_SENTENCES_KEY = 'signlingo_saved_sentences';
const SAVED_SENTENCES_EVENT = 'signlingo_saved_sentences_updated';

const DEFAULT_SAVED_SENTENCES = [
  {
    id: 'em-cam-on-anh',
    slug: 'em-cam-on-anh',
    title: 'Em cảm ơn anh',
    meaning: 'Lời cảm kích chân thành, lễ phép của em gửi tới người anh.',
    category: 'Giao tiếp & Xã giao',
    difficulty: 'Dễ',
    structure: 'SOV: Chủ (Em) + Người nhận (Anh) + Động từ (Cảm ơn)',
    wordsCount: 3,
    savedAt: new Date().toISOString()
  },
  {
    id: 'anh-an-pho',
    slug: 'anh-an-pho',
    title: 'Anh ăn phở',
    meaning: 'Anh đang thưởng thức món phở truyền thống.',
    category: 'Ẩm thực & Thức uống',
    difficulty: 'Dễ',
    structure: 'SOV: Chủ (Anh) + Bổ ngữ (Phở) + Động từ (Ăn)',
    wordsCount: 3,
    savedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export function getSavedSentences() {
  try {
    const raw = localStorage.getItem(SAVED_SENTENCES_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_SENTENCES_KEY, JSON.stringify(DEFAULT_SAVED_SENTENCES));
      return DEFAULT_SAVED_SENTENCES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SAVED_SENTENCES;
  }
}

export function isSentenceSaved(sentenceId, slug) {
  const saved = getSavedSentences();
  return saved.some(item => item.id === sentenceId || item.slug === sentenceId || (slug && (item.slug === slug || item.id === slug)));
}

export function toggleSaveSentence(sentence) {
  if (!sentence) return false;
  const saved = getSavedSentences();
  const sid = sentence.id || sentence.slug;
  const sslug = sentence.slug || sentence.id;
  const exists = saved.some(item => item.id === sid || item.slug === sslug);

  let updated;
  let isNowSaved = false;

  if (exists) {
    updated = saved.filter(item => item.id !== sid && item.slug !== sslug);
    isNowSaved = false;
  } else {
    const newItem = {
      id: sid,
      slug: sslug,
      title: sentence.title,
      meaning: sentence.meaning || '',
      category: sentence.category || sentence.topicLabel || sentence.topic || 'Giao tiếp & Xã giao',
      difficulty: sentence.difficulty || 'Dễ',
      structure: sentence.structure || sentence.signOrderText || 'SOV (Chủ - Bổ - Động)',
      explanation: sentence.explanation || sentence.grammarExplanation || '',
      words: sentence.words || [],
      wordsCount: (sentence.words || []).length,
      savedAt: new Date().toISOString()
    };
    updated = [newItem, ...saved];
    isNowSaved = true;
  }

  localStorage.setItem(SAVED_SENTENCES_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(SAVED_SENTENCES_EVENT, { detail: { sentenceId: sid, isSaved: isNowSaved, saved: updated } }));
  return isNowSaved;
}

export function removeSavedSentence(sentenceId) {
  const saved = getSavedSentences();
  const updated = saved.filter(item => item.id !== sentenceId && item.slug !== sentenceId);
  localStorage.setItem(SAVED_SENTENCES_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(SAVED_SENTENCES_EVENT, { detail: { sentenceId, isSaved: false, saved: updated } }));
  return updated;
}

export function useSavedSentences() {
  const [savedSentences, setSavedSentences] = useState(getSavedSentences());

  useEffect(() => {
    const handleUpdate = () => {
      setSavedSentences(getSavedSentences());
    };
    window.addEventListener(SAVED_SENTENCES_EVENT, handleUpdate);
    return () => window.removeEventListener(SAVED_SENTENCES_EVENT, handleUpdate);
  }, []);

  const checkIsSaved = (sentenceId, slug) => isSentenceSaved(sentenceId, slug);

  return {
    savedSentences,
    isSaved: checkIsSaved,
    toggleSave: (sentence) => toggleSaveSentence(sentence),
    removeSaved: (sentenceId) => removeSavedSentence(sentenceId),
    reload: () => setSavedSentences(getSavedSentences())
  };
}
