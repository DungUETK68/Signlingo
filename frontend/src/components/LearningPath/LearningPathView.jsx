import React, { useState, useEffect } from 'react';
import { useSignWords, useSavedLessons } from '../../data/wordsStore';
import { markStandardLessonCompleted } from '../../data/curriculumBuilder';
import { progressApi } from '../../services/api';
import LessonDetailView from './LessonDetailView';
import PathActivityRunner from './PathActivityRunner';
import PageHeroBanner from '../common/PageHeroBanner';
import {
  Check,
  Play,
  RotateCcw,
  ChevronRight,
  BookOpen,
  GraduationCap,
  MessageSquareQuote,
  ArrowLeft,
  Camera,
  Search,
  Bookmark,
  BookmarkCheck,
  HelpCircle,
  Video,
  Zap,
  Target,
} from 'lucide-react';

const PHASE_METADATA = {
  1: {
    title: 'Giai đoạn 1: Lý thuyết Ngữ pháp & Trắc nghiệm Kiến thức',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  2: {
    title: 'Giai đoạn 2: Từ vựng Ký hiệu Chuẩn & Kiểm tra Nhận diện',
    color: '#0284c7',
    bg: '#f0f9ff',
  },
  3: {
    title: 'Giai đoạn 3: Ôn lại Từ vựng Đã lưu & Củng cố Từ cũ',
    color: '#0d9488',
    bg: '#f0fdfa',
  },
  4: {
    title: 'Giai đoạn 4: Thực hành Ghép câu Giao tiếp VSL',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  5: {
    title: 'Giai đoạn 5: Bài tập & Thử thách Tổng kết Chuyên đề',
    color: '#d97706',
    bg: '#fffbeb',
  },
};

const ACTIVITY_TYPES = new Set(['quiz_theory', 'quiz_video', 'challenge_sign', 'saved_review']);

export default function LearningPathView({
  onStartPracticeWord,
  initialLesson = null,
  initialTopic = null,
  onClearInitialLesson,
  onOpenSentenceDetail,
  onOpenGrammar,
}) {
  const { topics, reload: reloadTopics } = useSignWords();
  const { savedLessons, isSaved, toggleSave } = useSavedLessons();

  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'basic' | 'elementary' | 'intermediate'
  const [selectedTopicForView, setSelectedTopicForView] = useState(null);
  const [activeLesson, setActiveLesson] = useState(initialLesson || null);
  const [activeTopic, setActiveTopic] = useState(initialTopic || null);

  // Bộ lọc bên trong chuyên đề đang mở
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [lessonTypeFilter, setLessonTypeFilter] = useState('all'); // 'all' | 'grammar' | 'word' | 'challenge' | 'saved_review' | 'sentence'
  const [topicFilterStatus, setTopicFilterStatus] = useState('all'); // 'all' | 'unlearned' | 'completed'

  // Khi có bài học truyền từ bên ngoài vào
  useEffect(() => {
    if (initialLesson) {
      setActiveLesson(initialLesson);
      if (initialTopic) {
        setActiveTopic(initialTopic);
        setSelectedTopicForView(initialTopic);
      } else {
        const found = topics.find(
          (t) =>
            t.id === initialLesson.topicId ||
            (t.lessons &&
              t.lessons.some(
                (l) =>
                  l.id === initialLesson.id ||
                  l.title === initialLesson.title ||
                  l.slug === initialLesson.slug
              ))
        );
        if (found) {
          setActiveTopic(found);
          setSelectedTopicForView(found);
        } else {
          const fallbackTopic = {
            id: initialLesson.topicId || 'custom',
            title: initialLesson.topicTitle || 'Chuyên đề bài học',
            level: initialLesson.level || 'Căn bản (Level 1)',
            lessons: [initialLesson],
          };
          setActiveTopic(fallbackTopic);
          setSelectedTopicForView(fallbackTopic);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialLesson, initialTopic, topics]);

  const filteredTopics =
    selectedLevel === 'all'
      ? topics
      : topics.filter((t) => t.levelCode === selectedLevel);

  // Tính toán chính xác tổng số bài học và số bài đã hoàn thành
  const totalLessons = topics.reduce(
    (sum, t) => sum + (t.totalLessons || t.lessons?.length || 0),
    0
  );
  const completedLessons = Math.min(
    totalLessons,
    topics.reduce((sum, t) => sum + (t.completedLessons || 0), 0)
  );
  const percentOverall =
    totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;

  const handleOpenLesson = (lesson, topic) => {
    setActiveLesson(lesson);
    setActiveTopic(topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromLessonDetail = () => {
    setActiveLesson(null);
    if (onClearInitialLesson) {
      onClearInitialLesson();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteStandardItem = (lessonId, score = 95) => {
    markStandardLessonCompleted(lessonId, score);
    progressApi.completeLesson(lessonId, score).catch(() => {});
    reloadTopics();
  };

  // =========================================================================
  // VIEW LEVEL 3: MÀN HÌNH CHI TIẾT BÀI HỌC HOẶC BÀI TẬP THỬ THÁCH / ÔN TỪ ĐÃ LƯU
  // =========================================================================
  if (activeLesson && activeTopic) {
    if (ACTIVITY_TYPES.has(activeLesson.type)) {
      return (
        <PathActivityRunner
          activity={activeLesson}
          contextTitle={activeTopic.title}
          onBack={handleBackFromLessonDetail}
          onComplete={(score) => handleCompleteStandardItem(activeLesson.id, score)}
        />
      );
    }

    return (
      <LessonDetailView
        lesson={activeLesson}
        topic={activeTopic}
        onBack={handleBackFromLessonDetail}
        onStartPractice={onStartPracticeWord}
        onSelectLesson={(newLesson) => setActiveLesson(newLesson)}
      />
    );
  }

  // =========================================================================
  // VIEW LEVEL 2: CHI TIẾT CHUYÊN ĐỀ (CHU TRÌNH 5 GIAI ĐOẠN KHOA HỌC)
  // =========================================================================
  if (selectedTopicForView) {
    const currentTopic =
      topics.find((t) => t.id === selectedTopicForView.id) || selectedTopicForView;
    const allTopicLessons = currentTopic.lessons || [];

    const grammarLessons = allTopicLessons.filter(
      (l) => l.type === 'grammar' || (l.slug && l.slug.startsWith('ngu-phap-'))
    );
    const vocabLessons = allTopicLessons.filter((l) => l.type === 'word');
    const challengeLessons = allTopicLessons.filter((l) =>
      ['quiz_theory', 'quiz_video', 'challenge_sign'].includes(l.type)
    );
    const savedReviewLessons = allTopicLessons.filter((l) => l.type === 'saved_review');
    const sentenceLessons = allTopicLessons.filter(
      (l) => l.type === 'sentence' || l.sentenceSlug
    );

    const completedTopicCount = allTopicLessons.filter((l) => l.completed).length;
    const totalTopicCount = allTopicLessons.length;
    const topicPercent =
      totalTopicCount > 0 ? Math.round((completedTopicCount / totalTopicCount) * 100) : 0;

    const displayLessons = allTopicLessons.filter((lesson) => {
      const q = topicSearchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        lesson.title.toLowerCase().includes(q) ||
        (lesson.slug && lesson.slug.toLowerCase().includes(q)) ||
        (lesson.word && lesson.word.toLowerCase().includes(q));

      const isGrammar = lesson.type === 'grammar' || lesson.slug?.startsWith('ngu-phap-');
      const isSentence = lesson.type === 'sentence' || lesson.sentenceSlug;
      const isChallenge = ['quiz_theory', 'quiz_video', 'challenge_sign'].includes(lesson.type);
      const isSavedRev = lesson.type === 'saved_review';
      const isWord = lesson.type === 'word' || (!isGrammar && !isSentence && !isChallenge && !isSavedRev);

      const matchType =
        lessonTypeFilter === 'all'
          ? true
          : lessonTypeFilter === 'grammar'
            ? isGrammar
            : lessonTypeFilter === 'word'
              ? isWord
              : lessonTypeFilter === 'challenge'
                ? isChallenge
                : lessonTypeFilter === 'saved_review'
                  ? isSavedRev
                  : isSentence;

      const matchStatus =
        topicFilterStatus === 'all'
          ? true
          : topicFilterStatus === 'completed'
            ? lesson.completed
            : !lesson.completed;

      return matchSearch && matchType && matchStatus;
    });

    const showPhaseHeaders =
      lessonTypeFilter === 'all' &&
      !topicSearchQuery.trim() &&
      topicFilterStatus === 'all';

    let lastRenderedPhase = null;

    return (
      <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
        {/* 1. Nút Điều Hướng Quay Lại Danh Sách 12 Chuyên Đề */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={() => {
              setSelectedTopicForView(null);
              setTopicSearchQuery('');
              setLessonTypeFilter('all');
              setTopicFilterStatus('all');
              if (onClearInitialLesson) onClearInitialLesson();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-pill btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại danh sách 12 chuyên đề</span>
          </button>

          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            Lộ trình chuẩn VSL ›{' '}
            <strong style={{ color: currentTopic.color || '#0284c7' }}>
              {currentTopic.title}
            </strong>
          </div>
        </div>

        {/* 2. Banner Giới Thiệu Chuyên Đề (Tiến độ chuyên đề nằm gọn bên phải) */}
        <PageHeroBanner
          style={{ marginBottom: '1.25rem' }}
          badgeText={currentTopic.level}
          badgeExtra={
            <>
              {grammarLessons.length > 0 && (
                <>
                  <span style={{ opacity: 0.7 }}>•</span>
                  <span>💡 Ngữ pháp</span>
                </>
              )}
              <span style={{ opacity: 0.7 }}>•</span>
              <span>🔤 {vocabLessons.length} Từ vựng</span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span>🎯 {challengeLessons.length} Bài tập thử thách</span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span>🔁 Ôn từ đã lưu</span>
              {sentenceLessons.length > 0 && (
                <>
                  <span style={{ opacity: 0.7 }}>•</span>
                  <span>💬 {sentenceLessons.length} Câu</span>
                </>
              )}
            </>
          }
          title={currentTopic.title}
          subtitle={currentTopic.description}
          rightSlot={
            <div className="page-hero-glass" style={{ minWidth: 210, textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  opacity: 0.85,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                Tiến độ chuyên đề
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'flex-end',
                  gap: '0.45rem',
                  marginTop: '0.2rem',
                }}
              >
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>
                  {completedTopicCount}/{totalTopicCount}
                </span>
                <span style={{ fontSize: '0.84rem', opacity: 0.9 }}>
                  bài ({topicPercent}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 7,
                  backgroundColor: 'rgba(255, 255, 255, 0.24)',
                  borderRadius: 'var(--radius-pill)',
                  overflow: 'hidden',
                  marginTop: '0.45rem',
                }}
              >
                <div
                  style={{
                    width: `${topicPercent}%`,
                    height: '100%',
                    backgroundColor: topicPercent === 100 ? '#4ade80' : '#ffffff',
                    borderRadius: 'var(--radius-pill)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          }
        />

        {/* 3. Thanh Công Cụ Lọc Bài Học, Bài Tập & Tìm Kiếm */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '0.75rem',
            }}
          >
            <div className="subtabs-scroll-row" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', maxWidth: '100%' }}>
              {[
                { id: 'all', label: `Tất cả (${allTopicLessons.length})` },
                { id: 'grammar', label: `💡 Ngữ pháp (${grammarLessons.length})` },
                { id: 'word', label: `🔤 Từ vựng (${vocabLessons.length})` },
                { id: 'challenge', label: `🎯 Bài tập (${challengeLessons.length})` },
                { id: 'saved_review', label: `🔁 Ôn từ lưu (${savedLessons.length})` },
                { id: 'sentence', label: `💬 Luyện câu (${sentenceLessons.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLessonTypeFilter(tab.id)}
                  className={`btn-pill btn-sm ${
                    lessonTypeFilter === tab.id ? 'btn-primary' : 'btn-secondary'
                  }`}
                  style={{
                    padding: '0.35rem 0.82rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                Trạng thái:
              </span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'unlearned', label: 'Chưa học' },
                { id: 'completed', label: 'Đã xong' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setTopicFilterStatus(st.id)}
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    border:
                      topicFilterStatus === st.id
                        ? '1.5px solid #0284c7'
                        : '1px solid #cbd5e1',
                    backgroundColor: topicFilterStatus === st.id ? '#eff6ff' : '#ffffff',
                    color: topicFilterStatus === st.id ? '#0284c7' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder={`Tìm từ vựng, câu hoặc bài tập trong chuyên đề "${currentTopic.title}"...`}
              value={topicSearchQuery}
              onChange={(e) => setTopicSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem 0.5rem 2.25rem',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* 4. Danh Sách Học Phần Của Chuyên Đề (5 Giai đoạn hợp lý) */}
        {displayLessons.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px dashed var(--border-color)',
              color: '#64748b',
            }}
          >
            <Search size={36} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155' }}>
              Không tìm thấy bài học phù hợp
            </div>
            <button
              onClick={() => {
                setTopicSearchQuery('');
                setLessonTypeFilter('all');
                setTopicFilterStatus('all');
              }}
              className="btn-pill btn-secondary btn-sm"
              style={{ marginTop: '0.85rem' }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              paddingBottom: '3.5rem',
            }}
          >
            {displayLessons.map((lesson) => {
              const isGrammar = lesson.type === 'grammar' || lesson.slug?.startsWith('ngu-phap-');
              const isSentence = lesson.type === 'sentence' || lesson.sentenceSlug;
              const isActivity = ACTIVITY_TYPES.has(lesson.type);
              const isCompleted = lesson.completed;

              const phaseNum = lesson.phase || 2;
              const needPhaseHeader = showPhaseHeaders && phaseNum !== lastRenderedPhase;
              if (needPhaseHeader) {
                lastRenderedPhase = phaseNum;
              }
              const phaseInfo = PHASE_METADATA[phaseNum];

              const renderPhaseDivider = needPhaseHeader && phaseInfo ? (
                <div
                  style={{
                    marginTop: phaseNum > 1 ? '0.65rem' : 0,
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: phaseInfo.bg,
                    borderLeft: `4px solid ${phaseInfo.color}`,
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    color: phaseInfo.color,
                  }}
                >
                  {phaseInfo.title}
                </div>
              ) : null;

              // 1. THẺ NGỮ PHÁP
              if (isGrammar) {
                return (
                  <React.Fragment key={lesson.id}>
                    {renderPhaseDivider}
                    <div
                      style={{
                        backgroundColor: '#faf5ff',
                        border: '1.5px solid #c084fc',
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.15rem 1.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 250 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: isCompleted ? '#22c55e' : '#7c3aed',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isCompleted ? <Check size={20} strokeWidth={3} /> : <GraduationCap size={20} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                padding: '0.14rem 0.55rem',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: '#7c3aed',
                                color: '#ffffff',
                              }}
                            >
                              LÝ THUYẾT NGỮ PHÁP
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 700 }}>
                              • {lesson.duration || '5 phút'}
                            </span>
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#4c1d95' }}>
                            {lesson.title}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleCompleteStandardItem(lesson.id, 100);
                          if (onOpenGrammar) {
                            onOpenGrammar(lesson.grammarRuleId || currentTopic.grammarRuleId);
                          }
                        }}
                        className="btn-pill btn-sm"
                        style={{
                          backgroundColor: '#7c3aed',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          padding: '0.48rem 1.05rem',
                          border: 'none',
                          gap: '0.35rem',
                          cursor: 'pointer',
                        }}
                      >
                        <GraduationCap size={15} />
                        <span>Học ngữ pháp</span>
                      </button>
                    </div>
                  </React.Fragment>
                );
              }

              // 2. THẺ BÀI TẬP THỬ THÁCH & ÔN LẠI TỪ VỰNG ĐÃ LƯU
              if (isActivity) {
                const isSavedRev = lesson.type === 'saved_review';
                const isTheoryQuiz = lesson.type === 'quiz_theory';
                const isVideoQuiz = lesson.type === 'quiz_video';

                const accent = isSavedRev
                  ? { bg: '#f0fdfa', border: '#5eead4', color: '#0f766e', btnBg: '#0d9488', label: `ÔN TỪ ĐÃ LƯU (${savedLessons.length} từ)` }
                  : isTheoryQuiz
                    ? { bg: '#eef2ff', border: '#a5b4fc', color: '#3730a3', btnBg: '#4f46e5', label: 'TRẮC NGHIỆM LÝ THUYẾT' }
                    : isVideoQuiz
                      ? { bg: '#f0f9ff', border: '#7dd3fc', color: '#0369a1', btnBg: '#0284c7', label: 'TRẮC NGHIỆM VIDEO MẪU' }
                      : { bg: '#fffbeb', border: '#fcd34d', color: '#b45309', btnBg: '#d97706', label: 'THỬ THÁCH KÝ HIỆU AI' };

                const IconComp = isSavedRev
                  ? BookmarkCheck
                  : isTheoryQuiz
                    ? HelpCircle
                    : isVideoQuiz
                      ? Video
                      : Zap;

                const btnText = isSavedRev
                  ? 'Ôn từ đã lưu'
                  : isTheoryQuiz
                    ? 'Làm trắc nghiệm'
                    : isVideoQuiz
                      ? 'Đoán từ qua Video'
                      : 'Vào thử thách AI';

                return (
                  <React.Fragment key={lesson.id}>
                    {renderPhaseDivider}
                    <div
                      style={{
                        backgroundColor: accent.bg,
                        border: `1.5px solid ${accent.border}`,
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.05rem 1.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 250 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: isCompleted ? '#22c55e' : accent.btnBg,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isCompleted ? <Check size={18} strokeWidth={3} /> : <IconComp size={19} />}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                            <span
                              style={{
                                fontSize: '0.69rem',
                                fontWeight: 800,
                                padding: '0.12rem 0.55rem',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: '#ffffff',
                                color: accent.color,
                                border: `1px solid ${accent.border}`,
                              }}
                            >
                              {accent.label}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                              • {lesson.duration}
                            </span>
                            {isCompleted && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  color: '#15803d',
                                  backgroundColor: '#dcfce7',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: 'var(--radius-pill)',
                                }}
                              >
                                ✓ Đạt {lesson.score}%
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                            {lesson.title}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenLesson(lesson, currentTopic)}
                        className="btn-pill btn-sm"
                        style={{
                          backgroundColor: accent.btnBg,
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          padding: '0.46rem 1.05rem',
                          border: 'none',
                          gap: '0.35rem',
                          cursor: 'pointer',
                        }}
                      >
                        <IconComp size={15} />
                        <span>{isCompleted ? `${btnText} lại` : btnText}</span>
                      </button>
                    </div>
                  </React.Fragment>
                );
              }

              // 3. THẺ CÂU GIAO TIẾP
              if (isSentence) {
                return (
                  <React.Fragment key={lesson.id}>
                    {renderPhaseDivider}
                    <div
                      style={{
                        backgroundColor: '#f0fdf4',
                        border: '1.5px solid #86efac',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 250 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isCompleted ? '#22c55e' : '#16a34a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <MessageSquareQuote size={18} />
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '0.1rem 0.5rem',
                              borderRadius: 'var(--radius-pill)',
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                            }}
                          >
                            LUYỆN CÂU VSL
                          </span>
                          <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#14532d', marginTop: 2 }}>
                            {lesson.title}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleCompleteStandardItem(lesson.id, 95);
                          if (onOpenSentenceDetail && lesson.sentenceSlug) {
                            onOpenSentenceDetail(lesson.sentenceSlug);
                          }
                        }}
                        className="btn-pill btn-sm"
                        style={{
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          padding: '0.42rem 0.95rem',
                          border: 'none',
                          gap: '0.35rem',
                          cursor: 'pointer',
                        }}
                      >
                        <MessageSquareQuote size={14} />
                        <span>Luyện câu VSL</span>
                      </button>
                    </div>
                  </React.Fragment>
                );
              }

              // 4. THẺ TỪ VỰNG KÝ HIỆU CHUẨN (KÈM NÚT LƯU TỪ NHANH)
              const savedNow = isSaved(lesson.id, lesson.title);

              return (
                <React.Fragment key={lesson.id}>
                  {renderPhaseDivider}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: isCompleted ? '1.5px solid #dcfce7' : '1.5px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '0.95rem 1.25rem',
                      boxShadow: 'var(--card-shadow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 220px', minWidth: 'min(220px, 100%)' }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          backgroundColor: isCompleted
                            ? '#22c55e'
                            : currentTopic.bgColor || '#eff6ff',
                          color: isCompleted ? '#ffffff' : currentTopic.color || '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontWeight: 800,
                        }}
                      >
                        {isCompleted ? (
                          <Check size={18} strokeWidth={3} />
                        ) : (
                          <Play size={15} fill="currentColor" />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '1.04rem',
                            fontWeight: 900,
                            color: '#1e293b',
                            lineHeight: 1.3,
                            wordBreak: 'break-word',
                          }}
                        >
                          {lesson.title}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontSize: '0.76rem',
                            color: '#64748b',
                            marginTop: '0.15rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span>{lesson.duration || '2-3 phút'}</span>
                          <span>•</span>
                          <span>{lesson.level || 'Dễ'}</span>
                          {isCompleted && (
                            <>
                              <span>•</span>
                              <span style={{ color: '#16a34a', fontWeight: 800 }}>
                                Đạt {lesson.score}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0, flexWrap: 'wrap' }}>
                      {/* Nút Lưu từ nhanh vào kho Ôn tập */}
                      <button
                        type="button"
                        onClick={() => toggleSave(lesson, currentTopic)}
                        title={savedNow ? 'Bỏ lưu từ này' : 'Lưu từ này để ôn lại'}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          border: savedNow ? '1.5px solid #93c5fd' : '1.5px solid #e2e8f0',
                          backgroundColor: savedNow ? '#eff6ff' : '#ffffff',
                          color: savedNow ? '#0284c7' : '#94a3b8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Bookmark size={15} fill={savedNow ? '#0284c7' : 'none'} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onStartPracticeWord(lesson.word || lesson.title)}
                        className="btn-pill btn-sm btn-secondary"
                        style={{
                          padding: '0.38rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          gap: '0.35rem',
                          borderColor: '#e2e8f0',
                        }}
                      >
                        <Camera size={14} color="#0284c7" />
                        <span>Luyện AI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenLesson(lesson, currentTopic)}
                        className={`btn-pill btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                          padding: '0.38rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          gap: '0.35rem',
                        }}
                      >
                        <BookOpen size={14} />
                        <span>{isCompleted ? 'Ôn lại' : 'Học ngay'}</span>
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW LEVEL 1: DANH SÁCH 12 CHUYÊN ĐỀ LỘ TRÌNH CHUẨN VSL
  // =========================================================================
  return (
    <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      <PageHeroBanner
        style={{ marginBottom: '1.25rem' }}
        badgeIcon={<GraduationCap size={15} />}
        badgeText="LỘ TRÌNH CHUẨN"
        title="Chương Trình Học Ký Hiệu Chuẩn"
        subtitle="12 Chuyên đề • Chu trình 5 bước: Lý thuyết → Từ vựng → Ôn từ đã lưu → Luyện câu → Bài tập & Thử thách AI"
        rightSlot={
          <div className="page-hero-glass" style={{ minWidth: 210, textAlign: 'right' }}>
            <div
              style={{
                fontSize: '0.72rem',
                opacity: 0.85,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Tổng tiến độ
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'flex-end',
                gap: '0.45rem',
                marginTop: '0.2rem',
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                {completedLessons}/{totalLessons}
              </span>
              <span style={{ fontSize: '0.84rem', opacity: 0.9 }}>
                bài ({percentOverall}%)
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 7,
                backgroundColor: 'rgba(255, 255, 255, 0.24)',
                borderRadius: 'var(--radius-pill)',
                overflow: 'hidden',
                marginTop: '0.45rem',
              }}
            >
              <div
                style={{
                  width: `${percentOverall}%`,
                  height: '100%',
                  backgroundColor: '#4ade80',
                  borderRadius: 'var(--radius-pill)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        }
      />

      {/* Bộ Lọc Cấp Độ (Pills) */}
      <div
        className="subtabs-scroll-row"
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        {[
          { id: 'all', label: 'Tất cả 12 Chuyên đề' },
          { id: 'basic', label: 'Level 1: Căn bản' },
          { id: 'elementary', label: 'Level 2: Sơ cấp' },
          { id: 'intermediate', label: 'Level 3: Trung cấp' },
        ].map((lvl) => (
          <button
            key={lvl.id}
            className={`btn-pill btn-sm ${selectedLevel === lvl.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onClick={() => setSelectedLevel(lvl.id)}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Lưới 12 Thẻ Chuyên Đề */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem',
          paddingBottom: '3.5rem',
        }}
      >
        {filteredTopics.map((topic, topicIdx) => {
          const totalInTopic = topic.totalLessons || topic.lessons?.length || 0;
          const completedInTopic = topic.completedLessons || 0;
          const progressPercent =
            totalInTopic > 0 ? Math.round((completedInTopic / totalInTopic) * 100) : 0;

          const wordsInTopic = topic.vocabCount ?? topic.lessons?.filter((l) => l.type === 'word').length ?? 0;
          const challengesInTopic =
            topic.challengeCount ??
            topic.lessons?.filter((l) =>
              ['quiz_theory', 'quiz_video', 'challenge_sign'].includes(l.type)
            ).length ??
            3;
          const sentenceCountInTopic =
            topic.sentenceCount ??
            topic.sampleSentences?.length ??
            topic.lessons?.filter((l) => l.type === 'sentence' || l.sentenceSlug).length ??
            0;

          return (
            <div
              key={topic.id}
              onClick={() => {
                setSelectedTopicForView(topic);
                setTopicSearchQuery('');
                setLessonTypeFilter('all');
                setTopicFilterStatus('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  padding: '1.25rem 1.4rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: topic.bgColor || '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    flexShrink: 0,
                  }}
                >
                  {topic.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: topic.color || '#0284c7' }}>
                      CHƯƠNG {topicIdx + 1}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                      {topic.level}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 900,
                      color: '#1e293b',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {topic.title}
                  </h3>
                </div>
              </div>

              <div
                style={{
                  padding: '1.15rem 1.4rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    flexWrap: 'wrap',
                    fontSize: '0.73rem',
                    fontWeight: 800,
                  }}
                >
                  <span style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.22rem' }}>
                    <BookOpen size={13} />
                    {wordsInTopic} Từ
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.22rem' }}>
                    <Target size={13} />
                    {challengesInTopic} Bài tập
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ color: '#0d9488', display: 'flex', alignItems: 'center', gap: '0.22rem' }}>
                    <RotateCcw size={12} />
                    Ôn từ lưu
                  </span>
                  {sentenceCountInTopic > 0 && (
                    <>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.22rem' }}>
                        <MessageSquareQuote size={13} />
                        {sentenceCountInTopic} Câu
                      </span>
                    </>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span style={{ color: '#64748b' }}>Tiến độ chuyên đề:</span>
                    <span
                      style={{
                        fontWeight: 800,
                        color: progressPercent === 100 ? '#16a34a' : topic.color || '#0284c7',
                      }}
                    >
                      {completedInTopic}/{totalInTopic} bài ({progressPercent}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 6,
                      backgroundColor: '#f1f5f9',
                      borderRadius: 'var(--radius-pill)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        backgroundColor:
                          progressPercent === 100 ? '#22c55e' : topic.color || '#0284c7',
                        borderRadius: 'var(--radius-pill)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem 1.4rem',
                  backgroundColor: '#fafbfc',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: topic.color || '#0284c7',
                }}
              >
                <span>Khám phá chuyên đề ({totalInTopic} học phần)</span>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
