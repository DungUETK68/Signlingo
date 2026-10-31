import React, { useState } from 'react';
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
  Compass
} from 'lucide-react';
import { VSL_SENTENCES, getSentenceById } from '../../data/sentencesData';
import SentenceDetailView from './SentenceDetailView';
import SentencePracticeView from './SentencePracticeView';

export default function SentencesView({ onStartPracticeWord }) {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSentenceId, setActiveSentenceId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail' | 'practice'

  const activeSentence = activeSentenceId ? getSentenceById(activeSentenceId) : null;

  // Lọc câu theo chủ đề và từ khóa tìm kiếm
  const filteredSentences = VSL_SENTENCES.filter((s) => {
    const matchesTopic = selectedTopic === 'all' || s.topic === selectedTopic;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.signOrderText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grammarExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

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
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            color: '#0284c7'
          }}>
            <MessageSquareQuote size={20} strokeWidth={2.4} />
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Câu Thường Gặp trong VSL
          </h1>
        </div>
        <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          Học cách biểu diễn các câu giao tiếp thông dụng hàng ngày theo đúng quy tắc ngữ pháp đặc thù của Ngôn ngữ Ký hiệu Việt Nam (SOV, Chủ đề - Lời dẫn, Rút gọn ký hiệu).
        </p>
      </div>

      {/* 2. Bộ lọc Chủ đề & Thanh tìm kiếm */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        marginBottom: '1.5rem'
      }}>
        {/* Bộ lọc Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tất cả câu' },
            { id: 'greeting', label: 'Chào hỏi & Xã giao' },
            { id: 'food', label: 'Ẩm thực & Bữa ăn' },
            { id: 'family', label: 'Gia đình & Đời sống' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`btn-pill btn-sm ${selectedTopic === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                backgroundColor: selectedTopic === tab.id ? '#0284c7' : '#ffffff',
                color: selectedTopic === tab.id ? '#ffffff' : '#475569',
                borderColor: selectedTopic === tab.id ? '#0284c7' : '#cbd5e1'
              }}
              onClick={() => setSelectedTopic(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ô Tìm kiếm câu */}
        <div style={{
          position: 'relative',
          minWidth: 260,
          flexShrink: 0
        }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm kiếm câu thường gặp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 1rem 0.45rem 2.3rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid #cbd5e1',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </div>

      {/* 4. Danh sách các Câu thường gặp */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredSentences.map((sentence) => (
          <div
            key={sentence.id}
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              {/* Badges đầu card */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1'
                }}>
                  {sentence.topicLabel}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#64748b' }}>
                  <Clock size={12} />
                  <span>{sentence.duration}</span>
                </div>
              </div>

              {/* Tiêu đề câu tiếng Việt */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.65rem 0' }}>
                "{sentence.title}"
              </h3>

              {/* Dải ký hiệu VSL */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.35rem'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>Ký hiệu:</span>
                {sentence.wordSlugs.map((slug, idx) => {
                  const w = getSentenceById(sentence.id)?.words[idx];
                  return (
                    <React.Fragment key={slug}>
                      <span style={{
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0284c7'
                      }}>
                        {w?.word || slug}
                      </span>
                      {idx < sentence.wordSlugs.length - 1 && (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Mô hình ngữ pháp tóm tắt */}
              <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45, marginBottom: '1rem' }}>
                <strong>Ngữ pháp:</strong> {sentence.grammarPattern}
              </div>
            </div>

            {/* Cặp nút hành động: Học ngay & Luyện tập */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
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
                  backgroundColor: '#0284c7'
                }}
                onClick={() => handleOpenDetail(sentence.id)}
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
                  color: '#0284c7'
                }}
                onClick={() => handleOpenPractice(sentence.id)}
              >
                <Camera size={14} />
                <span>Luyện tập</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

