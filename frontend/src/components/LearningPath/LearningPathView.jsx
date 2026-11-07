import React, { useState, useEffect } from 'react';
import { useSignWords } from '../../data/wordsStore';
import LessonDetailView from './LessonDetailView';
import { 
  Check, 
  Play, 
  Lock, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  Star,
  ChevronRight,
  BookOpen,
  Award,
  GraduationCap,
  MessageSquareQuote
} from 'lucide-react';

export default function LearningPathView({ 
  onStartPracticeWord, 
  initialLesson = null, 
  initialTopic = null,
  onClearInitialLesson,
  onOpenSentenceDetail,
  onOpenGrammar
}) {
  const { topics } = useSignWords();
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'basic' | 'elementary' | 'intermediate'
  const [activeLesson, setActiveLesson] = useState(initialLesson || null);
  const [activeTopic, setActiveTopic] = useState(initialTopic || null);

  useEffect(() => {
    if (initialLesson) {
      setActiveLesson(initialLesson);
      if (initialTopic) {
        setActiveTopic(initialTopic);
      } else {
        const found = topics.find(
          t => t.id === initialLesson.topicId || 
               (t.lessons && t.lessons.some(l => l.id === initialLesson.id || l.title === initialLesson.title))
        );
        if (found) {
          setActiveTopic(found);
        } else {
          setActiveTopic({
            id: initialLesson.topicId || 'custom',
            title: initialLesson.topicTitle || 'Chủ đề bài học',
            level: initialLesson.level || 'Căn bản (Level 1)',
            lessons: [initialLesson]
          });
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialLesson, initialTopic, topics]);

  const filteredTopics = selectedLevel === 'all' 
    ? topics 
    : topics.filter(t => t.levelCode === selectedLevel);

  // Tính toán chính xác tổng số bài học và số bài đã hoàn thành
  const totalLessons = topics.reduce((sum, t) => sum + (t.totalLessons || t.lessons?.length || 0), 0);
  const completedLessons = Math.min(
    totalLessons,
    topics.reduce((sum, t) => sum + (t.completedLessons || 0), 0)
  );
  const percentOverall = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;

  const handleOpenLesson = (lesson, topic) => {
    setActiveLesson(lesson);
    setActiveTopic(topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPath = () => {
    setActiveLesson(null);
    setActiveTopic(null);
    if (onClearInitialLesson) {
      onClearInitialLesson();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // NẾU ĐANG CHỌN 1 BÀI HỌC: HIỂN THỊ NỘI DUNG BÀI HỌC TRỰC TIẾP Ở GIỮA MÀN HÌNH CHÍNH (KHÔNG DÙNG POPUP)
  if (activeLesson && activeTopic) {
    return (
      <LessonDetailView
        lesson={activeLesson}
        topic={activeTopic}
        onBack={handleBackToPath}
        onStartPractice={onStartPracticeWord}
        onSelectLesson={(newLesson) => setActiveLesson(newLesson)}
      />
    );
  }

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      {/* 1. Header Tổng Quan Tiến Độ - Gọn gàng & Hiện đại */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
              LỘ TRÌNH CHUẨN VSL
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Đã hoàn thành <strong>{completedLessons}/{totalLessons}</strong> bài ({percentOverall}%)
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
            Chặng Đường Học Ký Hiệu
          </h2>
        </div>

        {/* Thanh tiến trình tròn / ngang gọn gàng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 140, height: 10, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{ width: `${percentOverall}%`, height: '100%', backgroundColor: '#22c55e', borderRadius: 'var(--radius-pill)' }} />
          </div>
          <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#16a34a' }}>
            {percentOverall}%
          </span>
        </div>
      </div>

      {/* 2. Bộ Lọc Cấp Độ (Pills) */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {[
          { id: 'all', label: 'Tất cả các chặng' },
          { id: 'basic', label: 'Level 1: Căn bản' },
          { id: 'elementary', label: 'Level 2: Sơ cấp' },
          { id: 'intermediate', label: 'Level 3: Trung cấp' }
        ].map(lvl => (
          <button
            key={lvl.id}
            className={`btn-pill btn-sm ${selectedLevel === lvl.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setSelectedLevel(lvl.id)}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* 3. Danh Sách Các Chương Bài Học (Gọn gàng & Khoa học) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
        {filteredTopics.map((topic, topicIdx) => {
          const progressPercent = Math.round((topic.completedLessons / topic.totalLessons) * 100);

          return (
            <div
              key={topic.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              {/* Header của Chương */}
              <div style={{
                padding: '1.1rem 1.4rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fafbfc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: topic.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem'
                  }}>
                    {topic.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: topic.color }}>
                        CHƯƠNG {topicIdx + 1}
                      </span>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        {topic.level}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                      {topic.title}
                    </h3>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: topic.color }}>
                    {topic.completedLessons}/{topic.totalLessons} bài
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {progressPercent}% hoàn tất
                  </div>
                </div>
              </div>

              {/* Banner Ngữ pháp & Câu thực hành VSL tích hợp */}
              {topic.grammarRuleTitle && (
                <div style={{
                  margin: '0.85rem 1.25rem 0 1.25rem',
                  padding: '0.9rem 1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.15rem 0.55rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: '#eff6ff',
                        color: '#0284c7',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        <GraduationCap size={13} />
                        NGỮ PHÁP TRỌNG TÂM
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                        {topic.grammarRuleTitle}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                      {topic.grammarTip}
                    </p>

                    {/* Dải câu thực hành mẫu */}
                    {Array.isArray(topic.sampleSentences) && topic.sampleSentences.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b' }}>Câu thực hành:</span>
                        {topic.sampleSentences.map(sent => (
                          <button
                            key={sent.slug}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenSentenceDetail) {
                                onOpenSentenceDetail(sent.slug);
                              }
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.15rem 0.55rem',
                              borderRadius: 'var(--radius-pill)',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#0284c7',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                              e.currentTarget.style.borderColor = '#93c5fd';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            title={`Học câu thực hành: "${sent.title}"`}
                          >
                            <MessageSquareQuote size={12} />
                            <span>"{sent.title}"</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nút Xem lý thuyết ngữ pháp */}
                  {topic.grammarRuleId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenGrammar) {
                          onOpenGrammar(topic.grammarRuleId);
                        }
                      }}
                      className="btn-pill btn-secondary btn-sm"
                      style={{
                        fontSize: '0.78rem',
                        padding: '0.35rem 0.75rem',
                        fontWeight: 800,
                        gap: '0.35rem',
                        color: '#0284c7',
                        borderColor: '#bae6fd',
                        backgroundColor: '#ffffff',
                        flexShrink: 0
                      }}
                    >
                      <GraduationCap size={14} />
                      <span>Xem lý thuyết</span>
                    </button>
                  )}
                </div>
              )}

              {/* Danh sách các bài học con - Xếp thành dạng lưới 2 cột gọn gàng, đẹp mắt */}
              <div style={{
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '0.85rem'
              }}>
                {topic.lessons.map((lesson, idx) => {
                  const isCompleted = lesson.completed;
                  const isCurrent = !lesson.completed && idx === topic.lessons.findIndex(l => !l.completed);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleOpenLesson(lesson, topic)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: isCurrent 
                          ? '2px solid #0284c7' 
                          : isCompleted 
                            ? '1.5px solid #dcfce7' 
                            : '1.5px solid #f1f5f9',
                        backgroundColor: isCurrent 
                          ? '#f0f9ff' 
                          : isCompleted 
                            ? '#fcfdfd' 
                            : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Cột trái: Trạng thái & Tên bài */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Vòng tròn icon trạng thái */}
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: isCompleted 
                            ? '#22c55e' 
                            : isCurrent 
                              ? '#0284c7' 
                              : '#e0f2fe',
                          color: isCompleted || isCurrent ? '#ffffff' : '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}>
                          {isCompleted ? (
                            <Check size={18} strokeWidth={3} />
                          ) : (
                            <Play size={16} fill={isCurrent ? 'white' : 'currentColor'} />
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b' }}>
                            {lesson.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {lesson.duration} • {lesson.level}
                          </div>
                        </div>
                      </div>

                      {/* Cột phải: Điểm / Nút thao tác */}
                      <div>
                        {isCompleted ? (
                          <div style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Star size={12} fill="#15803d" />
                            <span>{lesson.score}%</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-pill btn-sm btn-secondary"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.65rem',
                              color: isCurrent ? '#0284c7' : '#64748b'
                            }}
                          >
                            <span>Học bài</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
