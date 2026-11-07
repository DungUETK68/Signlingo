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
  Layers,
  FileText
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
  
  // Bộ lọc bên trong chuyên đề đang mở
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [lessonTypeFilter, setLessonTypeFilter] = useState('all'); // 'all' | 'grammar' | 'word' | 'sentence'
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
          t => t.id === initialLesson.topicId || 
               (t.lessons && t.lessons.some(l => l.id === initialLesson.id || l.title === initialLesson.title || l.slug === initialLesson.slug))
        );
        if (found) {
          setActiveTopic(found);
          setSelectedTopicForView(found);
        } else {
          const fallbackTopic = {
            id: initialLesson.topicId || 'custom',
            title: initialLesson.topicTitle || 'Chuyên đề bài học',
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

  // Quay lại danh sách bài học của chuyên đề (Level 2) từ màn hình học chi tiết (Level 3)
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
  // VIEW LEVEL 2: CHI TIẾT CHUYÊN ĐỀ & BÀI HỌC NGỮ PHÁP + TỪ VỰNG + CÂU GIAO TIẾP
  // =========================================================================
  if (selectedTopicForView) {
    const currentTopic = topics.find(t => t.id === selectedTopicForView.id) || selectedTopicForView;
    const allTopicLessons = currentTopic.lessons || [];
    
    // Phân loại các bài học trong chuyên đề
    const grammarLessons = allTopicLessons.filter(l => l.type === 'grammar' || (l.slug && l.slug.startsWith('ngu-phap-')));
    const vocabLessons = allTopicLessons.filter(l => l.type === 'word' || (!l.type && !l.sentenceSlug && !l.grammarRuleId && !l.slug?.startsWith('ngu-phap-')));
    const sentenceLessons = allTopicLessons.filter(l => l.type === 'sentence' || l.sentenceSlug);

    const completedTopicCount = allTopicLessons.filter(l => l.completed).length;
    const totalTopicCount = allTopicLessons.length;
    const topicPercent = totalTopicCount > 0 ? Math.round((completedTopicCount / totalTopicCount) * 100) : 0;

    // Lọc bài học theo từ khóa tìm kiếm, phân loại và trạng thái
    const displayLessons = allTopicLessons.filter(lesson => {
      const q = topicSearchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        lesson.title.toLowerCase().includes(q) || 
        (lesson.slug && lesson.slug.toLowerCase().includes(q)) ||
        (lesson.word && lesson.word.toLowerCase().includes(q));
      
      const isGrammar = lesson.type === 'grammar' || lesson.slug?.startsWith('ngu-phap-');
      const isSentence = lesson.type === 'sentence' || lesson.sentenceSlug;
      const isWord = !isGrammar && !isSentence;

      const matchType = lessonTypeFilter === 'all'
        ? true
        : lessonTypeFilter === 'grammar'
          ? isGrammar
          : lessonTypeFilter === 'word'
            ? isWord
            : isSentence;

      const matchStatus = topicFilterStatus === 'all'
        ? true
        : topicFilterStatus === 'completed'
          ? lesson.completed
          : !lesson.completed;

      return matchSearch && matchType && matchStatus;
    });

    return (
      <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
        {/* 1. Nút Điều Hướng Quay Lại Danh Sách 12 Chuyên Đề */}
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
                width: 62,
                height: 62,
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
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
                  <span style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 800 }}>
                    {grammarLessons.length > 0 ? '💡 1 Bài Ngữ pháp' : ''}
                  </span>
                  {grammarLessons.length > 0 && <span style={{ color: '#cbd5e1' }}>•</span>}
                  <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 800 }}>
                    🔤 {vocabLessons.length} Từ vựng VSL
                  </span>
                  {sentenceLessons.length > 0 && <span style={{ color: '#cbd5e1' }}>•</span>}
                  {sentenceLessons.length > 0 && (
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800 }}>
                      💬 {sentenceLessons.length} Câu thực hành
                    </span>
                  )}
                </div>

                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                  {currentTopic.title}
                </h1>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.35rem 0 0 0', maxWidth: 680, lineHeight: 1.45 }}>
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
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>bài ({topicPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: 7, backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginTop: '0.4rem' }}>
                <div style={{ width: `${topicPercent}%`, height: '100%', backgroundColor: topicPercent === 100 ? '#22c55e' : (currentTopic.color || '#0284c7'), borderRadius: 'var(--radius-pill)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Thanh Công Cụ Lọc: Phân loại Bài học & Tìm kiếm */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          {/* Hàng 1: Tabs phân loại cấu trúc bài học khoa học */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `Tất cả bài học (${allTopicLessons.length})` },
                { id: 'grammar', label: `💡 Bài học Ngữ pháp (${grammarLessons.length})`, count: grammarLessons.length },
                { id: 'word', label: `🔤 Từ vựng Ký hiệu (${vocabLessons.length})`, count: vocabLessons.length },
                { id: 'sentence', label: `💬 Câu giao tiếp VSL (${sentenceLessons.length})`, count: sentenceLessons.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setLessonTypeFilter(tab.id)}
                  className={`btn-pill btn-sm ${lessonTypeFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    backgroundColor: lessonTypeFilter === tab.id 
                      ? (tab.id === 'grammar' ? '#7c3aed' : tab.id === 'sentence' ? '#16a34a' : undefined)
                      : undefined,
                    borderColor: lessonTypeFilter === tab.id
                      ? (tab.id === 'grammar' ? '#7c3aed' : tab.id === 'sentence' ? '#16a34a' : undefined)
                      : undefined
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Lọc trạng thái hoàn thành */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Trạng thái:</span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'unlearned', label: 'Chưa học' },
                { id: 'completed', label: 'Đã xong' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setTopicFilterStatus(st.id)}
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    border: topicFilterStatus === st.id ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: topicFilterStatus === st.id ? '#eff6ff' : '#ffffff',
                    color: topicFilterStatus === st.id ? '#0284c7' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hàng 2: Ô tìm kiếm từ vựng hoặc bài học */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={`Tìm bài học, từ vựng hoặc câu trong chuyên đề "${currentTopic.title}"...`}
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
        </div>

        {/* 4. Danh Sách Bài Học Khoa Học Của Chuyên Đề */}
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
              Không tìm thấy bài học phù hợp
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Vui lòng thử đổi từ khóa tìm kiếm hoặc chọn "Tất cả bài học".
            </div>
            <button
              onClick={() => { setTopicSearchQuery(''); setLessonTypeFilter('all'); setTopicFilterStatus('all'); }}
              className="btn-pill btn-secondary btn-sm"
              style={{ marginTop: '0.85rem' }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            paddingBottom: '3.5rem'
          }}>
            {displayLessons.map((lesson, idx) => {
              const isGrammar = lesson.type === 'grammar' || lesson.slug?.startsWith('ngu-phap-');
              const isSentence = lesson.type === 'sentence' || lesson.sentenceSlug;
              const isWord = !isGrammar && !isSentence;
              const isCompleted = lesson.completed;

              // -------------------------------------------------------------
              // 1. THẺ BÀI HỌC LÝ THUYẾT NGỮ PHÁP (NỔI BẬT & TRANG TRỌNG)
              // -------------------------------------------------------------
              if (isGrammar) {
                return (
                  <div
                    key={lesson.id}
                    style={{
                      backgroundColor: '#faf5ff',
                      border: '1.5px solid #c084fc',
                      borderRadius: 'var(--radius-xl)',
                      padding: '1.25rem 1.5rem',
                      boxShadow: '0 4px 14px rgba(124, 58, 237, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: 260 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: '#7c3aed',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <GraduationCap size={22} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.55rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: '#7c3aed',
                            color: '#ffffff'
                          }}>
                            LÝ THUYẾT NGỮ PHÁP VSL
                          </span>
                          <span style={{ color: '#c4b5fd' }}>•</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 700 }}>
                            {lesson.duration || '5 phút'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#4c1d95', margin: 0 }}>
                          {lesson.title}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#581c87', margin: '0.35rem 0 0 0', lineHeight: 1.45, maxWidth: 640 }}>
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenGrammar) {
                          onOpenGrammar(lesson.grammarRuleId || currentTopic.grammarRuleId);
                        }
                      }}
                      className="btn-pill"
                      style={{
                        backgroundColor: '#7c3aed',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        padding: '0.5rem 1.15rem',
                        gap: '0.4rem',
                        border: 'none',
                        boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)',
                        cursor: 'pointer'
                      }}
                    >
                      <GraduationCap size={16} />
                      <span>Học lý thuyết ngữ pháp</span>
                    </button>
                  </div>
                );
              }

              // -------------------------------------------------------------
              // 2. THẺ BÀI THỰC HÀNH CÂU GIAO TIẾP VSL
              // -------------------------------------------------------------
              if (isSentence) {
                return (
                  <div
                    key={lesson.id}
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 260 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <MessageSquareQuote size={18} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.5rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: '#dcfce7',
                            color: '#15803d'
                          }}>
                            LUYỆN CÂU VSL
                          </span>
                        </div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#14532d' }}>
                          {lesson.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '0.1rem' }}>
                          {lesson.description}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
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
                        padding: '0.4rem 0.95rem',
                        border: 'none',
                        gap: '0.35rem',
                        cursor: 'pointer'
                      }}
                    >
                      <MessageSquareQuote size={14} />
                      <span>Luyện câu VSL</span>
                    </button>
                  </div>
                );
              }

              // -------------------------------------------------------------
              // 3. THẺ BÀI HỌC TỪ VỰNG KÝ HIỆU CHUẨN VSL400 (TỪNG TỪ ĐỘC LẬP)
              // -------------------------------------------------------------
              return (
                <div
                  key={lesson.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: isCompleted ? '1.5px solid #dcfce7' : '1.5px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.95rem 1.25rem',
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
                  {/* Cột trái: Tên từ vựng chuẩn & Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 40,
                      height: 40,
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
                        fontSize: '1.08rem',
                        fontWeight: 900,
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {lesson.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>
                        <span>{lesson.duration || '2-3 phút'}</span>
                        <span>•</span>
                        <span>{lesson.level || 'Dễ'}</span>
                        {lesson.dominantHand && (
                          <>
                            <span>•</span>
                            <span>Tay: {lesson.dominantHand === 'left' ? 'Trái' : 'Phải'}</span>
                          </>
                        )}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                    {/* 1. NÚT LUYỆN CAMERA AI */}
                    <button
                      type="button"
                      onClick={() => onStartPracticeWord(lesson.word || lesson.title)}
                      className="btn-pill btn-sm btn-secondary"
                      style={{
                        padding: '0.38rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        gap: '0.35rem',
                        borderColor: '#e2e8f0'
                      }}
                      title={`Bật camera AI luyện tập cử chỉ "${lesson.word || lesson.title}"`}
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
                        padding: '0.38rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        gap: '0.35rem'
                      }}
                      title={`Xem video mẫu bài học "${lesson.word || lesson.title}"`}
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
              12 Chuyên đề • 400 Ký hiệu VSL • 8 Bài học Ngữ pháp • 100 Câu thực hành
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
          const totalInTopic = topic.totalLessons || topic.lessons?.length || 0;
          const completedInTopic = topic.completedLessons || 0;
          const progressPercent = totalInTopic > 0 ? Math.round((completedInTopic / totalInTopic) * 100) : 0;
          
          const wordsInTopic = topic.lessons ? topic.lessons.filter(l => l.type === 'word' || (!l.type && !l.sentenceSlug && !l.grammarRuleId && !l.slug?.startsWith('ngu-phap-'))).length : (topic.vocabCount || 0);
          const hasGrammar = topic.grammarRuleTitle || (topic.lessons && topic.lessons.some(l => l.type === 'grammar' || l.slug?.startsWith('ngu-phap-')));
          const sentenceCountInTopic = topic.sampleSentences?.length || (topic.lessons ? topic.lessons.filter(l => l.type === 'sentence' || l.sentenceSlug).length : 0);

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
                  width: 52,
                  height: 52,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: topic.bgColor || '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
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

              {/* Thân thẻ: Mô tả & Chỉ số cấu trúc sư phạm */}
              <div style={{ padding: '1.15rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 0.85rem 0' }}>
                  {topic.description}
                </p>

                {/* Bộ 3 chỉ số sư phạm: Ngữ pháp + Từ vựng + Câu giao tiếp */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  fontSize: '0.74rem',
                  fontWeight: 800
                }}>
                  {hasGrammar && (
                    <span style={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <GraduationCap size={13} />
                      1 Bài Ngữ pháp
                    </span>
                  )}
                  {hasGrammar && <span style={{ color: '#cbd5e1' }}>•</span>}
                  <span style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <BookOpen size={13} />
                    {wordsInTopic} Từ vựng VSL
                  </span>
                  {sentenceCountInTopic > 0 && <span style={{ color: '#cbd5e1' }}>•</span>}
                  {sentenceCountInTopic > 0 && (
                    <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MessageSquareQuote size={13} />
                      {sentenceCountInTopic} Câu thực hành
                    </span>
                  )}
                </div>

                {/* Thanh tiến độ bài học của chuyên đề */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#64748b' }}>Tiến độ chuyên đề:</span>
                    <span style={{ fontWeight: 800, color: progressPercent === 100 ? '#16a34a' : (topic.color || '#0284c7') }}>
                      {completedInTopic}/{totalInTopic} bài ({progressPercent}%)
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
                <span>Khám phá chuyên đề ({totalInTopic} bài học)</span>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
