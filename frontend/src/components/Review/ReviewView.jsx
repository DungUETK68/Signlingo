import React, { useState, useMemo } from 'react';
import {
  useSavedLessons,
  useSavedSentences,
  useSignWords,
} from '../../data/wordsStore';
import {
  useSpacedRepetition,
  MEMORY_LEVELS,
} from '../../data/srsStore';
import MemoryDistributionCard from './MemoryDistributionCard';
import SpacedReviewSessionView from './SpacedReviewSessionView';
import PageHeroBanner from '../common/PageHeroBanner';
import {
  BookmarkCheck,
  MessageSquareQuote,
  Play,
  Trash2,
  Search,
  BookOpen,
  Clock,
  Zap,
  BellRing,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';

export default function ReviewView({
  onOpenLesson,
  onStartPracticeWord,
  onNavigateLearning,
  onOpenSentenceDetail,
  onNavigateSentences,
}) {
  // Tab hiện tại: 'vocab' (Ôn tập từ vựng) hoặc 'sentences' (Ôn tập câu)
  const [reviewTab, setReviewTab] = useState('vocab');

  // Quản lý từ vựng & câu đã lưu
  const { savedLessons, removeSaved: removeSavedLesson } = useSavedLessons();
  const { topics } = useSignWords();
  const { savedSentences, removeSaved: removeSavedSentence } = useSavedSentences();

  // Động cơ Spaced Repetition 6 mức độ nhớ (12h -> 1d -> 3d -> 7d -> 14d -> Nhớ dài hạn)
  const { trackedWords, stats, refresh: refreshSrs } = useSpacedRepetition(savedLessons);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemoryFilter, setSelectedMemoryFilter] = useState(null); // null | 0..5 | 'hard'
  const [showAllLevelsModal, setShowAllLevelsModal] = useState(false);

  // Điều khiển chuyển sang màn hình mới chuyên biệt khi nhấn "Ôn ngay"
  const [activeSessionQueue, setActiveSessionQueue] = useState(null);

  // Lọc danh sách từ vựng theo ô tìm kiếm & mức độ ghi nhớ đang chọn trên bảng Phân bổ
  const filteredWords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return trackedWords.filter((item) => {
      if (selectedMemoryFilter === 'hard') {
        if ((item.srs?.lapseCount || 0) <= 0) return false;
      } else if (typeof selectedMemoryFilter === 'number') {
        if (item.memoryLevel !== selectedMemoryFilter) return false;
      }

      if (!q) return true;
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.wordName || '').toLowerCase().includes(q) ||
        (item.topicTitle && item.topicTitle.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });
  }, [trackedWords, searchQuery, selectedMemoryFilter]);

  // Lọc câu đã lưu theo từ khóa tìm kiếm
  const filteredSentences = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return savedSentences;
    return savedSentences.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.meaning || '').toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.structure && item.structure.toLowerCase().includes(q)) ||
        (item.explanation && item.explanation.toLowerCase().includes(q)) ||
        (Array.isArray(item.words) &&
          item.words.some((w) => (w.name || w.word || '').toLowerCase().includes(q)))
    );
  }, [savedSentences, searchQuery]);

  const handleStudyWord = (item) => {
    let matchedTopic = topics.find(
      (t) => t.id === item.topicId || t.title === item.topicTitle
    );
    if (!matchedTopic) {
      matchedTopic = {
        id: item.topicId || 'custom-topic',
        title: item.topicTitle || 'Chủ đề ôn tập',
        level: item.level || 'Căn bản (Level 1)',
        lessons: [item],
      };
    }

    const fullLesson =
      (matchedTopic.lessons &&
        matchedTopic.lessons.find(
          (l) => l.id === item.id || l.title === item.title
        )) ||
      item;

    if (onOpenLesson) {
      onOpenLesson(fullLesson, matchedTopic);
    } else if (onStartPracticeWord) {
      onStartPracticeWord(item.wordName || item.title);
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

  // Mở màn hình mới "Ôn ngay" cho danh sách từ đến hạn
  const handleStartDueReviewSession = (customQueue = null) => {
    const queueToRun =
      Array.isArray(customQueue) && customQueue.length > 0
        ? customQueue
        : stats.dueWords;
    if (!queueToRun || queueToRun.length === 0) return;
    setActiveSessionQueue(queueToRun);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==================== KHI NHẤN "ÔN NGAY" -> MỞ MÀN HÌNH MỚI CHUYÊN BIỆT ====================
  if (activeSessionQueue) {
    return (
      <SpacedReviewSessionView
        queue={activeSessionQueue}
        stats={stats}
        onSessionUpdated={refreshSrs}
        onBack={() => {
          refreshSrs();
          setActiveSessionQueue(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1040,
        margin: '0 auto',
        animation: 'fadeIn 0.2s ease-out',
        paddingBottom: '3rem',
      }}
    >
      {/* 0. Thanh điều hướng phân chia 2 phân hệ: Ôn tập từ vựng & Ôn tập câu (luôn nằm trên 1 hàng ngang) */}
      <div className="review-subtabs subtabs-scroll-row">
        <button
          onClick={() => {
            setReviewTab('vocab');
            setSearchQuery('');
          }}
          className={`review-subtab-btn ${reviewTab === 'vocab' ? 'active' : ''}`}
        >
          <BookOpen size={17} style={{ flexShrink: 0 }} />
          <span>Ôn tập từ vựng</span>
          <span
            className="review-subtab-count"
            style={{
              backgroundColor: reviewTab === 'vocab' ? '#e0f2fe' : '#f1f5f9',
              color: reviewTab === 'vocab' ? '#0284c7' : '#64748b',
            }}
          >
            {trackedWords.length}
          </span>
          {stats.dueCount > 0 && (
            <span
              className="review-subtab-due"
              title="Số từ đã đến hạn cần ôn"
            >
              {stats.dueCount} cần ôn
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setReviewTab('sentences');
            setSearchQuery('');
          }}
          className={`review-subtab-btn ${reviewTab === 'sentences' ? 'active' : ''}`}
        >
          <MessageSquareQuote size={17} style={{ flexShrink: 0 }} />
          <span>Ôn tập câu</span>
          <span
            className="review-subtab-count"
            style={{
              backgroundColor: reviewTab === 'sentences' ? '#e0f2fe' : '#f1f5f9',
              color: reviewTab === 'sentences' ? '#0284c7' : '#64748b',
            }}
          >
            {savedSentences.length}
          </span>
        </button>
      </div>

      {/* ========================================================
          PHẦN 1: ÔN TẬP TỪ VỰNG NGẮT QUÃNG (SRS 6 MỨC ĐỘ NHỚ)
          ======================================================== */}
      {reviewTab === 'vocab' && (
        <div>
          {/* 1. THÔNG BÁO NHẮC NHỞ SỐ TỪ CẦN ÔN & NÚT "ÔN NGAY" */}
          {stats.dueCount > 0 ? (
            <div
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                border: '2px solid #60a5fa',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem 1.35rem',
                marginBottom: '1.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.08)',
              }}
            >
              <div style={{ flex: 1, minWidth: 240 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#1d4ed8',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    backgroundColor: '#dbeafe',
                    padding: '0.22rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    marginBottom: '0.45rem',
                  }}
                >
                  <BellRing size={14} />
                  <span>NHẮC NHỞ ÔN TẬP NGẮT QUÃNG</span>
                </div>

                <div
                  style={{
                    fontSize: '1.18rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    marginBottom: '0.25rem',
                  }}
                >
                  Bạn có <span style={{ color: '#dc2626' }}>{stats.dueCount} từ</span> cần ôn tập ngay!
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                  Thực hiện đúng ký hiệu trước Camera AI để tăng cấp độ nhớ (từ{' '}
                  <strong>12 giờ → 1 ngày → 3 ngày → 7 ngày → 14 ngày → Nhớ dài hạn</strong>).
                </p>
              </div>

              <button
                type="button"
                className="btn-pill btn-green"
                onClick={() => handleStartDueReviewSession(stats.dueWords)}
                style={{
                  padding: '0.8rem 1.65rem',
                  fontSize: '0.98rem',
                  fontWeight: 900,
                  gap: '0.45rem',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <Zap size={18} fill="#ffffff" />
                <span>Ôn ngay ({stats.dueCount} từ)</span>
              </button>
            </div>
          ) : (
            trackedWords.length > 0 && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.1rem 1.35rem',
                  marginBottom: '1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <CheckCircle2 size={26} color="#16a34a" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      Bạn đã hoàn thành hết các từ đến hạn ôn tập!
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                      {stats.nextUpcomingItem
                        ? `Từ tiếp theo "${stats.nextUpcomingItem.wordName}" • ${stats.nextUpcomingItem.remainingText} (chu kỳ từ 12h tăng dần).`
                        : 'Tất cả từ vựng của bạn đều đã đạt mức Nhớ Dài Hạn.'}
                    </div>
                  </div>
                </div>

                {stats.unmasteredWords.length > 0 && (
                  <button
                    type="button"
                    className="btn-pill btn-secondary btn-sm"
                    onClick={() => handleStartDueReviewSession(stats.unmasteredWords)}
                    style={{ fontWeight: 800, fontSize: '0.82rem', padding: '0.45rem 0.95rem', gap: '0.35rem' }}
                  >
                    <Play size={14} />
                    <span>Ôn sớm ngay ({stats.unmasteredWords.length} từ)</span>
                  </button>
                )}
              </div>
            )
          )}

          {/* 2. BẢNG PHÂN BỔ GHI NHỚ 6 MỨC ĐỘ (GIAO DIỆN THAM CHIẾU VSTEPOWL) */}
          {trackedWords.length > 0 && (
            <MemoryDistributionCard
              stats={stats}
              selectedLevel={selectedMemoryFilter}
              onSelectLevel={setSelectedMemoryFilter}
              onOpenAllByLevel={() => setShowAllLevelsModal(true)}
            />
          )}

          {/* 3. Header Danh sách Từ vựng đã lưu & Thanh tìm kiếm */}
          <PageHeroBanner
            style={{ marginBottom: '1.25rem' }}
            badgeIcon={<BookmarkCheck size={14} />}
            badgeText="TỪ VỰNG ĐÃ LƯU & ĐANG HỌC"
            badgeExtra={
              <>
                <span style={{ opacity: 0.9 }}>
                  • {filteredWords.length} / {trackedWords.length} từ hiển thị
                </span>
                {selectedMemoryFilter !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedMemoryFilter(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.14rem 0.55rem',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      backgroundColor: '#ffffff',
                      color: '#0284c7',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    <Filter size={11} />
                    <span>
                      Bỏ lọc:{' '}
                      {selectedMemoryFilter === 'hard'
                        ? 'Khó nhớ'
                        : MEMORY_LEVELS[selectedMemoryFilter]?.title}
                    </span>
                    <X size={12} />
                  </button>
                )}
              </>
            }
            title="Danh Sách Từ Vựng Ôn Tập Ký Hiệu"
            rightSlot={
              trackedWords.length > 0 ? (
                <div style={{ position: 'relative', width: '100%', minWidth: 260, maxWidth: 320 }}>
                  <Search
                    size={17}
                    color="#64748b"
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm từ vựng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.68rem 1rem 0.68rem 2.45rem',
                      borderRadius: 'var(--radius-pill)',
                      border: '1.5px solid rgba(255, 255, 255, 0.4)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                  />
                </div>
              ) : null
            }
          />

          {/* 4. Bảng Danh sách từ vựng kèm Mức độ nhớ & Thời gian chờ */}
          {trackedWords.length === 0 ? (
            <div
              className="mini-card"
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <BookmarkCheck size={36} strokeWidth={2} />
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#1e293b',
                  marginBottom: '0.5rem',
                }}
              >
                Chưa có từ vựng nào trong bộ ôn tập
              </h3>
              <p
                style={{
                  fontSize: '0.92rem',
                  color: '#64748b',
                  maxWidth: 440,
                  margin: '0 auto 1.5rem auto',
                  lineHeight: 1.5,
                }}
              >
                Khi học từ mới hoặc nhấn nút <strong>"Lưu"</strong> ở chi tiết bài học, từ vựng sẽ được đưa vào hệ thống nhắc ôn ngắt quãng từ 12 giờ đến Nhớ dài hạn!
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
          ) : filteredWords.length === 0 ? (
            <div
              className="mini-card"
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                backgroundColor: '#ffffff',
              }}
            >
              <p style={{ fontSize: '0.95rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                Không có từ vựng nào khớp với bộ lọc hiện tại.
              </p>
              <button
                type="button"
                className="btn-pill btn-secondary btn-sm"
                onClick={() => {
                  setSelectedMemoryFilter(null);
                  setSearchQuery('');
                }}
              >
                Xem lại toàn bộ từ
              </button>
            </div>
          ) : (
            <div
              className="mini-card"
              style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f8fafc',
                        borderBottom: '1.5px solid var(--border-color)',
                      }}
                    >
                      <th
                        style={{
                          padding: '0.9rem 1.15rem',
                          fontSize: '0.83rem',
                          fontWeight: 800,
                          color: '#475569',
                        }}
                      >
                        Từ vựng
                      </th>
                      <th
                        style={{
                          padding: '0.9rem 1.15rem',
                          fontSize: '0.83rem',
                          fontWeight: 800,
                          color: '#475569',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Mức độ ghi nhớ
                      </th>
                      <th
                        style={{
                          padding: '0.9rem 1.15rem',
                          fontSize: '0.83rem',
                          fontWeight: 800,
                          color: '#475569',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Lịch ôn tiếp theo
                      </th>
                      <th
                        style={{
                          padding: '0.9rem 1.15rem',
                          fontSize: '0.83rem',
                          fontWeight: 800,
                          color: '#475569',
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWords.map((item, idx) => {
                      const lvl = item.levelInfo;
                      return (
                        <tr
                          key={item.slug || item.id || idx}
                          style={{
                            borderBottom:
                              idx === filteredWords.length - 1
                                ? 'none'
                                : '1px solid #f1f5f9',
                          }}
                        >
                          <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                            <div
                              style={{
                                fontSize: '1rem',
                                fontWeight: 800,
                                color: '#1e293b',
                              }}
                            >
                              {item.wordName || item.title}
                            </div>
                            <div
                              style={{
                                fontSize: '0.74rem',
                                color: '#64748b',
                                marginTop: 2,
                              }}
                            >
                              {item.topicTitle || 'Từ vựng VSL'}
                            </div>
                          </td>

                          <td style={{ padding: '0.95rem 1.15rem', whiteSpace: 'nowrap' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.26rem 0.7rem',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: lvl.bgColor,
                                color: lvl.color,
                                border: `1px solid ${lvl.borderColor}`,
                                fontSize: '0.78rem',
                                fontWeight: 800,
                              }}
                            >
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: lvl.color,
                                }}
                              />
                              {lvl.title}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: '0.95rem 1.15rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              color: item.isDue
                                ? '#dc2626'
                                : item.memoryLevel >= 5
                                  ? '#16a34a'
                                  : '#64748b',
                            }}
                          >
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Clock size={14} />
                              <span>{item.remainingText}</span>
                            </div>
                          </td>

                          <td
                            style={{
                              padding: '0.95rem 1.15rem',
                              textAlign: 'right',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              {item.memoryLevel < 5 && (
                                <button
                                  type="button"
                                  className="btn-pill btn-green btn-sm"
                                  onClick={() => handleStartDueReviewSession([item])}
                                  style={{
                                    padding: '0.38rem 0.8rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    gap: '0.3rem',
                                  }}
                                  title="Ôn tập từ này ngay trên màn hình Camera SRS"
                                >
                                  <Zap size={13} fill="currentColor" />
                                  <span>Ôn ngay</span>
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn-pill btn-primary btn-sm"
                                onClick={() => handleStudyWord(item)}
                                style={{
                                  padding: '0.38rem 0.8rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  gap: '0.3rem',
                                }}
                                title="Xem lại video bài học mẫu"
                              >
                                <Play size={13} fill="currentColor" />
                                <span>Học</span>
                              </button>

                              {item.isSavedBookmark && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteWord(e, item.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.38rem 0.7rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    borderRadius: 'var(--radius-pill)',
                                    border: '1.5px solid #fecdd3',
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    cursor: 'pointer',
                                  }}
                                  title="Bỏ lưu khỏi danh sách"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal "Xem tất cả từ theo mức" */}
          {showAllLevelsModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowAllLevelsModal(false)}
              style={{ zIndex: 1200 }}
            >
              <div
                className="modal-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: 720,
                  width: '94%',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  padding: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    Tất cả từ vựng theo 6 mức độ ghi nhớ
                  </h3>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setShowAllLevelsModal(false)}
                    style={{ position: 'static' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {MEMORY_LEVELS.map((lvl) => {
                    const wordsInLevel = trackedWords.filter(
                      (w) => w.memoryLevel === lvl.level
                    );
                    return (
                      <div
                        key={lvl.level}
                        style={{
                          border: `1.5px solid ${lvl.borderColor}`,
                          backgroundColor: lvl.bgColor,
                          borderRadius: 'var(--radius-lg)',
                          padding: '0.9rem 1rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: lvl.color,
                              }}
                            />
                            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                              {lvl.title} ({wordsInLevel.length} từ)
                            </strong>
                          </div>
                          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: lvl.color }}>
                            {lvl.waitHours
                              ? `Thời gian chờ: ${lvl.intervalLabel}`
                              : 'Đã thuộc dài hạn • Không cần ôn lại'}
                          </span>
                        </div>

                        {wordsInLevel.length === 0 ? (
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Chưa có từ nào ở mức này.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {wordsInLevel.map((w) => (
                              <span
                                key={w.slug}
                                style={{
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: 'var(--radius-pill)',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  color: '#1e293b',
                                }}
                              >
                                {w.wordName || w.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PHẦN 2: ÔN TẬP CÂU GIAO TIẾP VSL (GIỮ NGUYÊN 100%)
          ======================================================== */}
      {reviewTab === 'sentences' && (
        <div>
          <PageHeroBanner
            style={{ marginBottom: '1.25rem' }}
            badgeIcon={<MessageSquareQuote size={14} />}
            badgeText="CÂU GIAO TIẾP ĐÃ LƯU"
            badgeExtra={
              <span style={{ opacity: 0.9 }}>
                • {savedSentences.length} câu cần ôn luyện
              </span>
            }
            title="Khu Vực Ôn Tập Câu Giao Tiếp VSL"
            subtitle="Rèn luyện ghép câu hoàn chỉnh theo quy tắc ngữ pháp VSL (Chủ đề – Lời dẫn, SOV) và ghi nhớ chuỗi ký hiệu."
            rightSlot={
              savedSentences.length > 0 ? (
                <div style={{ position: 'relative', width: '100%', minWidth: 260, maxWidth: 320 }}>
                  <Search
                    size={17}
                    color="#64748b"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm câu đã lưu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.68rem 1rem 0.68rem 2.45rem',
                      borderRadius: 'var(--radius-pill)',
                      border: '1.5px solid rgba(255, 255, 255, 0.4)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                  />
                </div>
              ) : null
            }
          />

          {savedSentences.length === 0 ? (
            <div
              className="mini-card"
              style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff' }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <MessageSquareQuote size={36} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                Chưa có câu giao tiếp nào được lưu
              </h3>
              <p
                style={{
                  fontSize: '0.92rem',
                  color: '#64748b',
                  maxWidth: 440,
                  margin: '0 auto 1.5rem auto',
                  lineHeight: 1.5,
                }}
              >
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
            <div
              className="mini-card"
              style={{ textAlign: 'center', padding: '2.5rem 1.5rem', backgroundColor: '#ffffff' }}
            >
              <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
                Không tìm thấy câu đã lưu nào khớp với từ khóa "<strong>{searchQuery}</strong>".
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.25rem',
              }}
            >
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
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.65rem',
                      }}
                    >
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
                            color:
                              sentence.difficulty === 'Nâng cao'
                                ? '#dc2626'
                                : sentence.difficulty === 'Trung bình'
                                  ? '#d97706'
                                  : '#16a34a',
                          }}
                        >
                          {sentence.difficulty || 'Dễ'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) =>
                            handleDeleteSentence(e, sentence.id || sentence.slug)
                          }
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
                          }}
                          title="Bỏ lưu câu này khỏi danh sách ôn tập"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.18rem',
                        fontWeight: 900,
                        color: '#0f172a',
                        margin: '0 0 0.75rem 0',
                      }}
                    >
                      "{sentence.title}"
                    </h3>

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
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>
                        Trật tự:
                      </span>
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
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>
                                →
                              </span>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 800 }}>
                          {sentence.title}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#475569',
                        lineHeight: 1.45,
                        marginBottom: '1rem',
                      }}
                    >
                      <strong style={{ color: '#1e293b' }}>Ngữ pháp:</strong>{' '}
                      {sentence.structure || 'SOV (Chủ - Bổ - Động)'}
                    </div>
                  </div>

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
