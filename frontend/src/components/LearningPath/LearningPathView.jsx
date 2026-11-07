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
  MessageSquareQuote,
  ArrowLeft,
  Camera,
  Search,
  Filter,
  CheckCircle2,
  Layers
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
  const [selectedTopicForView, setSelectedTopicForView] = useState(null);
  const [activeLesson, setActiveLesson] = useState(initialLesson || null);
  const [activeTopic, setActiveTopic] = useState(initialTopic || null);
  
  // Bộ lọc bên trong chủ đề đang mở
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [topicFilterStatus, setTopicFilterStatus] = useState('all'); // 'all' | 'unlearned' | 'completed'

  // Khi có bài học truyền từ bên ngoài vào (ví dụ từ Lộ trình cá nhân, Ôn tập hoặc Từ điển)
  useEffect(() => {
    if (initialLesson) {
      setActiveLesson(initialLesson);
      if (initialTopic) {
        setActiveTopic(initialTopic);
        setSelectedTopicForView(initialTopic);
      } else {
        const found = topics.find(
          t => t.id === initialLesson.topicId || 
               (t.lessons && t.lessons.some(l => l.id === initialLesson.id || l.title === initialLesson.title || l.slug === initialLesson.slug))
        );
        if (found) {
          setActiveTopic(found);
          setSelectedTopicForView(found);
        } else {
          const fallbackTopic = {
            id: initialLesson.topicId || 'custom',
            title: initialLesson.topicTitle || 'Chủ đề bài học',
            level: initialLesson.level || 'Căn bản (Level 1)',
            lessons: [initialLesson]
          };
          setActiveTopic(fallbackTopic);
          setSelectedTopicForView(fallbackTopic);
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

  // Xử lý mở xem bài học cụ thể
  const handleOpenLesson = (lesson, topic) => {
    setActiveLesson(lesson);
    setActiveTopic(topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quay lại danh sách từ vựng của chủ đề (Level 2) từ màn hình học chi tiết (Level 3)
  const handleBackFromLessonDetail = () => {
    setActiveLesson(null);
    if (onClearInitialLesson) {
      onClearInitialLesson();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // VIEW LEVEL 3: MÀN HÌNH CHI TIẾT BÀI HỌC (VIDEO CHÍNH DIỆN / NGHIÊNG / HƯỚNG DẪN)
  // =========================================================================
  if (activeLesson && activeTopic) {
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
  // VIEW LEVEL 2: CHI TIẾT CHỦ ĐỀ & DANH SÁCH TỪ VỰNG KÝ HIỆU THUỘC CHỦ ĐỀ ĐÓ
  // =========================================================================
  if (selectedTopicForView) {
    const currentTopic = topics.find(t => t.id === selectedTopicForView.id) || selectedTopicForView;
    const allTopicLessons = currentTopic.lessons || [];
    const completedTopicCount = allTopicLessons.filter(l => l.completed).length;
    const totalTopicCount = allTopicLessons.length;
    const topicPercent = totalTopicCount > 0 ? Math.round((completedTopicCount / totalTopicCount) * 100) : 0;

    // Lọc từ vựng theo ô tìm kiếm và trạng thái
    const displayLessons = allTopicLessons.filter(lesson => {
      const q = topicSearchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        lesson.title.toLowerCase().includes(q) || 
        (lesson.slug && lesson.slug.toLowerCase().includes(q));
      
      const matchStatus = topicFilterStatus === 'all'
        ? true
        : topicFilterStatus === 'completed'
          ? lesson.completed
          : !lesson.completed;

      return matchSearch && matchStatus;
    });

    return (
      <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
        {/* 1. Nút Điều Hướng Quay Lại Danh Sách Chủ Đề */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <button
            onClick={() => {
              setSelectedTopicForView(null);
              setTopicSearchQuery('');
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
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại danh sách 12 chuyên đề</span>
          </button>

          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            Lộ trình chuẩn VSL › <strong style={{ color: currentTopic.color || '#0284c7' }}>{currentTopic.title}</strong>
          </div>
        </div>

        {/* 2. Banner Giới Thiệu Chuyên Đề (Topic Hero Banner) */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.25rem',
          boxShadow: 'var(--card-shadow)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: currentTopic.bgColor || '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                {currentTopic.icon}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: currentTopic.color || '#0284c7',
                    backgroundColor: currentTopic.bgColor || '#eff6ff',
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-pill)'
                  }}>
                    {currentTopic.level}
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                    {totalTopicCount} từ vựng VSL
                  </span>
                </div>

                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                  {currentTopic.title}
                </h1>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.35rem 0 0 0', maxWidth: 650, lineHeight: 1.45 }}>
                  {currentTopic.description}
                </p>
              </div>
            </div>

            {/* Tiến độ hoàn thành của chuyên đề */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              minWidth: 200,
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Tiến độ chuyên đề
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: topicPercent === 100 ? '#16a34a' : currentTopic.color || '#0284c7' }}>
                  {completedTopicCount}/{totalTopicCount}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>từ ({topicPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: 7, backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginTop: '0.4rem' }}>
                <div style={{ width: `${topicPercent}%`, height: '100%', backgroundColor: topicPercent === 100 ? '#22c55e' : (currentTopic.color || '#0284c7'), borderRadius: 'var(--radius-pill)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Khung Ngữ Pháp & Câu Thực Hành VSL Trọng Tâm của Chuyên Đề */}
        {currentTopic.grammarRuleTitle && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #bae6fd',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
            background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    <GraduationCap size={14} />
                    NGỮ PHÁP TRỌNG TÂM CHUYÊN ĐỀ
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0369a1', margin: 0 }}>
                  {currentTopic.grammarRuleTitle}
                </h3>
              </div>

              {currentTopic.grammarRuleId && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenGrammar) {
                      onOpenGrammar(currentTopic.grammarRuleId);
                    }
                  }}
                  className="btn-pill btn-secondary btn-sm"
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.95rem',
                    fontWeight: 800,
                    gap: '0.4rem',
                    color: '#0284c7',
                    borderColor: '#93c5fd',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <GraduationCap size={15} />
                  <span>Xem lý thuyết ngữ pháp đầy đủ</span>
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.75)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe' }}>
              💡 <strong>Quy tắc áp dụng:</strong> {currentTopic.grammarTip}
            </p>

            {/* Dải câu giao tiếp thực hành VSL ứng dụng các từ vựng này */}
            {Array.isArray(currentTopic.sampleSentences) && currentTopic.sampleSentences.length > 0 && (
              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #e0f2fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MessageSquareQuote size={15} color="#0284c7" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                    Câu giao tiếp VSL ứng dụng từ vựng chuyên đề này ({currentTopic.sampleSentences.length} câu mẫu):
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {currentTopic.sampleSentences.map(sent => (
                    <button
                      key={sent.slug}
                      type="button"
                      onClick={() => {
                        if (onOpenSentenceDetail) {
                          onOpenSentenceDetail(sent.slug);
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #93c5fd',
                        color: '#0284c7',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 2px 4px rgba(2, 132, 199, 0.06)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      title={`Học và xem phân tích câu: "${sent.title}"`}
                    >
                      <span>💬 "{sent.title}"</span>
                      <ChevronRight size={13} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Thanh Công Cụ Lọc & Tìm Kiếm Từ Vựng Trong Chuyên Đề */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem'
        }}>
          {/* Ô tìm kiếm từ vựng */}
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={`Tìm từ vựng trong chuyên đề "${currentTopic.title}"...`}
              value={topicSearchQuery}
              onChange={(e) => setTopicSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem 0.5rem 2.25rem',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0284c7'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Filter trạng thái bài học */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginRight: '0.2rem' }}>Lọc:</span>
            {[
              { id: 'all', label: `Tất cả (${allTopicLessons.length})` },
              { id: 'unlearned', label: `Chưa học (${totalTopicCount - completedTopicCount})` },
              { id: 'completed', label: `Đã xong (${completedTopicCount})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTopicFilterStatus(f.id)}
                className={`btn-pill btn-sm ${topicFilterStatus === f.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.3rem 0.8rem',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Lưới Danh Sách Các Từ Vựng Trong Chuyên Đề (Khoa học & Trực quan) */}
        {displayLessons.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px dashed var(--border-color)',
            color: '#64748b'
          }}>
            <Search size={36} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155' }}>
              Không tìm thấy từ vựng phù hợp
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Vui lòng thử đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái.
            </div>
            <button
              onClick={() => { setTopicSearchQuery(''); setTopicFilterStatus('all'); }}
              className="btn-pill btn-secondary btn-sm"
              style={{ marginTop: '0.85rem' }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '0.85rem',
            paddingBottom: '3.5rem'
          }}>
            {displayLessons.map((lesson) => {
              const isCompleted = lesson.completed;

              return (
                <div
                  key={lesson.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: isCompleted ? '1.5px solid #dcfce7' : '1.5px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.95rem 1.15rem',
                    boxShadow: 'var(--card-shadow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                  }}
                >
                  {/* Cột trái: Tên từ vựng & Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#22c55e' : (currentTopic.bgColor || '#eff6ff'),
                      color: isCompleted ? '#ffffff' : (currentTopic.color || '#0284c7'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontWeight: 800
                    }}>
                      {isCompleted ? (
                        <Check size={18} strokeWidth={3} />
                      ) : (
                        <Play size={16} fill="currentColor" />
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '1.02rem',
                        fontWeight: 900,
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {lesson.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
                        <span>{lesson.duration || '2-3 phút'}</span>
                        <span>•</span>
                        <span>{lesson.level || 'Dễ'}</span>
                        {isCompleted && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#16a34a', fontWeight: 800 }}>Đạt {lesson.score}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: 2 NÚT THAO TÁC RÕ RÀNG (LUYỆN AI & HỌC BÀI) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    {/* 1. NÚT LUYỆN CAMERA AI */}
                    <button
                      type="button"
                      onClick={() => onStartPracticeWord(lesson.title)}
                      className="btn-pill btn-sm btn-secondary"
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        gap: '0.3rem',
                        borderColor: '#e2e8f0'
                      }}
                      title={`Mở camera AI để thực hành cử chỉ "${lesson.title}"`}
                    >
                      <Camera size={14} color="#0284c7" />
                      <span>Luyện AI</span>
                    </button>

                    {/* 2. NÚT HỌC NGAY / ÔN LẠI (MỞ TRANG HỌC BÀI CHI TIẾT) */}
                    <button
                      type="button"
                      onClick={() => handleOpenLesson(lesson, currentTopic)}
                      className={`btn-pill btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                      style={{
                        padding: '0.35rem 0.8rem',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        gap: '0.3rem'
                      }}
                      title={`Xem video mẫu bài học "${lesson.title}"`}
                    >
                      <BookOpen size={14} />
                      <span>{isCompleted ? 'Ôn lại' : 'Học ngay'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW LEVEL 1: DANH SÁCH 12 CHUYÊN ĐỀ LỘ TRÌNH CHUẨN VSL (TOPIC OVERVIEW)
  // =========================================================================
  return (
    <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
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
              12 Chuyên đề • 400 Ký hiệu • 8 Bài Ngữ pháp • 100 Câu thực hành
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
            Khung Chương Trình Học Ký Hiệu Chuẩn
          </h2>
        </div>

        {/* Thanh tiến trình ngang gọn gàng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Tổng tiến độ</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#16a34a' }}>
              {completedLessons}/{totalLessons} bài ({percentOverall}%)
            </div>
          </div>
          <div style={{ width: 130, height: 10, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{ width: `${percentOverall}%`, height: '100%', backgroundColor: '#22c55e', borderRadius: 'var(--radius-pill)', transition: 'width 0.3s ease' }} />
          </div>
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
          { id: 'all', label: 'Tất cả 12 Chuyên đề' },
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
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}
            onClick={() => setSelectedLevel(lvl.id)}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* 3. Lưới Các Thẻ Chuyên Đề (Topic Cards Grid - Khoa học & Thu hút) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '1.25rem',
        paddingBottom: '3.5rem'
      }}>
        {filteredTopics.map((topic, topicIdx) => {
          const totalWords = topic.totalLessons || topic.lessons?.length || 0;
          const completedWords = topic.completedLessons || 0;
          const progressPercent = totalWords > 0 ? Math.round((completedWords / totalWords) * 100) : 0;

          return (
            <div
              key={topic.id}
              onClick={() => {
                setSelectedTopicForView(topic);
                setTopicSearchQuery('');
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
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = topic.color || '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {/* Phần đầu thẻ chuyên đề */}
              <div style={{
                padding: '1.25rem 1.4rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: topic.bgColor || '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.65rem',
                  flexShrink: 0
                }}>
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

                  <h3 style={{
                    fontSize: '1.18rem',
                    fontWeight: 900,
                    color: '#1e293b',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {topic.title}
                  </h3>
                </div>
              </div>

              {/* Thân thẻ: Mô tả & Điểm nổi bật Ngữ pháp */}
              <div style={{ padding: '1.15rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 0.85rem 0' }}>
                  {topic.description}
                </p>

                {/* Điểm nhấn ngữ pháp & câu thực hành mẫu */}
                {topic.grammarRuleTitle && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', fontWeight: 800, color: '#0284c7', marginBottom: '0.2rem' }}>
                      <GraduationCap size={13} />
                      <span>{topic.grammarRuleTitle}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MessageSquareQuote size={12} />
                      <span>{topic.sampleSentences?.length || 0} câu giao tiếp VSL ứng dụng</span>
                    </div>
                  </div>
                )}

                {/* Thanh tiến độ bài học của chuyên đề */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#64748b' }}>Tiến độ học:</span>
                    <span style={{ fontWeight: 800, color: progressPercent === 100 ? '#16a34a' : (topic.color || '#0284c7') }}>
                      {completedWords}/{totalWords} từ ({progressPercent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: progressPercent === 100 ? '#22c55e' : (topic.color || '#0284c7'), borderRadius: 'var(--radius-pill)' }} />
                  </div>
                </div>
              </div>

              {/* Nút Khám Phá Chuyên Đề (Footer CTA) */}
              <div style={{
                padding: '0.85rem 1.4rem',
                backgroundColor: '#fafbfc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: topic.color || '#0284c7'
              }}>
                <span>Xem danh sách {totalWords} từ vựng</span>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
