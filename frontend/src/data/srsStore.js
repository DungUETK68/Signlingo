/**
 * srsStore.js
 * Hệ thống Học Lặp Lại Ngắt Quãng (Spaced Repetition System - SRS) 6 Mức Độ Nhớ cho Signlingo
 * Tham chiếu mô hình ghi nhớ từ vựng (tương tự VstepOwl):
 *  0. Chưa Nhớ       -> Chu kỳ chờ: 12 giờ
 *  1. Nhớ Mong Manh  -> Chu kỳ chờ: 1 ngày (24h)
 *  2. Nhớ Chủ Động   -> Chu kỳ chờ: 3 ngày (72h)
 *  3. Nhớ Tự Tin     -> Chu kỳ chờ: 7 ngày (168h)
 *  4. Nhớ Mạnh       -> Chu kỳ chờ: 14 ngày (336h)
 *  5. Nhớ Dài Hạn    -> Đã thuộc hoàn toàn (không còn thời gian chờ ôn lại)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllWords } from './wordsStore';
import { adaptiveApi, getStoredToken } from '../services/api';

const SRS_STORAGE_KEY = 'signlingo_srs_memory_v1';
const SRS_UPDATED_EVENT = 'signlingo_srs_updated';

export const MEMORY_LEVELS = [
  {
    level: 0,
    key: 'unremembered',
    title: 'Chưa Nhớ',
    subtitle: 'Cần luyện tập',
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    waitHours: 12,
    intervalLabel: '12 giờ',
  },
  {
    level: 1,
    key: 'fragile',
    title: 'Nhớ Mong Manh',
    subtitle: 'Đang học',
    color: '#f97316',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    waitHours: 24,
    intervalLabel: '1 ngày',
  },
  {
    level: 2,
    key: 'active',
    title: 'Nhớ Chủ Động',
    subtitle: 'Đang luyện tập',
    color: '#eab308',
    bgColor: '#fefce8',
    borderColor: '#fde047',
    waitHours: 72,
    intervalLabel: '3 ngày',
  },
  {
    level: 3,
    key: 'confident',
    title: 'Nhớ Tự Tin',
    subtitle: 'Tự tin',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    waitHours: 168,
    intervalLabel: '7 ngày',
  },
  {
    level: 4,
    key: 'strong',
    title: 'Nhớ Mạnh',
    subtitle: 'Nhớ tốt',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    waitHours: 336,
    intervalLabel: '14 ngày',
  },
  {
    level: 5,
    key: 'long_term',
    title: 'Nhớ Dài Hạn',
    subtitle: 'Đã thành thạo',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#86efac',
    waitHours: null,
    intervalLabel: 'Đã nhớ dài hạn',
  },
];

export function getMemoryLevelInfo(level = 0) {
  const clamped = Math.min(5, Math.max(0, Number(level) || 0));
  return MEMORY_LEVELS[clamped];
}

/**
 * Chuẩn hóa slug từ vựng tiếng Việt sang dạng snake_case khớp chuẩn VSL400 (VD: "Cảm ơn" -> "cam_on")
 */
export function normalizeWordSlug(input = '') {
  if (!input) return '';
  return String(input)
    .trim()
    .replace(/^vsl-/i, '')
    .replace(/^lesson-/i, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Đọc Map trạng thái SRS cục bộ từ localStorage
 */
export function getLocalSrsMap() {
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function saveLocalSrsMap(map) {
  try {
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(SRS_UPDATED_EVENT));
  } catch (e) {
    console.warn('Không thể lưu trạng thái SRS:', e);
  }
}

/**
 * Đăng ký một từ vừa mới học hoặc mới lưu vào lịch nhắc ôn tập sau 12 giờ (nếu chưa có trong SRS)
 */
export function enrollWordInSrs({ wordSlug, wordName, startedNow = false, baseTimeMs = null }) {
  const allWords = getAllWords();
  const matched = allWords.find(
    (w) =>
      (wordSlug && normalizeWordSlug(w.slug) === normalizeWordSlug(wordSlug)) ||
      (wordName && w.word.toLowerCase().trim() === String(wordName).toLowerCase().trim())
  );

  const slug = matched?.slug || normalizeWordSlug(wordSlug || wordName);
  const name = matched?.word || wordName || slug;
  if (!slug) return null;

  const map = getLocalSrsMap();
  if (!map[slug]) {
    const originMs = typeof baseTimeMs === 'number' && !isNaN(baseTimeMs) ? baseTimeMs : Date.now();
    const nextReviewAt = new Date(originMs + 12 * 3600 * 1000).toISOString();
    map[slug] = {
      wordSlug: slug,
      wordName: name,
      memoryLevel: 0,
      isMastered: false,
      reviewCount: startedNow ? 1 : 0,
      lapseCount: 0,
      lastScore: 0,
      intervalHours: 12,
      nextReviewAt,
      lastReviewedAt: startedNow ? new Date().toISOString() : null,
    };
    saveLocalSrsMap(map);
  }
  return map[slug];
}

/**
 * Ghi nhận kết quả sau khi người dùng thực hiện ĐẠT động tác trên màn hình Ôn tập SRS:
 * - choice = 'remembered' ("Đã nhớ"): tăng +1 mức nhớ, tăng thời gian chờ; đạt mức 5 ("Nhớ Dài Hạn") -> hoàn tất không hẹn lại
 * - choice = 'review_again' ("Sẽ ôn lại"): về mức 0 ("Chưa Nhớ"), hẹn nhắc lại sau 12h
 */
export async function recordSrsChoice({
  wordSlug,
  wordName,
  choice,
  score = 90,
  failedAttempts = 0,
}) {
  const allWords = getAllWords();
  const matched = allWords.find(
    (w) =>
      (wordSlug && normalizeWordSlug(w.slug) === normalizeWordSlug(wordSlug)) ||
      (wordName && w.word.toLowerCase().trim() === String(wordName).toLowerCase().trim())
  );

  const slug = matched?.slug || normalizeWordSlug(wordSlug || wordName);
  const name = matched?.word || wordName || slug;
  const now = new Date();
  const map = getLocalSrsMap();

  const current = map[slug] || {
    wordSlug: slug,
    wordName: name,
    memoryLevel: 0,
    isMastered: false,
    reviewCount: 0,
    lapseCount: 0,
    lastScore: 0,
    intervalHours: 12,
    nextReviewAt: now.toISOString(),
  };

  let nextLevel = current.memoryLevel || 0;
  let isMastered = false;
  let intervalHours = 12;
  let nextReviewAt = null;
  let lapseCount = (current.lapseCount || 0) + (failedAttempts > 0 ? 1 : 0);

  if (choice === 'remembered') {
    nextLevel = Math.min(5, (current.memoryLevel || 0) + 1);
    if (nextLevel >= 5) {
      isMastered = true;
      intervalHours = 0;
      nextReviewAt = null;
    } else {
      const lvlInfo = getMemoryLevelInfo(nextLevel);
      intervalHours = lvlInfo.waitHours || 24;
      nextReviewAt = new Date(now.getTime() + intervalHours * 3600 * 1000).toISOString();
    }
  } else {
    // Chọn "Sẽ ôn lại" -> Về mức đầu tiên "Chưa Nhớ" & nhắc ôn lại trong 12h
    nextLevel = 0;
    isMastered = false;
    intervalHours = 12;
    lapseCount += 1;
    nextReviewAt = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();
  }

  const updatedEntry = {
    ...current,
    wordSlug: slug,
    wordName: name,
    memoryLevel: nextLevel,
    isMastered,
    reviewCount: (current.reviewCount || 0) + 1,
    lapseCount,
    lastScore: Math.round(score || 0),
    intervalHours,
    nextReviewAt,
    lastReviewedAt: now.toISOString(),
  };

  map[slug] = updatedEntry;
  saveLocalSrsMap(map);

  // Đồng bộ bất đồng bộ lên NestJS Backend nếu người dùng đã đăng nhập
  if (getStoredToken()) {
    adaptiveApi
      .submitReviewResult({
        wordSlug: slug,
        wordName: name,
        choice,
        score: Math.round(score || 0),
        failedAttempts,
      })
      .catch(() => {});
  }

  return updatedEntry;
}

/**
 * Kiểm tra xem một mục từ vựng đã đến hạn cần ôn tập chưa
 */
export function isWordDueForReview(entry, nowMs = Date.now()) {
  if (!entry) return false;
  if (entry.isMastered || (entry.memoryLevel || 0) >= 5) return false;
  if (!entry.nextReviewAt) return true;
  const targetMs = new Date(entry.nextReviewAt).getTime();
  if (isNaN(targetMs)) return true;
  return targetMs <= nowMs;
}

/**
 * Định dạng thời gian chờ còn lại sang tiếng Việt tự nhiên
 */
export function formatRemainingReviewTime(entry, nowMs = Date.now()) {
  if (!entry) return 'Chưa có lịch';
  if (entry.isMastered || (entry.memoryLevel || 0) >= 5) {
    return 'Đã nhớ dài hạn (Không cần ôn lại)';
  }
  if (!entry.nextReviewAt) return 'Cần ôn ngay';

  const diffMs = new Date(entry.nextReviewAt).getTime() - nowMs;
  if (isNaN(diffMs) || diffMs <= 0) {
    return 'Đến hạn cần ôn ngay';
  }

  const totalMinutes = Math.ceil(diffMs / 60000);
  if (totalMinutes < 60) {
    return `Ôn sau ${totalMinutes} phút`;
  }
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;
  if (totalHours < 24) {
    return remMinutes > 0 ? `Ôn sau ${totalHours}h ${remMinutes}p` : `Ôn sau ${totalHours} giờ`;
  }
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  return remHours > 0 ? `Ôn sau ${days} ngày ${remHours}h` : `Ôn sau ${days} ngày`;
}

/**
 * Hook quản lý toàn diện trạng thái ghi nhớ 6 mức độ cho danh sách từ đã lưu & từ đã học
 */
export function useSpacedRepetition(savedLessons = []) {
  const [srsMap, setSrsMap] = useState(() => getLocalSrsMap());
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Đảm bảo toàn bộ từ trong savedLessons đều có bản ghi theo dõi SRS (bắt đầu từ 12h sau savedAt)
  useEffect(() => {
    const allWords = getAllWords();
    const map = getLocalSrsMap();
    let changed = false;

    const toSyncBackend = [];

    (savedLessons || []).forEach((lesson) => {
      const matched = allWords.find(
        (w) =>
          (lesson.wordId && `vsl-${w.slug}` === lesson.wordId) ||
          w.word.toLowerCase().trim() === (lesson.title || '').toLowerCase().trim() ||
          normalizeWordSlug(w.slug) === normalizeWordSlug(lesson.id || lesson.title)
      );

      const slug = matched?.slug || normalizeWordSlug(lesson.title || lesson.id);
      const wordName = matched?.word || lesson.title;
      if (!slug) return;

      if (!map[slug]) {
        const savedAtMs = lesson.savedAt ? new Date(lesson.savedAt).getTime() : Date.now();
        const validOrigin = isNaN(savedAtMs) ? Date.now() : savedAtMs;
        // Bắt đầu nhắc từ sau 12 tiếng kể từ thời điểm lưu/học
        const nextAt = new Date(validOrigin + 12 * 3600 * 1000).toISOString();

        map[slug] = {
          wordSlug: slug,
          wordName,
          memoryLevel: 0,
          isMastered: false,
          reviewCount: 0,
          lapseCount: 0,
          lastScore: 0,
          intervalHours: 12,
          nextReviewAt: nextAt,
          lastReviewedAt: null,
        };
        changed = true;
      }

      toSyncBackend.push({
        wordSlug: slug,
        wordName,
        savedAt: lesson.savedAt || new Date().toISOString(),
      });
    });

    if (changed) {
      saveLocalSrsMap(map);
      setSrsMap({ ...map });
    }

    // Đồng bộ hai chiều với Backend PostgreSQL nếu đã đăng nhập
    if (getStoredToken()) {
      const syncPromise =
        toSyncBackend.length > 0
          ? adaptiveApi.syncSavedWords(toSyncBackend)
          : adaptiveApi.getMemoryOverview();

      syncPromise
        .then((overview) => {
          if (overview && Array.isArray(overview.items) && overview.items.length > 0) {
            const latestLocal = getLocalSrsMap();
            let mergedChanged = false;

            overview.items.forEach((srv) => {
              const s = srv.wordSlug;
              if (!s) return;
              const loc = latestLocal[s];
              const srvUpdated = srv.lastReviewedAt ? new Date(srv.lastReviewedAt).getTime() : 0;
              const locUpdated = loc?.lastReviewedAt ? new Date(loc.lastReviewedAt).getTime() : 0;

              if (!loc || srvUpdated > locUpdated || (srv.memoryLevel || 0) > (loc.memoryLevel || 0)) {
                latestLocal[s] = {
                  wordSlug: s,
                  wordName: srv.wordName || loc?.wordName || s,
                  memoryLevel: srv.memoryLevel ?? 0,
                  isMastered: !!srv.isMastered || (srv.memoryLevel ?? 0) >= 5,
                  reviewCount: srv.reviewCount ?? 0,
                  lapseCount: srv.lapseCount ?? 0,
                  lastScore: srv.lastScore ?? 0,
                  intervalHours: srv.intervalHours ?? 12,
                  nextReviewAt: srv.nextReviewAt || null,
                  lastReviewedAt: srv.lastReviewedAt || null,
                };
                mergedChanged = true;
              }
            });

            if (mergedChanged) {
              saveLocalSrsMap(latestLocal);
              setSrsMap({ ...latestLocal });
            }
          }
        })
        .catch(() => {});
    }
  }, [savedLessons]);

  // Lắng nghe cập nhật SRS toàn ứng dụng + bộ đếm thời gian mỗi 30 giây
  useEffect(() => {
    const handleSrsEvent = () => {
      setSrsMap({ ...getLocalSrsMap() });
      setNowMs(Date.now());
    };
    window.addEventListener(SRS_UPDATED_EVENT, handleSrsEvent);
    const timer = setInterval(() => setNowMs(Date.now()), 30000);
    return () => {
      window.removeEventListener(SRS_UPDATED_EVENT, handleSrsEvent);
      clearInterval(timer);
    };
  }, []);

  // Ghép thông tin đầy đủ cho danh sách từ ôn tập (bao gồm cả từ đã lưu + từ đã học trong SRS)
  const trackedWords = useMemo(() => {
    const allWords = getAllWords();
    const seenSlugs = new Set();
    const result = [];

    // 1. Ưu tiên các từ người dùng đã lưu trong tab Ôn tập
    (savedLessons || []).forEach((lesson) => {
      const matched = allWords.find(
        (w) =>
          (lesson.wordId && `vsl-${w.slug}` === lesson.wordId) ||
          w.word.toLowerCase().trim() === (lesson.title || '').toLowerCase().trim() ||
          normalizeWordSlug(w.slug) === normalizeWordSlug(lesson.id || lesson.title)
      );
      const slug = matched?.slug || normalizeWordSlug(lesson.title || lesson.id);
      if (!slug || seenSlugs.has(slug)) return;
      seenSlugs.add(slug);

      const srs = srsMap[slug] || {
        wordSlug: slug,
        wordName: matched?.word || lesson.title,
        memoryLevel: 0,
        isMastered: false,
        reviewCount: 0,
        lapseCount: 0,
        lastScore: 0,
        intervalHours: 12,
        nextReviewAt: lesson.savedAt
          ? new Date(new Date(lesson.savedAt).getTime() + 12 * 3600 * 1000).toISOString()
          : new Date().toISOString(),
      };

      const levelInfo = getMemoryLevelInfo(srs.memoryLevel);
      const isDue = isWordDueForReview(srs, nowMs);

      result.push({
        ...lesson,
        slug,
        wordName: matched?.word || lesson.title,
        title: lesson.title || matched?.word,
        description: lesson.description || matched?.description || 'Thực hiện cử chỉ chuẩn VSL.',
        handShape: matched?.handShape || 'Bàn tay định hình rõ nét trước ngực',
        movement: matched?.movement || 'Thực hiện đúng biên độ theo hướng dẫn',
        videoFront:
          matched?.videoFront ||
          lesson.videoUrl ||
          `/vsl400_videos/${slug}_front.mp4`,
        videoSide:
          matched?.videoSide ||
          matched?.videoLeft ||
          `/vsl400_videos/${slug}_left.mp4`,
        isSavedBookmark: true,
        srs,
        memoryLevel: levelInfo.level,
        levelInfo,
        isDue,
        remainingText: formatRemainingReviewTime(srs, nowMs),
      });
    });

    // 2. Bổ sung các từ mới người học đã luyện tập (từ Lộ trình / AI Studio) có trong srsMap nhưng chưa bấm Lưu thủ công
    Object.values(srsMap).forEach((srs) => {
      if (!srs || !srs.wordSlug || seenSlugs.has(srs.wordSlug)) return;
      seenSlugs.add(srs.wordSlug);

      const matched = allWords.find(
        (w) =>
          normalizeWordSlug(w.slug) === normalizeWordSlug(srs.wordSlug) ||
          w.word.toLowerCase().trim() === (srs.wordName || '').toLowerCase().trim()
      );
      const levelInfo = getMemoryLevelInfo(srs.memoryLevel);
      const isDue = isWordDueForReview(srs, nowMs);

      result.push({
        id: matched?.id || `srs-${srs.wordSlug}`,
        slug: srs.wordSlug,
        wordName: matched?.word || srs.wordName,
        title: matched?.word || srs.wordName,
        topicId: matched?.topic || 'greeting',
        topicTitle: matched?.topicLabel || 'Từ vựng đã học',
        difficulty: matched?.difficulty || 'Dễ',
        duration: '3 phút',
        description: matched?.description || 'Từ vựng bạn đã học và đang trong chu kỳ lặp lại ngắt quãng.',
        handShape: matched?.handShape || 'Bàn tay định hình rõ nét trước ngực',
        movement: matched?.movement || 'Thực hiện đúng biên độ theo hướng dẫn',
        videoFront: matched?.videoFront || `/vsl400_videos/${srs.wordSlug}_front.mp4`,
        videoSide: matched?.videoSide || matched?.videoLeft || `/vsl400_videos/${srs.wordSlug}_left.mp4`,
        isSavedBookmark: false,
        srs,
        memoryLevel: levelInfo.level,
        levelInfo,
        isDue,
        remainingText: formatRemainingReviewTime(srs, nowMs),
      });
    });

    return result;
  }, [savedLessons, srsMap, nowMs]);

  // Tính toán thống kê bảng "Phân bổ ghi nhớ" (chuẩn VstepOwl)
  const stats = useMemo(() => {
    const totalWords = trackedWords.length;
    const levelCounts = [0, 0, 0, 0, 0, 0];
    let startedCount = 0;
    let strongCount = 0;
    let hardCount = 0;

    trackedWords.forEach((item) => {
      const lvl = item.memoryLevel;
      levelCounts[lvl] += 1;
      if ((item.srs?.reviewCount || 0) > 0 || lvl > 0) {
        startedCount += 1;
      }
      if (lvl >= 3) {
        strongCount += 1;
      }
      if ((item.srs?.lapseCount || 0) > 0) {
        hardCount += 1;
      }
    });

    const dueWords = trackedWords
      .filter((item) => item.isDue)
      .sort((a, b) => {
        const ta = a.srs?.nextReviewAt ? new Date(a.srs.nextReviewAt).getTime() : 0;
        const tb = b.srs?.nextReviewAt ? new Date(b.srs.nextReviewAt).getTime() : 0;
        return ta - tb;
      });

    // Tìm thời điểm từ tiếp theo đến hạn nếu hiện tại chưa có từ nào đến hạn
    const pendingWaiting = trackedWords
      .filter((item) => !item.isDue && item.memoryLevel < 5 && item.srs?.nextReviewAt)
      .sort((a, b) => new Date(a.srs.nextReviewAt).getTime() - new Date(b.srs.nextReviewAt).getTime());

    const nextUpcomingItem = pendingWaiting[0] || null;

    const levelsBreakdown = MEMORY_LEVELS.map((info) => {
      const count = levelCounts[info.level];
      const percent = totalWords > 0 ? Math.round((count / totalWords) * 100) : 0;
      return {
        ...info,
        count,
        percent,
      };
    });

    return {
      totalWords,
      startedCount,
      startedPercent: totalWords > 0 ? Math.round((startedCount / totalWords) * 100) : 0,
      strongCount,
      strongPercent: totalWords > 0 ? Math.round((strongCount / totalWords) * 100) : 0,
      hardCount,
      dueWords,
      dueCount: dueWords.length,
      unmasteredWords: trackedWords.filter((w) => w.memoryLevel < 5),
      nextUpcomingItem,
      levelsBreakdown,
    };
  }, [trackedWords]);

  const refresh = useCallback(() => {
    setSrsMap({ ...getLocalSrsMap() });
    setNowMs(Date.now());
  }, []);

  return {
    trackedWords,
    stats,
    refresh,
  };
}
