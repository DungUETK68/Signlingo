import React, { useState, useMemo } from 'react';
import { useSignWords } from '../../data/wordsStore';
import WordDetailModal from './WordDetailModal';
import { Search, Camera, Video, X } from 'lucide-react';

export default function DictionaryView({ onStartPracticeWord }) {
  const { words } = useSignWords();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [activeWordData, setActiveWordData] = useState(null);

  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase());
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {filteredWords.map(word => (
          <div
            key={word.id}
            className="mini-card"
            style={{ padding: '0.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          >
            {/* Thumbnail */}
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
              <img src={word.videoFront} alt={word.word} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            </div>

            {/* Word info & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <div>
                <h4 
                  style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}
                  onClick={() => setActiveWordData(word)}
                >
                  {word.word}
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{word.topicLabel}</span>
              </div>

              <button
                className="btn-pill btn-primary btn-sm"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartPracticeWord(word.word);
                }}
                title="Luyện camera ngay"
              >
                <Camera size={14} />
                <span>Luyện</span>
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
        />
      )}
    </div>
  );
}
