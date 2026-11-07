import React, { useState, useEffect, useMemo } from 'react';
import { useSavedLessons, useSavedSentences, useSignWords } from '../../data/wordsStore';
import { adaptiveApi } from '../../services/api';
import { 
  BookmarkCheck, 
  MessageSquareQuote,
  Play, 
  Trash2, 
  Search, 
  BookOpen, 
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Camera,
  Layers
} from 'lucide-react';

export default function ReviewView({ 
  onOpenLesson, 
  onStartPracticeWord, 
  onNavigateLearning,
  onOpenSentenceDetail,
  onNavigateSentences
}) {
  // Tab hiện tại: 'vocab' (Ôn tập từ vựng) hoặc 'sentences' (Ôn tập câu)
  const [reviewTab, setReviewTab] = useState('vocab');

  // Quản lý từ vựng đã lưu
  const { savedLessons, removeSaved: removeSavedLesson } = useSavedLessons();
  const { topics } = useSignWords();

  // Quản lý câu đã lưu
  const { savedSentences, removeSaved: removeSavedSentence } = useSavedSentences();

  const [searchQuery, setSearchQuery] = useState('');
  const [dueItems, setDueItems] = useState([]);

  // Tải danh sách từ đến hạn ôn tập từ thuật toán Spaced Repetition (SRS) trên NestJS
  useEffect(() => {
    const fetchDue = async () => {
      try {
        const items = await adaptiveApi.getDueReviewQueue();
        if (Array.isArray(items)) {
          setDueItems(items);
        }
      } catch (e) {}
    };
    fetchDue();
  }, []);

  // Lọc từ vựng đã lưu theo từ khóa tìm kiếm
  const filteredLessons = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return savedLessons;
    return savedLessons.filter(item => (
      (item.title || '').toLowerCase().includes(q) ||
      (item.topicTitle && item.topicTitle.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    ));
  }, [savedLessons, searchQuery]);

  // Lọc câu đã lưu theo từ khóa tìm kiếm
  const filteredSentences = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return savedSentences;
    return savedSentences.filter(item => (
      (item.title || '').toLowerCase().includes(q) ||
      (item.meaning || '').toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.structure && item.structure.toLowerCase().includes(q)) ||
      (item.explanation && item.explanation.toLowerCase().includes(q)) ||
      (Array.isArray(item.words) && item.words.some(w => (w.name || w.word || '').toLowerCase().includes(q)))
    ));
  }, [savedSentences, searchQuery]);

  const handleStudyWord = (item) => {
    let matchedTopic = topics.find(t => t.id === item.topicId || t.title === item.topicTitle);
    if (!matchedTopic) {
      matchedTopic = {
        id: item.topicId || 'custom-topic',
        title: item.topicTitle || 'Chủ đề ôn tập',
        level: item.level || 'Căn bản (Level 1)',
        lessons: [item]
      };
    }
    
    const fullLesson = (matchedTopic.lessons && matchedTopic.lessons.find(l => l.id === item.id || l.title === item.title)) || item;

    if (onOpenLesson) {
      onOpenLesson(fullLesson, matchedTopic);
    } else if (onStartPracticeWord) {
      onStartPracticeWord(item.title);
    }
  };

  const handleStudySentence = (sentence) => {
    if (onOpenSentenceDetail) {
      onOpenSentenceDetail(sentence.id || sentence.slug);
    } else if (onNavigateSentences) {
      onNavigateSentences();
    }
  };

  const handleDeleteWord = (e, itemId) => {
    e.stopPropagation();
    removeSavedLesson(itemId);
  };

  const handleDeleteSentence = (e, sentenceId) => {
    e.stopPropagation();
    removeSavedSentence(sentenceId);
  };

  return (
    <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto', animation: 'fadeIn 0.2s ease-out', paddingBottom: '3rem' }}>
      
      {/* 0. Thanh điều hướng phân chia 2 phân hệ: Ôn tập từ vựng & Ôn tập câu */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.25rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => { setReviewTab('vocab'); setSearchQuery(''); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: reviewTab === 'vocab' ? '3px solid #0284c7' : '3px solid transparent',
            marginBottom: -4,
            backgroundColor: 'transparent',
            color: reviewTab === 'vocab' ? '#0284c7' : '#64748b',
            fontSize: '1rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BookOpen size={19} />
          <span>Ôn tập từ vựng</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.55rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: reviewTab === 'vocab' ? '#e0f2fe' : '#f1f5f9',
            color: reviewTab === 'vocab' ? '#0284c7' : '#64748b',
            fontWeight: 800
          }}>
            {savedLessons.length}
          </span>
        </button>

        <button
          onClick={() => { setReviewTab('sentences'); setSearchQuery(''); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: reviewTab === 'sentences' ? '3px solid #0284c7' : '3px solid transparent',
            marginBottom: -4,
            backgroundColor: 'transparent',
            color: reviewTab === 'sentences' ? '#0284c7' : '#64748b',
            fontSize: '1rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <MessageSquareQuote size={19} />
          <span>Ôn tập câu</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.55rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: reviewTab === 'sentences' ? '#e0f2fe' : '#f1f5f9',
            color: reviewTab === 'sentences' ? '#0284c7' : '#64748b',
            fontWeight: 800
          }}>
            {savedSentences.length}
          </span>
        </button>
      </div>

      {/* ========================================================
          PHẦN 1: ÔN TẬP TỪ VỰNG
          ======================================================== */}
      {reviewTab === 'vocab' && (
        <div>
          {/* Header Ôn tập Từ vựng */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            marginBottom: '1.25rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7'
                }}>
                  <BookmarkCheck size={13} />
                  TỪ VỰNG ĐÃ LƯU
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  • {savedLessons.length} từ vựng cần ôn luyện
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Khu Vực Ôn Tập Từ Vựng Ký Hiệu
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem', marginBottom: 0 }}>
                Nơi tập hợp các bài học từ vựng bạn đã lưu lại để rèn luyện trí nhớ cơ bắp và củng cố độ chuẩn xác cử chỉ.
              </p>
            </div>

            {/* Thanh tìm kiếm nhanh từ vựng */}
            {savedLessons.length > 0 && (
              <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                <Search 
                  size={17} 
                  color="#94a3b8" 
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} 
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm từ vựng đã lưu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.3rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
              </div>
            )}
          </div>

          {/* Spaced Repetition SRS Banner */}
          {dueItems.length > 0 && (
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                  <Zap size={16} fill="#1d4ed8" />
                  <span>THUẬT TOÁN LẶP LẠI NGẮT QUÃNG (SPACED REPETITION)</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0 }}>
                  Hệ thống phát hiện bạn có <b>{dueItems.length} từ</b> đến hạn cần ôn lại hôm nay để củng cố trí nhớ dài hạn.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {dueItems.slice(0, 3).map(item => (
                  <button
                    key={item.id}
                    onClick={() => onStartPracticeWord && onStartPracticeWord(item.wordName)}
                    className="btn-pill btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', gap: '0.3rem' }}
                  >
                    <span>Ôn "{item.wordName}"</span>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nội dung danh sách từ vựng đã lưu */}
          {savedLessons.length === 0 ? (
            <div className="mini-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff' }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <BookmarkCheck size={36} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                Chưa có từ vựng nào được lưu
              </h3>
              <p style={{
                fontSize: '0.92rem',
                color: '#64748b',
                maxWidth: 420,
                margin: '0 auto 1.5rem auto',
                lineHeight: 1.5
              }}>
                Khi xem chi tiết bất kỳ bài học nào trong tab <strong>Học tập</strong> hoặc từ điển, hãy nhấn nút <strong>"Lưu"</strong> để thêm vào danh sách ôn tập tại đây!
              </p>
              <button
                className="btn-pill btn-primary"
                onClick={onNavigateLearning}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <BookOpen size={18} />
                <span>Khám phá bài học ngay</span>
              </button>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="mini-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', backgroundColor: '#ffffff' }}>
              <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
                Không tìm thấy từ đã lưu nào khớp với từ khóa "<strong>{searchQuery}</strong>".
              </p>
            </div>
          ) : (
            <div className="mini-card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid var(--border-color)' }}>
                      <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                        Từ vựng / Bài học
                      </th>
                      <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>
                        Chủ đề
                      </th>
                      <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>
                        Thời lượng & Cấp độ
                      </th>
                      <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLessons.map((item, idx) => (
                      <tr 
                        key={item.id || idx}
                        style={{
                          borderBottom: idx === filteredLessons.length - 1 ? 'none' : '1px solid #f1f5f9',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                            {item.title}
                          </div>
                          {item.description && (
                            <p style={{
                              fontSize: '0.82rem',
                              color: '#64748b',
                              margin: '0.25rem 0 0 0',
                              lineHeight: 1.4,
                              maxWidth: 360
                            }}>
                              {item.description}
                            </p>
                          )}
                        </td>

                        <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.3rem 0.75rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: '#f1f5f9',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#334155',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.topicTitle || 'Giao tiếp & Làm quen'}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                            <Clock size={14} color="#94a3b8" />
                            <span>{item.duration || '3 phút'}</span>
                            <span>•</span>
                            <span style={{ color: '#0284c7', fontWeight: 700 }}>{item.difficulty || item.level || 'Dễ'}</span>
                          </div>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}>
                            <button
                              className="btn-pill btn-primary btn-sm"
                              onClick={() => handleStudyWord(item)}
                              style={{
                                padding: '0.4rem 0.85rem',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                              }}
                              title="Học bài học từ vựng này ngay"
                            >
                              <Play size={14} fill="currentColor" />
                              <span>Học</span>
                            </button>

                            <button
                              onClick={(e) => handleDeleteWord(e, item.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-pill)',
                                border: '1.5px solid #fecdd3',
                                backgroundColor: '#fff1f2',
                                color: '#e11d48',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffe4e6';
                                e.currentTarget.style.borderColor = '#fda4af';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fff1f2';
                                e.currentTarget.style.borderColor = '#fecdd3';
                              }}
                              title="Xóa khỏi danh sách ôn tập"
                            >
                              <Trash2 size={14} />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PHẦN 2: ÔN TẬP CÂU GIAO TIẾP VSL
          ======================================================== */}
      {reviewTab === 'sentences' && (
        <div>
          {/* Header Ôn tập Câu */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            marginBottom: '1.25rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7'
                }}>
                  <MessageSquareQuote size={13} />
                  CÂU GIAO TIẾP ĐÃ LƯU
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  • {savedSentences.length} câu cần ôn luyện
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Khu Vực Ôn Tập Câu Giao Tiếp VSL
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem', marginBottom: 0 }}>
                Rèn luyện ghép câu hoàn chỉnh theo quy tắc ngữ pháp VSL (Chủ đề – Lời dẫn, SOV) và ghi nhớ chuỗi ký hiệu.
              </p>
            </div>

            {/* Thanh tìm kiếm nhanh câu đã lưu */}
            {savedSentences.length > 0 && (
              <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                <Search 
                  size={17} 
                  color="#94a3b8" 
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} 
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu đã lưu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.3rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
              </div>
            )}
          </div>

          {/* Danh sách câu đã lưu */}
          {savedSentences.length === 0 ? (
            <div className="mini-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff' }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <MessageSquareQuote size={36} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                Chưa có câu giao tiếp nào được lưu
              </h3>
              <p style={{
                fontSize: '0.92rem',
                color: '#64748b',
                maxWidth: 440,
                margin: '0 auto 1.5rem auto',
                lineHeight: 1.5
              }}>
                Trong tab <strong>Câu thường gặp</strong>, hãy nhấn vào biểu tượng <strong>"Lưu câu"</strong> trên bất kỳ câu nào để đưa vào danh sách ôn tập tại đây!
              </p>
              <button
                className="btn-pill btn-primary"
                onClick={onNavigateSentences}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <MessageSquareQuote size={18} />
                <span>Khám phá các câu thường gặp</span>
              </button>
            </div>
          ) : filteredSentences.length === 0 ? (
            <div className="mini-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', backgroundColor: '#ffffff' }}>
              <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
                Không tìm thấy câu đã lưu nào khớp với từ khóa "<strong>{searchQuery}</strong>".
              </p>
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
                    {/* Header Card: Chủ đề & Thao tác Bỏ lưu */}
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
                        {sentence.category || 'Giao tiếp & Xã giao'}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: sentence.difficulty === 'Nâng cao' ? '#dc2626' : sentence.difficulty === 'Trung bình' ? '#d97706' : '#16a34a',
                          }}
                        >
                          {sentence.difficulty || 'Dễ'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSentence(e, sentence.id || sentence.slug)}
                          style={{
                            background: '#fff1f2',
                            border: '1.5px solid #fecdd3',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#e11d48',
                            transition: 'all 0.15s ease',
                          }}
                          title="Bỏ lưu câu này khỏi danh sách ôn tập"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Tiêu đề câu */}
                    <h3 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                      "{sentence.title}"
                    </h3>

                    {/* Ý nghĩa giao tiếp */}
                    {sentence.meaning && (
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
                        {sentence.meaning}
                      </p>
                    )}

                    {/* Trật tự chuỗi ký hiệu VSL */}
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
                      {Array.isArray(sentence.words) && sentence.words.length > 0 ? (
                        sentence.words.map((w, idx) => (
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
                            {idx < sentence.words.length - 1 && (
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>→</span>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 800 }}>
                          {sentence.title}
                        </span>
                      )}
                    </div>

                    {/* Mô hình cấu trúc ngữ pháp */}
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45, marginBottom: '1rem' }}>
                      <strong style={{ color: '#1e293b' }}>Ngữ pháp:</strong> {sentence.structure || 'SOV (Chủ - Bổ - Động)'}
                    </div>
                  </div>

                  {/* Nút Học câu ngay */}
                  <div style={{ paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      className="btn-pill btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        fontSize: '0.88rem',
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#0284c7',
                      }}
                      onClick={() => handleStudySentence(sentence)}
                    >
                      <Play size={15} fill="#ffffff" />
                      <span>Học câu này ngay</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
