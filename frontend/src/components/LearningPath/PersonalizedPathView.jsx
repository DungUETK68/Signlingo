import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Play,
  Camera,
  Clock,
  Sliders,
  Check,
  AlertTriangle,
  Zap,
  ArrowRight,
  MessageSquareQuote,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  HelpCircle,
  Video,
} from 'lucide-react';
import { usePersonalizedPath } from '../../data/personalizedStore';
import { useSavedLessons } from '../../data/wordsStore';
import { useSpacedRepetition } from '../../data/srsStore';
import PathActivityRunner from './PathActivityRunner';

const ACTIVITY_TYPES = new Set(['quiz_theory', 'quiz_video', 'challenge_sign', 'saved_review']);

export default function PersonalizedPathView({
  onStartPracticeWord,
  onOpenSurvey,
  onOpenLesson,
  onOpenSentenceDetail,
  onOpenGrammar,
}) {
  const {
    profile,
    capability,
    path,
    recalculate,
    completeLesson,
  } = usePersonalizedPath();

  const { savedLessons, isSaved, toggleSave } = useSavedLessons();
  const { stats: srsStats } = useSpacedRepetition(savedLessons);

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateMessage, setRecalculateMessage] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null); // { lesson, stageTitle }

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setRecalculateMessage(null);
    setTimeout(() => {
      recalculate();
      setIsRecalculating(false);
      setRecalculateMessage('✅ AI đã phân tích lại lịch sử thực hành và tối ưu hóa lộ trình cá nhân thành công!');
      setTimeout(() => setRecalculateMessage(null), 5000);
    }, 700);
  };

  // Màn hình thực thi trực tiếp Bài tập thử thách hoặc Ôn lại từ đã lưu
  if (activeActivity) {
    return (
      <PathActivityRunner
        activity={activeActivity.lesson}
        contextTitle={activeActivity.stageTitle}
        onBack={() => setActiveActivity(null)}
        onComplete={(score) => {
          if (activeActivity.lesson?.id && !activeActivity.isGlobalSavedReview) {
            completeLesson(activeActivity.lesson.id, score);
          }
        }}
      />
    );
  }

  // Tính tổng tiến độ lộ trình cá nhân
  const allLessons = path.flatMap((s) => s.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.completed).length;

  return (
    <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. Header Khảo Sát & Phân Tích Thích Ứng AI */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 800,
              }}
            >
              <Sparkles size={16} />
              <span>LỘ TRÌNH CÁ NHÂN HÓA</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="btn-pill"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#0284c7',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '0.4rem 0.9rem',
                  gap: '0.4rem',
                  border: 'none',
                  cursor: isRecalculating ? 'not-allowed' : 'pointer',
                }}
              >
                <RotateCcw size={15} className={isRecalculating ? 'animate-spin' : ''} />
                <span>{isRecalculating ? 'Đang phân tích...' : 'Tối ưu hóa lại'}</span>
              </button>

              <button
                onClick={onOpenSurvey}
                className="btn-pill"
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.6)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '0.4rem 0.85rem',
                  gap: '0.4rem',
                  cursor: 'pointer',
                }}
              >
                <Sliders size={15} />
                <span>Khảo sát lại</span>
              </button>
            </div>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Lộ Trình Của Bạn: {profile.name}
          </h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.92, maxWidth: 680, lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Chương trình học xoắn ốc kết hợp từ vựng, ôn lại từ đã lưu, ngữ pháp, luyện câu và các bài tập thử thách thích ứng theo tốc độ thực tế.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                Trình độ ban đầu
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 900, marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
                {profile.learningLevel === 'beginner' && '🐣 Level 1: Mới học'}
                {profile.learningLevel === 'elementary' && '🌿 Level 2: Cơ bản'}
                {profile.learningLevel === 'intermediate' && '🚀 Level 3: Nâng cao'}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                Điểm AI thực hành TB
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 900, marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
                {capability.avgScore}% ({completedLessons}/{totalLessons} bài)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trạm Ôn Tập Nhanh Từ Vựng Đã Lưu ngay đầu Lộ trình cá nhân */}
      <div
        style={{
          backgroundColor: '#f0fdfa',
          border: '1.5px solid #5eead4',
          borderRadius: 'var(--radius-xl)',
          padding: '1rem 1.35rem',
          marginBottom: '1.35rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, minWidth: 240 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookmarkCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#134e4a' }}>
              Ôn lại từ vựng đã lưu ({savedLessons.length} từ đã lưu
              {srsStats.dueCount > 0 ? ` • ${srsStats.dueCount} từ cần ôn ngay` : ''})
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-pill btn-sm"
          onClick={() =>
            setActiveActivity({
              isGlobalSavedReview: true,
              stageTitle: 'Lộ trình cá nhân',
              lesson: {
                id: 'global-saved-review',
                type: 'saved_review',
                title: 'Ôn lại Từ vựng Đã lưu & Củng cố Trí nhớ',
                targetWords: allLessons.filter((l) => l.type === 'word'),
              },
            })
          }
          style={{
            backgroundColor: '#0d9488',
            color: '#ffffff',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.82rem',
            padding: '0.5rem 1.1rem',
            gap: '0.4rem',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={15} />
          <span>Ôn từ đã lưu ngay</span>
        </button>
      </div>

      {/* Thông báo cập nhật lộ trình */}
      {recalculateMessage && (
        <div
          style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {recalculateMessage}
        </div>
      )}

      {/* 2. Danh Sách Các Chặng Học Cá Nhân Hóa (Không hiển thị chữ mô tả xám phụ dưới chặng và bài học) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {path.map((stage) => (
          <div
            key={stage.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Header Chặng */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <div
                  style={{
                    fontSize: '1.6rem',
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: stage.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {stage.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    {stage.title}
                  </h3>
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: 120 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: stage.color }}>
                  {stage.progress}% Hoàn thành
                </span>
                <div
                  style={{
                    width: 120,
                    height: 8,
                    backgroundColor: '#f1f5f9',
                    borderRadius: 'var(--radius-pill)',
                    overflow: 'hidden',
                    marginTop: '0.3rem',
                  }}
                >
                  <div
                    style={{
                      width: `${stage.progress}%`,
                      height: '100%',
                      backgroundColor: stage.color,
                      borderRadius: 'var(--radius-pill)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Danh sách các học phần trong chặng */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stage.lessons.map((lesson) => {
                const isBooster = lesson.isAiBooster;
                const isActivity = ACTIVITY_TYPES.has(lesson.type);
                const isSavedRev = lesson.type === 'saved_review';
                const isTheoryQuiz = lesson.type === 'quiz_theory';
                const isVideoQuiz = lesson.type === 'quiz_video';
                const isSignChallenge = lesson.type === 'challenge_sign';

                const borderStyle = isBooster
                  ? '1.5px solid #fdba74'
                  : isSavedRev
                    ? '1.5px solid #5eead4'
                    : isTheoryQuiz
                      ? '1.5px solid #c7d2fe'
                      : isVideoQuiz
                        ? '1.5px solid #bae6fd'
                        : isSignChallenge
                          ? '1.5px solid #fcd34d'
                          : lesson.type === 'sentence'
                            ? '1.5px solid #86efac'
                            : lesson.type === 'grammar'
                              ? '1.5px solid #e9d5ff'
                              : '1px solid #e2e8f0';

                const bgStyle = isBooster
                  ? '#fffbeb'
                  : isSavedRev
                    ? '#f0fdfa'
                    : isTheoryQuiz
                      ? '#eef2ff'
                      : isVideoQuiz
                        ? '#f0f9ff'
                        : isSignChallenge
                          ? '#fffbeb'
                          : lesson.type === 'sentence'
                            ? '#f0fdf4'
                            : lesson.type === 'grammar'
                              ? '#faf5ff'
                              : lesson.completed
                                ? '#f8fafc'
                                : '#ffffff';

                const circleBg = lesson.completed
                  ? '#22c55e'
                  : isBooster
                    ? '#f97316'
                    : isSavedRev
                      ? '#0d9488'
                      : isTheoryQuiz
                        ? '#4f46e5'
                        : isVideoQuiz
                          ? '#0284c7'
                          : isSignChallenge
                            ? '#d97706'
                            : lesson.type === 'sentence'
                              ? '#16a34a'
                              : lesson.type === 'grammar'
                                ? '#7c3aed'
                                : '#e0f2fe';

                const circleTextWhite =
                  lesson.completed ||
                  isBooster ||
                  isActivity ||
                  lesson.type === 'sentence' ||
                  lesson.type === 'grammar';

                const savedWordNow =
                  lesson.type === 'word' &&
                  isSaved(lesson.id, lesson.word || lesson.title);

                return (
                  <div
                    key={lesson.id}
                    style={{
                      border: borderStyle,
                      backgroundColor: bgStyle,
                      borderRadius: 'var(--radius-lg)',
                      padding: '0.95rem 1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.85rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Cột 1: Thông tin bài học */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 250 }}>
                      <div
                        onClick={() => completeLesson(lesson.id, 95)}
                        title="Bấm để đánh dấu hoàn thành"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: circleBg,
                          color: circleTextWhite ? '#ffffff' : '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          cursor: 'pointer',
                        }}
                      >
                        {lesson.completed ? (
                          <Check size={18} strokeWidth={3} />
                        ) : isBooster ? (
                          <AlertTriangle size={17} />
                        ) : isSavedRev ? (
                          <BookmarkCheck size={17} />
                        ) : isTheoryQuiz ? (
                          <HelpCircle size={17} />
                        ) : isVideoQuiz ? (
                          <Video size={17} />
                        ) : isSignChallenge ? (
                          <Zap size={17} />
                        ) : lesson.type === 'sentence' ? (
                          <MessageSquareQuote size={17} />
                        ) : lesson.type === 'grammar' ? (
                          <GraduationCap size={17} />
                        ) : (
                          <Play size={15} fill="currentColor" />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e293b' }}>
                            {lesson.title}
                          </span>

                          {lesson.badge && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.14rem 0.5rem',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: isBooster
                                  ? '#ea580c'
                                  : isSavedRev
                                    ? '#0d9488'
                                    : isTheoryQuiz
                                      ? '#4f46e5'
                                      : isVideoQuiz
                                        ? '#0284c7'
                                        : isSignChallenge
                                          ? '#d97706'
                                          : lesson.type === 'sentence'
                                            ? '#16a34a'
                                            : lesson.type === 'grammar'
                                              ? '#7c3aed'
                                              : lesson.highlight
                                                ? '#0284c7'
                                                : '#e0f2fe',
                                color:
                                  isBooster ||
                                  isActivity ||
                                  lesson.highlight ||
                                  lesson.type === 'sentence' ||
                                  lesson.type === 'grammar'
                                    ? '#ffffff'
                                    : '#0369a1',
                              }}
                            >
                              {lesson.badge}
                            </span>
                          )}

                          {lesson.completed && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#16a34a',
                                backgroundColor: '#dcfce7',
                                padding: '0.14rem 0.45rem',
                                borderRadius: 'var(--radius-pill)',
                              }}
                            >
                              ✓ Đạt {lesson.score}%
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.3rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} />
                            {lesson.duration}
                          </span>
                          <span>•</span>
                          <span>
                            Phân loại: <strong>{lesson.level}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cột 2: Nút thao tác linh hoạt theo loại học phần */}
                    <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* 1. Các bài tập thử thách & Ôn từ đã lưu */}
                      {isActivity && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveActivity({
                              lesson,
                              stageTitle: stage.title,
                            })
                          }
                          className="btn-pill btn-sm"
                          style={{
                            backgroundColor: circleBg === '#22c55e' ? '#0284c7' : circleBg,
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.8rem',
                            padding: '0.45rem 1rem',
                            fontWeight: 800,
                            gap: '0.38rem',
                            cursor: 'pointer',
                          }}
                        >
                          {isSavedRev ? (
                            <>
                              <RotateCcw size={14} />
                              <span>Ôn từ đã lưu</span>
                            </>
                          ) : isTheoryQuiz ? (
                            <>
                              <HelpCircle size={14} />
                              <span>Làm trắc nghiệm</span>
                            </>
                          ) : isVideoQuiz ? (
                            <>
                              <Video size={14} />
                              <span>Đoán từ Video</span>
                            </>
                          ) : (
                            <>
                              <Zap size={14} />
                              <span>Thử thách AI</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* 2. Bài luyện câu VSL */}
                      {lesson.type === 'sentence' && (
                        <button
                          onClick={() => {
                            completeLesson(lesson.id, 95);
                            if (onOpenSentenceDetail && lesson.sentenceSlug) {
                              onOpenSentenceDetail(lesson.sentenceSlug);
                            }
                          }}
                          className="btn-pill btn-sm"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.45rem 1rem',
                            fontWeight: 800,
                            gap: '0.38rem',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <MessageSquareQuote size={14} />
                          <span>Luyện câu VSL</span>
                        </button>
                      )}

                      {/* 3. Điểm ngữ pháp VSL */}
                      {lesson.type === 'grammar' && (
                        <button
                          onClick={() => {
                            completeLesson(lesson.id, 100);
                            if (onOpenGrammar) {
                              onOpenGrammar(lesson.grammarRuleId);
                            }
                          }}
                          className="btn-pill btn-secondary btn-sm"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.45rem 1rem',
                            fontWeight: 800,
                            gap: '0.38rem',
                            borderColor: '#7c3aed',
                            color: '#7c3aed',
                            backgroundColor: '#faf5ff',
                          }}
                        >
                          <GraduationCap size={14} />
                          <span>Xem ngữ pháp</span>
                        </button>
                      )}

                      {/* 4. Bài học từ vựng chuẩn (kèm nút Lưu từ nhanh) */}
                      {!isActivity && lesson.type !== 'sentence' && lesson.type !== 'grammar' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              toggleSave(
                                {
                                  ...lesson,
                                  title: lesson.word || lesson.title,
                                  topicId: stage.topicId,
                                  topicTitle: stage.title,
                                },
                                { id: stage.topicId, title: stage.title }
                              )
                            }
                            title={savedWordNow ? 'Bỏ lưu từ này' : 'Lưu từ này để ôn lại'}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              border: savedWordNow ? '1.5px solid #93c5fd' : '1.5px solid #e2e8f0',
                              backgroundColor: savedWordNow ? '#eff6ff' : '#ffffff',
                              color: savedWordNow ? '#0284c7' : '#94a3b8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Bookmark size={15} fill={savedWordNow ? '#0284c7' : 'none'} />
                          </button>

                          {(lesson.word || lesson.title) && (
                            <button
                              onClick={() => onStartPracticeWord(lesson.word || lesson.title)}
                              className="btn-pill btn-secondary btn-sm"
                              style={{
                                fontSize: '0.78rem',
                                padding: '0.4rem 0.82rem',
                                gap: '0.35rem',
                                fontWeight: 700,
                              }}
                            >
                              <Camera size={14} color="#0284c7" />
                              <span>Luyện AI</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (onOpenLesson) {
                                const lessonForDetail = {
                                  ...lesson,
                                  id: lesson.id || (lesson.slug ? `vsl-${lesson.slug}` : undefined),
                                  wordId: lesson.wordId || (lesson.slug ? `vsl-${lesson.slug}` : undefined),
                                  word: lesson.word || lesson.title,
                                  title: lesson.word || lesson.title,
                                  slug: lesson.slug,
                                  videoUrl: lesson.videoUrl,
                                  videoSideUrl: lesson.videoSideUrl,
                                  description: lesson.desc || lesson.description,
                                };
                                onOpenLesson(lessonForDetail, stage);
                              }
                            }}
                            className={`btn-pill btn-sm ${lesson.completed ? 'btn-secondary' : 'btn-primary'}`}
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.4rem 0.92rem',
                              fontWeight: 800,
                              gap: '0.35rem',
                            }}
                          >
                            <span>{lesson.completed ? 'Ôn lại' : 'Học ngay'}</span>
                            <ArrowRight size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
