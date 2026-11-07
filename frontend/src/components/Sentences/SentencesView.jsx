import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquareQuote,
  Sparkles,
  BookOpen,
  Search,
  Camera,
  Play,
  Layers,
  ChevronRight,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { VSL_SENTENCES, getSentenceById } from '../../data/sentencesData';
import { dictionaryApi } from '../../services/api';
import SentenceDetailView from './SentenceDetailView';
import SentencePracticeView from './SentencePracticeView';

export default function SentencesView({ onStartPracticeWord, initialSentenceId = null }) {
  const [sentencesList, setSentencesList] = useState(() => {
    return VSL_SENTENCES.map((s, idx) => ({
      id: s.id || s.slug || `sent-${idx + 1}`,
      title: s.title,
      slug: s.slug,
      meaning: s.meaning,
      topic: s.category || s.topic || 'Giao tiếp hàng ngày',
      topicLabel: s.category || s.topicLabel || s.topic || 'Giao tiếp hàng ngày',
      difficulty: s.difficulty || 'Dễ',
      duration: s.duration || '5 phút',
      grammarExplanation: s.explanation || s.grammarExplanation,
      grammarPattern: s.structure || s.grammarPattern || 'SOV (Chủ - Bổ - Động)',
      signOrderText: s.structure || s.signOrderText || 'VSL Chuẩn',
      words: (s.words || []).map((w) => ({
        ...w,
        word: w.name || w.word,
        name: w.name || w.word,
        videoFront: w.videoFront || w.video || `/vsl400_videos/${w.slug}_front.mp4`,
        videoSide: w.videoSide || `/vsl400_videos/${w.slug}_left.mp4`,
      })),
      videoUrl: s.videoUrl || (s.words && s.words[0] ? s.words[0].video : '/vsl400_videos/cam_on_front.mp4'),
    }));
  });

  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSentenceId, setActiveSentenceId] = useState(initialSentenceId);
  const [viewMode, setViewMode] = useState(initialSentenceId ? 'detail' : 'list'); // 'list' | 'detail' | 'practice'

  // Tải danh sách câu VSL từ Backend API NestJS
  useEffect(() => {
    let isMounted = true;
    const fetchSentences = async () => {
      try {
        const data = await dictionaryApi.getSentences();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((s, idx) => ({
            id: s.id || s.slug || `sent-${idx + 1}`,
            title: s.title,
            slug: s.slug,
            meaning: s.meaning,
            topic: s.category || 'Giao tiếp hàng ngày',
            topicLabel: s.category || 'Giao tiếp hàng ngày',
            difficulty: s.difficulty || 'Dễ',
            duration: s.duration || '5 phút',
            grammarExplanation: s.explanation || s.grammarExplanation,
            grammarPattern: s.structure || s.grammarPattern || 'SOV (Chủ - Bổ - Động)',
            signOrderText: s.structure || s.signOrderText || 'VSL Chuẩn',
            words: (s.words || []).map((w) => ({
              ...w,
              word: w.name || w.word,
              name: w.name || w.word,
              videoFront: w.videoFront || w.video || `/vsl400_videos/${w.slug}_front.mp4`,
              videoSide: w.videoSide || `/vsl400_videos/${w.slug}_left.mp4`,
            })),
            videoUrl: s.videoUrl || (s.words && s.words[0] ? s.words[0].video : '/vsl400_videos/cam_on_front.mp4'),
          }));
          setSentencesList(formatted);
        }
      } catch (err) {
        console.warn('Sử dụng bộ câu VSL dự phòng nội bộ:', err);
      }
    };
    fetchSentences();
    return () => {
      isMounted = false;
    };
  }, []);

  // Danh mục chủ đề động từ danh sách câu
  const categories = useMemo(() => {
    const counts = {};
    sentencesList.forEach((s) => {
      const cat = s.topicLabel || s.topic;
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });

    const list = [{ id: 'all', label: 'Tất cả câu', count: sentencesList.length }];
    Object.keys(counts).forEach((cat) => {
      list.push({ id: cat, label: cat, count: counts[cat] });
    });
    return list;
  }, [sentencesList]);

  const activeSentence = useMemo(() => {
    if (!activeSentenceId) return null;
    return (
      sentencesList.find((s) => s.id === activeSentenceId || s.slug === activeSentenceId) ||
      getSentenceById(activeSentenceId)
    );
  }, [activeSentenceId, sentencesList]);

  // Lọc câu theo chủ đề và từ khóa tìm kiếm
  const filteredSentences = useMemo(() => {
    return sentencesList.filter((s) => {
      const matchesTopic = selectedTopic === 'all' || s.topic === selectedTopic || s.topicLabel === selectedTopic;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesTopic;

      const matchesSearch =
        (s.title || '').toLowerCase().includes(q) ||
        (s.meaning || '').toLowerCase().includes(q) ||
        (s.signOrderText || '').toLowerCase().includes(q) ||
        (s.grammarExplanation || '').toLowerCase().includes(q) ||
        (s.words || []).some((w) => (w.name || w.word || '').toLowerCase().includes(q));

      return matchesTopic && matchesSearch;
    });
  }, [sentencesList, selectedTopic, searchQuery]);

  const handleOpenDetail = (sentenceId) => {
    setActiveSentenceId(sentenceId);
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPractice = (sentenceId) => {
    setActiveSentenceId(sentenceId);
    setViewMode('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Màn hình Học chi tiết câu (Step 1)
  if (viewMode === 'detail' && activeSentence) {
    return (
      <SentenceDetailView
        sentence={activeSentence}
        onBack={() => {
          setViewMode('list');
          setActiveSentenceId(null);
        }}
        onStartPractice={() => setViewMode('practice')}
      />
    );
  }

  // 2. Màn hình Luyện tập câu với AI Camera (Step 2)
  if (viewMode === 'practice' && activeSentence) {
    return (
      <SentencePracticeView
        sentence={activeSentence}
        onBack={() => setViewMode('detail')}
        onFinish={() => {
          setViewMode('list');
          setActiveSentenceId(null);
        }}
      />
    );
  }

  // 3. Màn hình Danh sách Câu thường gặp
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* 1. Header Trang */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            <MessageSquareQuote size={20} strokeWidth={2.4} />
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Câu Thường Gặp trong VSL ({sentencesList.length} câu)
          </h1>
        </div>
        <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          Học cách biểu diễn các câu giao tiếp thực tế theo chuẩn cấu trúc Chủ đề – Lời dẫn, trật tự SOV, và lược bỏ hư từ trong Ngôn ngữ Ký hiệu Việt Nam.
        </p>
      </div>

      {/* 2. Bộ lọc Chủ đề & Thanh tìm kiếm */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Ô Tìm kiếm câu */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 460 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm câu theo nội dung, từ vựng hoặc cấu trúc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.4rem',
              fontSize: '0.88rem',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid #cbd5e1',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        {/* Bộ lọc Danh mục Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map((tab) => {
            const isSelected = selectedTopic === tab.id;
            return (
              <button
                key={tab.id}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-pill)',
                  border: isSelected ? '1.5px solid #0284c7' : '1.5px solid #e2e8f0',
                  backgroundColor: isSelected ? '#0284c7' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                onClick={() => setSelectedTopic(tab.id)}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Danh sách các Câu thường gặp */}
      {filteredSentences.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed #cbd5e1',
            color: '#64748b',
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>
            Không tìm thấy câu nào phù hợp với bộ lọc hiện tại.
          </p>
          <button
            className="btn-pill btn-secondary btn-sm"
            style={{ marginTop: '0.75rem' }}
            onClick={() => {
              setSelectedTopic('all');
              setSearchQuery('');
            }}
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredSentences.map((sentence) => (
            <div
              key={sentence.id || sentence.slug}
              className="mini-card"
              style={{
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div>
                {/* Badges đầu card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                    }}
                  >
                    {sentence.topicLabel || sentence.topic}
                  </span>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: sentence.difficulty === 'Nâng cao' ? '#dc2626' : sentence.difficulty === 'Trung bình' ? '#d97706' : '#16a34a',
                    }}
                  >
                    {sentence.difficulty}
                  </span>
                </div>

                {/* Tiêu đề câu tiếng Việt */}
                <h3 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                  "{sentence.title}"
                </h3>

                {/* Ý nghĩa giao tiếp */}
                {sentence.meaning && (
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
                    {sentence.meaning}
                  </p>
                )}

                {/* Dải ký hiệu VSL tuần tự */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.35rem',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>Trật tự:</span>
                  {(sentence.words || []).map((w, idx) => (
                    <React.Fragment key={w.slug || idx}>
                      <span
                        style={{
                          padding: '0.15rem 0.45rem',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0284c7',
                        }}
                      >
                        {w.name || w.word}
                      </span>
                      {idx < (sentence.words || []).length - 1 && (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Mô hình ngữ pháp tóm tắt */}
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45, marginBottom: '1rem' }}>
                  <strong style={{ color: '#1e293b' }}>Ngữ pháp:</strong> {sentence.grammarPattern}
                </div>
              </div>

              {/* Cặp nút hành động: Học ngay & Luyện tập */}
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  className="btn-pill btn-primary"
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#0284c7',
                  }}
                  onClick={() => handleOpenDetail(sentence.id || sentence.slug)}
                >
                  <Play size={14} fill="#ffffff" />
                  <span>Học câu</span>
                </button>

                <button
                  className="btn-pill btn-secondary"
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    borderColor: '#0284c7',
                    color: '#0284c7',
                  }}
                  onClick={() => handleOpenPractice(sentence.id || sentence.slug)}
                >
                  <Camera size={14} />
                  <span>Luyện tập</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
