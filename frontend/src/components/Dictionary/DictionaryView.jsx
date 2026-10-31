import React, { useState, useMemo } from 'react';
import { useSignWords, getAllTopics } from '../../data/wordsStore';
import WordDetailModal from './WordDetailModal';
import { Search, Camera, Video, X, BookOpen, Play } from 'lucide-react';

export default function DictionaryView({ onStartPracticeWord, onOpenLesson }) {
  const { words } = useSignWords();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [activeWordData, setActiveWordData] = useState(null);

  // Lấy đường dẫn thumbnail (frame đầu tiên của video)
  const getThumbnailSrc = (word) => {
    if (word.thumbnail) return word.thumbnail;
    if (word.slug) return `/vsl400_videos/${word.slug}_thumb.jpg`;
    if (word.id === 'w-hello' || (word.word && word.word.toLowerCase() === 'chào')) return '/chao_thumb.jpg';
    return word.videoFront;
  };

  // Điều hướng sang màn hình Bước 1: Học & Quan sát cử chỉ
  const handleLearnWord = (word) => {
    if (!onOpenLesson) return;
    const allTopics = getAllTopics();
    const targetTopic = allTopics.find(t => t.id === word.topic) || allTopics[0];
    
    let matchedLesson = targetTopic?.lessons?.find(
      l => l.title.toLowerCase() === word.word.toLowerCase() || l.id === word.id
    );
    
    if (!matchedLesson) {
      matchedLesson = {
        id: `lesson-${word.id}`,
        wordId: word.id,
        title: word.word,
        description: word.description,
        duration: word.duration || '3 phút',
        level: word.difficulty || 'Dễ',
        completed: false,
        score: 0,
        videoUrl: word.videoFront
      };
    }
    
    onOpenLesson(matchedLesson, targetTopic);
  };

  const filteredWords = useMemo(() => {
    return (words || []).filter(w => {
      if (!w || !w.word) return false;
      const matchSearch = w.word.toLowerCase().includes((searchTerm || '').toLowerCase().trim());
      const matchTopic = selectedTopic === 'all' || w.topic === selectedTopic;
      return matchSearch && matchTopic;
    });
  }, [words, searchTerm, selectedTopic]);

  return (
    <div>
      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm từ vựng ký hiệu..."
          style={{
            width: '100%',
            padding: '0.85rem 2.5rem 0.85rem 2.8rem',
            borderRadius: 'var(--radius-pill)',
            border: '1.5px solid var(--border-color)',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'greeting', label: 'Chào hỏi' },
          { id: 'family', label: 'Gia đình' },
          { id: 'food', label: 'Ẩm thực' },
          { id: 'daily', label: 'Giao tiếp' },
          { id: 'sports', label: 'Thể thao' },
          { id: 'numbers', label: 'Số đếm' },
          { id: 'alphabet', label: 'Chữ cái' }
        ].map(cat => (
          <button
            key={cat.id}
            className={`btn-pill btn-sm ${selectedTopic === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap', padding: '0.4rem 0.9rem' }}
            onClick={() => setSelectedTopic(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Visual Flashcards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '1rem'
      }}>
        {filteredWords.map(word => (
          <div
            key={word.id}
            className="mini-card"
            style={{ padding: '0.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          >
            {/* Thumbnail: Frame đầu tiên của video */}
            <div 
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                aspectRatio: '16/11',
                backgroundColor: '#0f172a',
                marginBottom: '0.65rem'
              }}
              onClick={() => setActiveWordData(word)}
            >
              <img
                src={getThumbnailSrc(word)}
                alt={word.word}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{
                position: 'absolute',
                top: '0.4rem',
                left: '0.4rem',
                backgroundColor: 'rgba(15,23,42,0.7)',
                color: 'white',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-pill)'
              }}>
                {word.dialect}
              </span>
              <span style={{
                position: 'absolute',
                bottom: '0.4rem',
                right: '0.4rem',
                backgroundColor: 'rgba(2, 132, 199, 0.85)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}>
                <Play size={10} fill="white" />
                <span>Xem mẫu</span>
              </span>
            </div>

            {/* Tên từ vựng & Chủ đề (Hàng riêng, full width, không bao giờ bị cắt chữ) */}
            <div style={{ marginTop: '0.2rem', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.35rem' }}>
                <h4 
                  style={{
                    fontSize: '1.12rem',
                    fontWeight: 800,
                    color: '#1e293b',
                    margin: 0,
                    lineHeight: 1.25,
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveWordData(word)}
                  title={word.word}
                >
                  {word.word}
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, flexShrink: 0 }}>
                  {word.topicLabel}
                </span>
              </div>
            </div>

            {/* Actions: 2 nút Luyện và Học ngay chia đều 50/50 ở hàng dưới cùng */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginTop: 'auto' }}>
              {/* Nút Luyện Camera AI */}
              <button
                className="btn-pill btn-secondary btn-sm"
                style={{
                  justifyContent: 'center',
                  padding: '0.45rem 0.35rem',
                  fontSize: '0.82rem',
                  gap: '0.3rem',
                  fontWeight: 700,
                  width: '100%'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartPracticeWord(word.word);
                }}
                title="Luyện camera AI (Bước 2)"
              >
                <Camera size={14} color="#0284c7" />
                <span>Luyện AI</span>
              </button>

              {/* Nút Học Ngay (Chuyển sang Bước 1: Học cử chỉ) */}
              <button
                className="btn-pill btn-primary btn-sm"
                style={{
                  justifyContent: 'center',
                  padding: '0.45rem 0.35rem',
                  fontSize: '0.82rem',
                  gap: '0.3rem',
                  fontWeight: 800,
                  width: '100%'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLearnWord(word);
                }}
                title="Học cử chỉ chi tiết (Bước 1)"
              >
                <BookOpen size={14} />
                <span>Học ngay</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Word Detail Modal */}
      {activeWordData && (
        <WordDetailModal
          wordData={activeWordData}
          onClose={() => setActiveWordData(null)}
          onStartPractice={onStartPracticeWord}
          onOpenLesson={(w) => {
            setActiveWordData(null);
            handleLearnWord(w);
          }}
        />
      )}
    </div>
  );
}
