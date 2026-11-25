import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  X,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Video,
  Check,
  Filter,
  Award
} from 'lucide-react';
import { communityApi, resolveMediaUrl } from '../../services/api';
import PostCommunityWordModal from './PostCommunityWordModal';
import PageHeroBanner from '../common/PageHeroBanner';

export default function CommunityView({ isAdmin = false }) {
  // Tabs: 'explore' (Khám phá & Bình chọn) | 'my' (Từ của tôi) | 'admin_review' (Duyệt từ >= 80% - chỉ Admin)
  const [activeSubTab, setActiveSubTab] = useState('explore');

  const [communityWords, setCommunityWords] = useState([]);
  const [myWords, setMyWords] = useState([]);
  const [eligibleAdminWords, setEligibleAdminWords] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Video preview modal
  const [previewVideo, setPreviewVideo] = useState(null);

  // Admin Reject Modal
  const [rejectModalState, setRejectModalState] = useState({
    isOpen: false,
    item: null,
    reason: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // 1. Tải danh sách từ cộng đồng
  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      const all = await communityApi.getAllWords();
      setCommunityWords(Array.isArray(all) ? all : []);

      const my = await communityApi.getMyWords();
      setMyWords(Array.isArray(my) ? my : []);

      if (isAdmin) {
        const eligible = await communityApi.getAdminEligibleWords();
        setEligibleAdminWords(Array.isArray(eligible) ? eligible : []);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu cộng đồng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [isAdmin]);

  // 2. Xử lý vote (Ủng hộ / Không ủng hộ)
  const handleVote = async (wordId, voteType) => {
    try {
      // Optimistic UI update
      setCommunityWords(prev => prev.map(w => {
        if (w.id !== wordId) return w;

        let newUp = w.upvotes;
        let newDown = w.downvotes;
        let newUserVote = w.userVote;

        if (w.userVote === voteType) {
          // Toggle off
          if (voteType === 'UP') newUp = Math.max(0, newUp - 1);
          if (voteType === 'DOWN') newDown = Math.max(0, newDown - 1);
          newUserVote = null;
        } else if (w.userVote) {
          // Switch vote
          if (voteType === 'UP') {
            newUp += 1;
            newDown = Math.max(0, newDown - 1);
          } else {
            newDown += 1;
            newUp = Math.max(0, newUp - 1);
          }
          newUserVote = voteType;
        } else {
          // New vote
          if (voteType === 'UP') newUp += 1;
          if (voteType === 'DOWN') newDown += 1;
          newUserVote = voteType;
        }

        const newTotal = newUp + newDown;
        const newRate = newTotal > 0 ? Number(((newUp / newTotal) * 100).toFixed(1)) : 0;

        return {
          ...w,
          upvotes: newUp,
          downvotes: newDown,
          totalVotes: newTotal,
          supportRate: newRate,
          userVote: newUserVote
        };
      }));

      // Call API
      const res = await communityApi.voteWord(wordId, voteType);
      if (res && res.success) {
        // Cập nhật lại chính xác từ server
        setCommunityWords(prev => prev.map(w => {
          if (w.id === wordId) {
            return {
              ...w,
              upvotes: res.upvotes,
              downvotes: res.downvotes,
              totalVotes: res.totalVotes,
              supportRate: res.supportRate,
              userVote: res.userVote,
            };
          }
          return w;
        }));

        if (res.userVote === 'UP') {
          showToast('Đã ủng hộ từ vựng này! Cảm ơn bạn đã đóng góp tiếng nói. 👍');
        } else if (res.userVote === 'DOWN') {
          showToast('Đã ghi nhận ý kiến không ủng hộ. 👎');
        } else {
          showToast('Đã hủy bình chọn.');
        }

        // Nếu là admin, cập nhật lại danh sách đủ điều kiện
        if (isAdmin) {
          const eligible = await communityApi.getAdminEligibleWords();
          setEligibleAdminWords(Array.isArray(eligible) ? eligible : []);
        }
      }
    } catch (err) {
      showToast(err.message || 'Vui lòng đăng nhập để bình chọn.');
      // Revert if error
      fetchCommunityData();
    }
  };

  // 3. Admin duyệt từ
  const handleAdminApprove = async (item) => {
    if (!window.confirm(`Xác nhận PHÊ DUYỆT từ "${item.word}" và đưa chính thức vào Từ điển & Bài học VSL?`)) return;

    try {
      await communityApi.approveWord(item.id, 'Cộng đồng ủng hộ trên 80% và đã được Quản trị viên duyệt chính thức.');
      showToast(`Đã duyệt thành công từ "${item.word}" vào Từ điển chung! 🎉`);
      fetchCommunityData();
      window.dispatchEvent(new CustomEvent('signlingo_data_updated', { detail: { action: 'refresh' } }));
    } catch (err) {
      showToast(`Lỗi duyệt từ: ${err.message || 'Thao tác thất bại'}`);
    }
  };

  // 4. Admin từ chối từ
  const handleConfirmReject = async () => {
    if (!rejectModalState.item) return;

    try {
      await communityApi.rejectWord(rejectModalState.item.id, rejectModalState.reason);
      showToast(`Đã từ chối từ "${rejectModalState.item.word}".`);
      setRejectModalState({ isOpen: false, item: null, reason: '' });
      fetchCommunityData();
    } catch (err) {
      showToast(`Lỗi từ chối từ: ${err.message || 'Thao tác thất bại'}`);
    }
  };

  // 5. Danh mục chủ đề lọc
  const topicsList = useMemo(() => {
    const set = new Set();
    communityWords.forEach(w => {
      if (w.topicLabel) set.add(w.topicLabel);
    });
    return ['all', ...Array.from(set)];
  }, [communityWords]);

  // 6. Lọc từ trong Explore
  const filteredWords = useMemo(() => {
    return communityWords.filter(w => {
      const matchSearch = !searchQuery.trim() || 
        w.word.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (w.authorName && w.authorName.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      const matchTopic = selectedTopic === 'all' || w.topicLabel === selectedTopic;
      return matchSearch && matchTopic;
    });
  }, [communityWords, searchQuery, selectedTopic]);

  return (
    <div className="community-container" style={{ paddingBottom: '4rem' }}>
      {/* Toast Feedback */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-pill)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Sparkles size={16} color="#38bdf8" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <PageHeroBanner
        style={{ marginBottom: '1.25rem' }}
        badgeIcon={<Users size={15} />}
        badgeText="CỘNG ĐỒNG SÁNG TẠO & ĐỀ XUẤT TỪ VỰNG"
        title="Cộng Đồng Ngôn Ngữ Ký Hiệu VSL"
        subtitle={
          <>
            Nơi người học và cộng đồng đề xuất các từ vựng mới hoàn toàn chưa có trong từ điển. Các từ có <strong>tỉ lệ ủng hộ trên 80%</strong> sẽ tự động được gửi tới Quản trị viên để kiểm duyệt và đưa vào Từ điển chuẩn.
          </>
        }
        rightSlot={
          <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-pill btn-sm page-hero-btn-glass"
              onClick={fetchCommunityData}
              title="Tải lại danh sách"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 0.95rem' }}
            >
              <RefreshCw size={14} />
              <span>Làm mới</span>
            </button>

            <button
              className="btn-pill page-hero-btn-white"
              onClick={() => setIsPostModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.68rem 1.25rem' }}
            >
              <Plus size={16} strokeWidth={2.8} />
              <span>Đăng từ mới</span>
            </button>
          </div>
        }
      />

      {/* Sub Tabs Bar - luôn nằm trên 1 hàng ngang */}
      <div className="subtabs-scroll-row" style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '2px' }}>
        <button
          className={`btn-pill btn-sm ${activeSubTab === 'explore' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('explore')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <Sparkles size={14} />
          <span>Khám phá & Bình chọn ({communityWords.length})</span>
        </button>

        <button
          className={`btn-pill btn-sm ${activeSubTab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('my')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <Clock size={14} />
          <span>Từ của tôi ({myWords.length})</span>
        </button>

        {/* TAB DUYỆT TỪ - CHỈ HIỆN KHI QUẢN TRỊ VIÊN */}
        {isAdmin && (
          <button
            className={`btn-pill btn-sm ${activeSubTab === 'admin_review' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('admin_review')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              backgroundColor: activeSubTab === 'admin_review' ? undefined : '#fef2f2',
              color: activeSubTab === 'admin_review' ? undefined : '#b91c1c',
              borderColor: activeSubTab === 'admin_review' ? undefined : '#fecaca',
            }}
          >
            <ShieldCheck size={14} />
            <span>Duyệt từ cộng đồng (≥80%)</span>
            {eligibleAdminWords.length > 0 && (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 900,
                backgroundColor: activeSubTab === 'admin_review' ? '#ffffff' : '#ef4444',
                color: activeSubTab === 'admin_review' ? '#0284c7' : '#ffffff',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                lineHeight: 1.2
              }}>
                {eligibleAdminWords.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. SUB-TAB: KHÁM PHÁ & BÌNH CHỌN                         */}
      {/* ========================================================= */}
      {activeSubTab === 'explore' && (
        <div>
          {/* Bộ lọc tìm kiếm & Chuyên đề 1 hàng ngang trượt tự do */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 460 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Tìm kiếm từ ký hiệu, mô tả hoặc người đề xuất..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem 0.55rem 2.4rem',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Chủ đề 1 hàng trượt ngang (giống Từ điển) */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.4rem', scrollbarWidth: 'thin' }}>
              {topicsList.map(t => (
                <button
                  key={t}
                  className={`btn-pill btn-sm ${selectedTopic === t ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.78rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  onClick={() => setSelectedTopic(t)}
                >
                  {t === 'all' ? 'Tất cả chủ đề' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Grid danh sách từ */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem auto' }} />
              <span>Đang tải các từ vựng từ cộng đồng...</span>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="mini-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
              <Users size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', margin: '0 0 0.35rem 0' }}>
                Chưa có từ vựng nào phù hợp
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
                Hãy là người đầu tiên đăng từ vựng mới để cộng đồng cùng đánh giá!
              </p>
              <button
                className="btn-pill btn-primary btn-sm"
                onClick={() => setIsPostModalOpen(true)}
              >
                Đăng từ mới ngay
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredWords.map((item) => {
                const isOver80 = item.supportRate >= 80 && item.totalVotes >= 1;
                const isApproved = item.status === 'APPROVED';
                const isRejected = item.status === 'REJECTED';

                return (
                  <div 
                    key={item.id} 
                    className="mini-card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 'var(--radius-xl)',
                      border: isApproved 
                        ? '2px solid #22c55e' 
                        : isOver80 
                          ? '2px solid #38bdf8' 
                          : '1px solid var(--border-color)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {/* Video Area */}
                    <div style={{ position: 'relative', height: 180, backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.videoFront ? (
                        <video
                          src={resolveMediaUrl(item.videoFront)}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
                          <Video size={32} style={{ margin: '0 auto 0.35rem auto' }} />
                          <span style={{ fontSize: '0.78rem' }}>Chưa có video đính kèm</span>
                        </div>
                      )}

                      {/* Play overlay button */}
                      {item.videoFront && (
                        <button
                          type="button"
                          onClick={() => setPreviewVideo({ url: item.videoFront, title: item.word })}
                          style={{
                            position: 'absolute',
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(2, 132, 199, 0.85)',
                            color: '#ffffff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            transition: 'transform 0.15s'
                          }}
                        >
                          <Play size={20} fill="#ffffff" style={{ marginLeft: 2 }} />
                        </button>
                      )}

                      {/* Status Tag */}
                      <div style={{ position: 'absolute', top: 10, left: 10 }}>
                        {isApproved ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#22c55e', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            <CheckCircle2 size={12} /> Đã vào Từ điển
                          </span>
                        ) : isRejected ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#ef4444', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            <XCircle size={12} /> Bị từ chối
                          </span>
                        ) : isOver80 ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#0284c7', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            <Award size={12} /> Đạt tiêu chuẩn duyệt (≥80%)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-pill)', backdropFilter: 'blur(4px)' }}>
                            Đang bình chọn
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                          {item.word}
                        </h3>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>
                          {item.topicLabel}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                        <span>📍 {item.dialect}</span>
                        <span>•</span>
                        <span>Độ khó: {item.difficulty}</span>
                        <span>•</span>
                        <span>Đăng bởi: <strong>{item.authorName}</strong></span>
                      </div>

                      {item.description && (
                        <p style={{ fontSize: '0.84rem', color: '#334155', margin: '0 0 0.85rem 0', lineHeight: 1.45, flex: 1 }}>
                          {item.description}
                        </p>
                      )}

                      {/* Technical hints */}
                      {(item.handShape || item.movement) && (
                        <div style={{ fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', marginBottom: '0.85rem', color: '#64748b', border: '1px solid #f1f5f9' }}>
                          {item.handShape && <div>🖐️ <strong>Dạng tay:</strong> {item.handShape}</div>}
                          {item.movement && <div>🔄 <strong>Chuyển động:</strong> {item.movement}</div>}
                        </div>
                      )}

                      {/* Support Rate Progress Bar */}
                      <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: 800, color: isOver80 ? '#16a34a' : '#0284c7' }}>
                            {item.supportRate}% Ủng hộ
                          </span>
                          <span style={{ color: '#64748b' }}>
                            {item.upvotes} / {item.totalVotes} đánh giá
                          </span>
                        </div>

                        {/* Progress Bar with 80% mark */}
                        <div style={{ position: 'relative', height: 8, backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                          <div 
                            style={{ 
                              width: `${Math.min(100, Math.max(0, item.supportRate))}%`, 
                              height: '100%', 
                              backgroundColor: isOver80 ? '#22c55e' : '#0284c7', 
                              borderRadius: 'var(--radius-pill)',
                              transition: 'width 0.3s ease'
                            }} 
                          />
                          {/* 80% Marker */}
                          <div 
                            style={{ 
                              position: 'absolute', 
                              left: '80%', 
                              top: 0, 
                              bottom: 0, 
                              width: 2, 
                              backgroundColor: '#f59e0b',
                              zIndex: 2
                            }} 
                            title="Mốc 80% để Quản trị viên duyệt"
                          />
                        </div>

                        {/* Vote Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleVote(item.id, 'UP')}
                            style={{
                              padding: '0.45rem 0.65rem',
                              borderRadius: 'var(--radius-pill)',
                              border: item.userVote === 'UP' ? '1.5px solid #22c55e' : '1.5px solid #e2e8f0',
                              backgroundColor: item.userVote === 'UP' ? '#f0fdf4' : '#ffffff',
                              color: item.userVote === 'UP' ? '#16a34a' : '#475569',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            <ThumbsUp size={14} fill={item.userVote === 'UP' ? '#22c55e' : 'none'} />
                            <span>Ủng hộ ({item.upvotes})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVote(item.id, 'DOWN')}
                            style={{
                              padding: '0.45rem 0.65rem',
                              borderRadius: 'var(--radius-pill)',
                              border: item.userVote === 'DOWN' ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                              backgroundColor: item.userVote === 'DOWN' ? '#fef2f2' : '#ffffff',
                              color: item.userVote === 'DOWN' ? '#dc2626' : '#475569',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            <ThumbsDown size={14} fill={item.userVote === 'DOWN' ? '#ef4444' : 'none'} />
                            <span>Không ({item.downvotes})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SUB-TAB: TỪ CỦA TÔI                                    */}
      {/* ========================================================= */}
      {activeSubTab === 'my' && (
        <div>
          {myWords.length === 0 ? (
            <div className="mini-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
              <Clock size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', margin: '0 0 0.35rem 0' }}>
                Bạn chưa đề xuất từ vựng nào
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
                Hãy chia sẻ những cử chỉ ký hiệu thú vị mà bạn biết với cộng đồng ngay hôm nay.
              </p>
              <button
                className="btn-pill btn-primary btn-sm"
                onClick={() => setIsPostModalOpen(true)}
              >
                Đăng từ mới ngay
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myWords.map((item) => {
                const isOver80 = item.supportRate >= 80 && item.totalVotes >= 1;
                return (
                  <div key={item.id} className="mini-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div 
                        onClick={() => item.videoFront && setPreviewVideo({ url: item.videoFront, title: item.word })}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: '12px',
                          backgroundColor: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: item.videoFront ? 'pointer' : 'default',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}
                      >
                        {item.videoFront ? (
                          <Play size={20} color="#ffffff" />
                        ) : (
                          <Video size={20} color="#64748b" />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {item.word}
                          </h4>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-pill)' }}>
                            {item.topicLabel}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                          {item.description || 'Không có mô tả chi tiết'}
                        </p>
                        {item.adminFeedback && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: item.status === 'APPROVED' ? '#16a34a' : '#dc2626' }}>
                            💬 Phản hồi Admin: {item.adminFeedback}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats & Status */}
                    <div style={{ textAlign: 'right', minWidth: 160 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: isOver80 ? '#16a34a' : '#0284c7', marginBottom: '0.2rem' }}>
                        {item.supportRate}% Ủng hộ
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>
                        👍 {item.upvotes} • 👎 {item.downvotes} ({item.totalVotes} lượt)
                      </div>
                      {item.status === 'APPROVED' ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                          ✓ Đã vào Từ điển
                        </span>
                      ) : item.status === 'REJECTED' ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                          ✕ Từ chối
                        </span>
                      ) : isOver80 ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                          ⭐ Đạt ≥80% (Chờ Admin duyệt)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#fef3c7', color: '#b45309', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                          Đang bình chọn
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SUB-TAB: DUYỆT TỪ CỘNG ĐỒNG (CHỈ DÀNH CHO ADMIN)       */}
      {/* ========================================================= */}
      {activeSubTab === 'admin_review' && isAdmin && (
        <div>
          {/* Admin Notice */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#eff6ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#1e40af'
          }}>
            <ShieldCheck size={22} color="#0284c7" flexShrink={0} />
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Khu vực Kiểm duyệt dành riêng cho Quản trị viên:</strong> Các từ dưới đây do cộng đồng đề xuất và đã đạt <strong>tỉ lệ ủng hộ từ 80% trở lên</strong>. Bạn có quyền kiểm tra video, quyết định <strong>Phê duyệt</strong> (tự động tích hợp vào Từ điển VSL chính thức & tạo Bài học) hoặc <strong>Từ chối</strong> kèm phản hồi.
            </div>
          </div>

          {eligibleAdminWords.length === 0 ? (
            <div className="mini-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', margin: '0 0 0.35rem 0' }}>
                Không có từ vựng nào đang chờ duyệt
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Hiện tại tất cả các đề xuất đạt trên 80% ủng hộ đều đã được xử lý.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {eligibleAdminWords.map((item) => (
                <div 
                  key={item.id} 
                  className="mini-card" 
                  style={{ 
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    border: '1.5px solid #bae6fd',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Video preview thumbnail */}
                    <div 
                      onClick={() => item.videoFront && setPreviewVideo({ url: item.videoFront, title: item.word })}
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: '12px',
                        backgroundColor: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: item.videoFront ? 'pointer' : 'default',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0
                      }}
                    >
                      {item.videoFront ? (
                        <>
                          <video src={resolveMediaUrl(item.videoFront)} playsInline muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={14} color="#ffffff" style={{ marginLeft: 2 }} />
                          </div>
                        </>
                      ) : (
                        <Video size={24} color="#64748b" />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                          {item.word}
                        </h3>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-pill)' }}>
                          {item.topicLabel}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-pill)' }}>
                          {item.dialect}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 0.35rem 0' }}>
                        {item.description || 'Không có mô tả chi tiết'}
                      </p>

                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.65rem' }}>
                        <span>Đề xuất bởi: <strong>{item.authorName}</strong></span>
                        <span>•</span>
                        <span>Độ khó: {item.difficulty}</span>
                        {item.handShape && (
                          <>
                            <span>•</span>
                            <span>Tay: {item.handShape}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Badge & Action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a' }}>
                        {item.supportRate}% ỦNG HỘ
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        👍 {item.upvotes} / {item.totalVotes} đánh giá
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleAdminApprove(item)}
                        style={{
                          padding: '0.55rem 1rem',
                          borderRadius: 'var(--radius-pill)',
                          border: 'none',
                          backgroundColor: '#22c55e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.3)',
                          transition: 'background 0.15s'
                        }}
                      >
                        <Check size={16} strokeWidth={2.5} />
                        <span>Duyệt từ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRejectModalState({ isOpen: true, item, reason: '' })}
                        style={{
                          padding: '0.55rem 0.9rem',
                          borderRadius: 'var(--radius-pill)',
                          border: '1.5px solid #fca5a5',
                          backgroundColor: '#ffffff',
                          color: '#dc2626',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'background 0.15s'
                        }}
                      >
                        <X size={16} strokeWidth={2.5} />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Đăng từ mới */}
      <PostCommunityWordModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={(newWord) => {
          showToast(`Đã đăng từ "${newWord.word}" lên cộng đồng thành công! 🎉`);
          fetchCommunityData();
        }}
      />

      {/* Modal Xem Video Preview */}
      {previewVideo && (
        <div className="modal-overlay" onClick={() => setPreviewVideo(null)} style={{ zIndex: 1200 }}>
          <div 
            className="modal-content animate-scale" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640, width: '92%', padding: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden', backgroundColor: '#000000' }}
          >
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                Ký hiệu: {previewVideo.title}
              </span>
              <button 
                onClick={() => setPreviewVideo(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>
            <video
              src={resolveMediaUrl(previewVideo.url)}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', maxHeight: 420, display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* Modal Quản trị viên nhập lý do từ chối */}
      {rejectModalState.isOpen && (
        <div className="modal-overlay" onClick={() => setRejectModalState({ isOpen: false, item: null, reason: '' })} style={{ zIndex: 1200 }}>
          <div 
            className="modal-content animate-scale" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, width: '92%', padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Từ chối từ cộng đồng "{rejectModalState.item?.word}"
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              Vui lòng nhập lý do từ chối để thông báo lại cho cộng đồng và người đề xuất:
            </p>
            <textarea
              rows={3}
              placeholder="VD: Cử chỉ chưa chính xác về hình bàn tay, video bị mờ hoặc trùng lặp với từ vựng hiện có..."
              value={rejectModalState.reason}
              onChange={(e) => setRejectModalState(prev => ({ ...prev, reason: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '1.25rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn-pill btn-secondary btn-sm"
                onClick={() => setRejectModalState({ isOpen: false, item: null, reason: '' })}
              >
                Hủy
              </button>
              <button
                className="btn-pill btn-sm"
                onClick={handleConfirmReject}
                style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none' }}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
