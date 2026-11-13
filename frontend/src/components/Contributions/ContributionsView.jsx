import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartHandshake,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Video,
  Edit3,
  X,
  Sparkles
} from 'lucide-react';
import { contributionsApi } from '../../services/api';
import ContributeWordModal from './ContributeWordModal';

export default function ContributionsView() {
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [toastMsg, setToastMsg] = useState('');

  const fetchMyContributions = async () => {
    setIsLoading(true);
    try {
      const data = await contributionsApi.getMyContributions();
      setContributions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Lỗi lấy danh sách đóng góp:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyContributions();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSuccessContribution = (savedItem, isEditing) => {
    showToast(isEditing ? 'Đã cập nhật từ vựng đóng góp thành công!' : 'Đã gửi đóng góp từ vựng mới thành công! Chờ Ban quản trị duyệt.');
    fetchMyContributions();
  };

  // Lọc theo tìm kiếm và trạng thái
  const filteredList = useMemo(() => {
    return contributions.filter((item) => {
      const matchSearch =
        item.word?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.topicLabel?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [contributions, searchQuery, statusFilter]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = contributions.length;
    const pending = contributions.filter((c) => c.status === 'PENDING').length;
    const approved = contributions.filter((c) => c.status === 'APPROVED').length;
    const rejected = contributions.filter((c) => c.status === 'REJECTED').length;
    return { total, pending, approved, rejected };
  }, [contributions]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            fontSize: '0.78rem',
            fontWeight: 800,
            border: '1px solid #bbf7d0',
            whiteSpace: 'nowrap'
          }}>
            <CheckCircle2 size={14} />
            <span>Đã duyệt (Đã vào từ điển)</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontSize: '0.78rem',
            fontWeight: 800,
            border: '1px solid #fecaca',
            whiteSpace: 'nowrap'
          }}>
            <XCircle size={14} />
            <span>Từ chối</span>
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            fontSize: '0.78rem',
            fontWeight: 800,
            border: '1px solid #fde68a',
            whiteSpace: 'nowrap'
          }}>
            <Clock size={14} />
            <span>Chờ duyệt</span>
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-pill)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.88rem',
          fontWeight: 700,
          border: '1.5px solid #22c55e',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} color="#22c55e" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(5, 150, 105, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '0.3rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: 800,
              marginBottom: '0.75rem'
            }}>
              <HeartHandshake size={16} />
              <span>CỘNG ĐỒNG ĐÓNG GÓP TỪ VỰNG</span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', fontWeight: 900, margin: '0 0 0.5rem 0', lineHeight: 1.25 }}>
              Đóng Góp Từ Vựng Mới
            </h1>

            <p style={{ fontSize: '0.94rem', opacity: 0.95, margin: 0, lineHeight: 1.55 }}>
              Cùng Signlingo mở rộng kho dữ liệu Ngôn ngữ Ký hiệu Việt Nam. Mỗi cử chỉ bạn đóng góp sẽ được Ban quản trị duyệt và chia sẻ tới toàn bộ cộng đồng người học!
            </p>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="btn-pill btn-primary"
            style={{
              backgroundColor: '#ffffff',
              color: '#059669',
              boxShadow: '0 4px 0 rgba(0, 0, 0, 0.15)',
              padding: '0.85rem 1.75rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={20} strokeWidth={3} />
            <span>Đóng góp từ mới</span>
          </button>
        </div>
      </div>

      {/* 2. Thẻ Thống Kê 4 Chỉ Số */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.5rem'
      }}>
        <div className="mini-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>{stats.total}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Tổng từ đã đóng góp</div>
          </div>
        </div>

        <div className="mini-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#b45309' }}>{stats.pending}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Chờ kiểm duyệt</div>
          </div>
        </div>

        <div className="mini-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#15803d' }}>{stats.approved}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Đã được duyệt</div>
          </div>
        </div>

        <div className="mini-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#b91c1c' }}>{stats.rejected}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Bị từ chối</div>
          </div>
        </div>
      </div>

      {/* 3. Thanh Tìm Kiếm & Lọc Trạng Thái */}
      <div className="mini-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Tabs Trạng thái */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: `Tất cả (${stats.total})` },
              { id: 'PENDING', label: `Chờ duyệt (${stats.pending})` },
              { id: 'APPROVED', label: `Đã duyệt (${stats.approved})` },
              { id: 'REJECTED', label: `Từ chối (${stats.rejected})` },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn-pill btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.82rem',
                  padding: '0.4rem 0.85rem',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ô Tìm kiếm */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: 320 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm từ đã đóng góp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem 0.55rem 2.25rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              onClick={fetchMyContributions}
              className="btn-pill btn-secondary btn-sm"
              style={{ padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Danh Sách Các Từ Đã Đóng Góp */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <div style={{ width: 28, height: 28, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem auto' }} />
          <span>Đang tải danh sách đóng góp của bạn...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px dashed #cbd5e1'
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <HeartHandshake size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            {contributions.length === 0
              ? 'Bạn chưa đóng góp từ vựng nào'
              : 'Không tìm thấy từ vựng nào phù hợp với bộ lọc'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: 460, margin: '0 auto 1.5rem auto' }}>
            Hãy chia sẻ các cử chỉ ký hiệu mới mà bạn biết để giúp cộng đồng người khiếm thính và người học VSL có thêm nhiều từ ngữ phong phú!
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="btn-pill btn-primary"
            style={{
              backgroundColor: '#059669',
              boxShadow: '0 4px 0 #047857',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={18} />
            <span>Đóng góp từ mới đầu tiên</span>
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid var(--border-color)', color: '#64748b' }}>
                  <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>Từ vựng đóng góp</th>
                  <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>Chủ đề</th>
                  <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>Phương ngữ</th>
                  <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap', textAlign: 'center' }}>Video mẫu</th>
                  <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>Trạng thái</th>
                  <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>Phản hồi từ Admin</th>
                  <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>Ngày gửi</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const hasVideo = Boolean(item.videoFront);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease' }}>
                      {/* Từ vựng */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.96rem' }}>{item.word}</span>
                          {item.description && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Chủ đề */}
                      <td style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid #e2e8f0'
                        }}>
                          {item.topicLabel || 'Chung'}
                        </span>
                      </td>

                      {/* Phương ngữ */}
                      <td style={{ padding: '0.85rem 0.75rem', color: '#475569', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        {item.dialect || 'Toàn quốc'}
                      </td>

                      {/* Video */}
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {hasVideo ? (
                          <button
                            onClick={() => setPreviewVideo(item)}
                            className="btn-pill btn-secondary btn-sm"
                            style={{
                              padding: '0.25rem 0.65rem',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: '#0284c7',
                              borderColor: '#bae6fd',
                              backgroundColor: '#f0f9ff'
                            }}
                          >
                            <Play size={12} fill="#0284c7" />
                            <span>Xem video</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Chưa có</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Phản hồi từ Admin */}
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', color: '#475569', maxWidth: 240 }}>
                        {item.adminFeedback ? (
                          <div style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            backgroundColor: item.status === 'APPROVED' ? '#f0fdf4' : item.status === 'REJECTED' ? '#fef2f2' : '#f8fafc',
                            border: `1px solid ${item.status === 'APPROVED' ? '#bbf7d0' : item.status === 'REJECTED' ? '#fecaca' : '#e2e8f0'}`,
                            fontSize: '0.8rem',
                            lineHeight: 1.4
                          }}>
                            {item.adminFeedback}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chờ xem xét</span>
                        )}
                      </td>

                      {/* Ngày gửi */}
                      <td style={{ padding: '0.85rem 0.75rem', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Thao tác */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {item.status !== 'APPROVED' ? (
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="btn-pill btn-secondary btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.3rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                            title="Sửa từ đã đóng góp"
                          >
                            <Edit3 size={13} />
                            <span>Sửa</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
                            ✓ Đã xuất bản
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Modal Đóng góp / Sửa Từ Vựng */}
      <ContributeWordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccessContribution}
        initialContribution={editingItem}
      />

      {/* 6. Video Preview Modal */}
      {previewVideo && (
        <div className="modal-overlay" onClick={() => setPreviewVideo(null)} style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 520,
              padding: '1.25rem',
              backgroundColor: '#0f172a',
              borderRadius: 'var(--radius-xl)',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Video size={18} color="#38bdf8" />
                <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  Video cử chỉ: "{previewVideo.word}"
                </span>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000000', aspectRatio: '16/9' }}>
              <video
                src={previewVideo.videoFront}
                controls
                autoPlay
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {previewVideo.description || 'Không có mô tả chi tiết.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
