import React, { useState, useMemo, useEffect } from 'react';
import { useSignWords, getAllTopics } from '../../data/wordsStore';
import WordDetailModal from './WordDetailModal';
import { Search, Camera, Video, X, BookOpen, Play, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 30;

export default function DictionaryView({ onStartPracticeWord, onOpenLesson }) {
  const { words } = useSignWords();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [activeWordData, setActiveWordData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy đường dẫn thumbnail (frame đầu tiên của video)
  const getThumbnailSrc = (word) => {
    if (word.thumbnail) return word.thumbnail;
    if (word.slug) return `/vsl400_videos/${word.slug}_thumb.jpg`;
    return word.videoFront || word.videoUrl || '/vsl400_videos/cam_on_thumb.jpg';
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
        videoUrl: word.videoFront || word.videoUrl
      };
    }
    
    onOpenLesson(matchedLesson, targetTopic);
  };

  // Lọc từ vựng theo từ khóa và chủ đề
  const filteredWords = useMemo(() => {
    return (words || []).filter(w => {
      if (!w || !w.word) return false;
      const matchSearch = w.word.toLowerCase().includes((searchTerm || '').toLowerCase().trim());
      const matchTopic = selectedTopic === 'all' || w.topic === selectedTopic;
      return matchSearch && matchTopic;
    });
  }, [words, searchTerm, selectedTopic]);

  // Reset về trang 1 khi tìm kiếm hoặc đổi chủ đề
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTopic]);

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  
  // Đảm bảo currentPage hợp lệ
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedWords = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredWords.slice(start, start + PAGE_SIZE);
  }, [filteredWords, safeCurrentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tạo danh sách các số trang hiển thị thông minh
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  };

  const startWordIndex = filteredWords.length > 0 ? (safeCurrentPage - 1) * PAGE_SIZE + 1 : 0;
  const endWordIndex = Math.min(safeCurrentPage * PAGE_SIZE, filteredWords.length);

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
          { id: 'all', label: `Tất cả (${words.length})` },
          { id: 'family', label: 'Gia đình' },
          { id: 'greeting', label: 'Chào hỏi' },
          { id: 'food', label: 'Ẩm thực' },
          { id: 'health', label: 'Y tế' },
          { id: 'education', label: 'Giáo dục & Nghề' },
          { id: 'sports', label: 'Thể thao' },
          { id: 'nature', label: 'Thiên nhiên' },
          { id: 'travel', label: 'Địa điểm & Xe' },
          { id: 'time', label: 'Thời gian' },
          { id: 'daily', label: 'Đời sống' },
          { id: 'emotions', label: 'Cảm xúc' },
          { id: 'actions', label: 'Hành động' }
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

      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        padding: '0 0.2rem',
        fontSize: '0.85rem',
        color: '#64748b'
      }}>
        <span>
          {filteredWords.length > 0 ? (
            <>
              Hiển thị <strong>{startWordIndex} - {endWordIndex}</strong> trong tổng số <strong>{filteredWords.length}</strong> từ vựng
            </>
          ) : (
            'Không tìm thấy từ vựng nào phù hợp.'
          )}
        </span>
        {totalPages > 1 && (
          <span style={{ fontWeight: 600, color: '#0284c7' }}>
            Trang {safeCurrentPage} / {totalPages}
          </span>
        )}
      </div>

      {/* Visual Flashcards Grid (30 words per page) */}
      {paginatedWords.length > 0 ? (
        <div className="dictionary-grid">
          {paginatedWords.map(word => (
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
                  {word.dialect || 'Toàn quốc'}
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

              {/* Tên từ vựng & Chủ đề */}
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
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px dashed var(--border-color)',
          color: '#64748b'
        }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Không tìm thấy từ vựng nào</p>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang chủ đề "Tất cả".</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '2rem',
          padding: '1.25rem 0',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Nút Trang Trước */}
            <button
              className="btn-pill btn-secondary btn-sm"
              disabled={safeCurrentPage === 1}
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              style={{
                opacity: safeCurrentPage === 1 ? 0.4 : 1,
                cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                padding: '0.4rem 0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 700
              }}
            >
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>

            {/* Các nút số trang */}
            {getPageNumbers().map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`dots-${idx}`} style={{ padding: '0.3rem 0.4rem', color: '#94a3b8', fontWeight: 700 }}>
                    ...
                  </span>
                );
              }
              const isActive = num === safeCurrentPage;
              return (
                <button
                  key={`page-${num}`}
                  className={`btn-pill btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handlePageChange(num)}
                  style={{
                    minWidth: '36px',
                    height: '36px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem'
                  }}
                >
                  {num}
                </button>
              );
            })}

            {/* Nút Trang Sau */}
            <button
              className="btn-pill btn-secondary btn-sm"
              disabled={safeCurrentPage === totalPages}
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              style={{
                opacity: safeCurrentPage === totalPages ? 0.4 : 1,
                cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                padding: '0.4rem 0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 700
              }}
            >
              <span>Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            Hiển thị 30 từ vựng mỗi trang • Tổng cộng {filteredWords.length} từ vựng
          </div>
        </div>
      )}

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
