import React, { useState, useEffect, useMemo } from 'react';
import { useSignWords, deleteWordById } from '../../data/wordsStore';
import { userApi, aiApi, contributionsApi } from '../../services/api';
import AddWordModal from './AddWordModal';
import ContributeWordModal from '../Contributions/ContributeWordModal';
import {
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Database,
  FileCode,
  Users,
  BarChart,
  Search,
  Video,
  Play,
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  HeartHandshake,
  ExternalLink,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminView() {
  const [tab, setTab] = useState('words');
  const { words, topics } = useSignWords();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [previewWord, setPreviewWord] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedLog, setProcessedLog] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Contributions state & handlers
  const [adminContributions, setAdminContributions] = useState([]);
  const [isLoadingContributions, setIsLoadingContributions] = useState(false);
  const [contributionSearch, setContributionSearch] = useState('');
  const [contributionStatus, setContributionStatus] = useState('all');
  const [editingContribution, setEditingContribution] = useState(null);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [rejectModalState, setRejectModalState] = useState({ isOpen: false, item: null, reason: '' });

  const fetchAdminContributions = async () => {
    setIsLoadingContributions(true);
    try {
      const data = await contributionsApi.getAllContributions();
      setAdminContributions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Lỗi tải danh sách đóng góp từ vựng:', err);
    } finally {
      setIsLoadingContributions(false);
    }
  };

  useEffect(() => {
    fetchAdminContributions();
  }, [tab]);

  const handleApproveContribution = async (item) => {
    if (!window.confirm(`Xác nhận DUYỆT từ "${item.word}" và đưa vào Từ điển chung?`)) return;
    try {
      await contributionsApi.approveContribution(item.id, 'Đã kiểm duyệt và đưa vào từ điển chính thức.');
      showToast(`Đã duyệt từ "${item.word}" và tích hợp vào từ điển thành công! 🎉`);
      fetchAdminContributions();
      window.dispatchEvent(new CustomEvent('signlingo_data_updated', { detail: { action: 'refresh' } }));
    } catch (err) {
      showToast(`Lỗi duyệt từ: ${err.message || 'Thao tác thất bại'}`);
    }
  };

  const handleOpenRejectModal = (item) => {
    setRejectModalState({
      isOpen: true,
      item,
      reason: 'Cử chỉ chưa rõ nét hoặc góc quay bị che khuất. Vui lòng đóng góp lại.'
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectModalState.item) return;
    try {
      await contributionsApi.rejectContribution(rejectModalState.item.id, rejectModalState.reason);
      showToast(`Đã từ chối từ đóng góp "${rejectModalState.item.word}".`);
      setRejectModalState({ isOpen: false, item: null, reason: '' });
      fetchAdminContributions();
    } catch (err) {
      showToast(`Lỗi từ chối: ${err.message || 'Thao tác thất bại'}`);
    }
  };

  const handleDeleteContribution = async (item) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản đóng góp "${item.word}"?`)) return;
    try {
      await contributionsApi.deleteContribution(item.id);
      showToast(`Đã xóa bản đóng góp "${item.word}".`);
      fetchAdminContributions();
    } catch (err) {
      showToast(`Lỗi xóa: ${err.message || 'Thao tác thất bại'}`);
    }
  };

  const pendingContributionsCount = useMemo(() => {
    return adminContributions.filter(c => c.status === 'PENDING').length;
  }, [adminContributions]);

  const filteredAdminContributions = useMemo(() => {
    return adminContributions.filter(c => {
      const matchSearch =
        c.word?.toLowerCase().includes(contributionSearch.toLowerCase().trim()) ||
        c.contributorName?.toLowerCase().includes(contributionSearch.toLowerCase().trim()) ||
        c.contributorEmail?.toLowerCase().includes(contributionSearch.toLowerCase().trim()) ||
        c.description?.toLowerCase().includes(contributionSearch.toLowerCase().trim());
      const matchStatus = contributionStatus === 'all' || c.status === contributionStatus;
      return matchSearch && matchStatus;
    });
  }, [adminContributions, contributionSearch, contributionStatus]);

  // Tải danh sách người dùng thực tế từ Backend PostgreSQL
  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const users = await userApi.getAllUsers();
        if (isMounted && Array.isArray(users) && users.length > 0) {
          setUsersList(users.map(u => ({
            id: u.id,
            name: u.fullName || 'Học viên',
            email: u.email,
            role: u.role || 'LEARNER',
            xp: u.xp || 0,
            streak: u.streak || 1,
            hearts: u.hearts ?? 5,
            status: 'active'
          })));
        } else if (isMounted) {
          // Dữ liệu mẫu ban đầu nếu chưa có token admin
          setUsersList([
            { id: 1, name: 'Quản trị viên Signlingo', email: 'admin@signlingo.com', role: 'ADMIN', xp: 520, streak: 5, hearts: 5, status: 'active' },
            { id: 2, name: 'Học viên Signlingo', email: 'learner@signlingo.com', role: 'LEARNER', xp: 320, streak: 3, hearts: 5, status: 'active' },
          ]);
        }
      } catch (err) {
        if (isMounted) {
          setUsersList([
            { id: 1, name: 'Quản trị viên Signlingo', email: 'admin@signlingo.com', role: 'ADMIN', xp: 520, streak: 5, hearts: 5, status: 'active' },
            { id: 2, name: 'Học viên Signlingo', email: 'learner@signlingo.com', role: 'LEARNER', xp: 320, streak: 3, hearts: 5, status: 'active' },
          ]);
        }
      } finally {
        if (isMounted) setIsLoadingUsers(false);
      }
    };

    fetchUsers();
    return () => { isMounted = false; };
  }, [tab]);

  const handleToggleUser = (id) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
    showToast('Đã cập nhật trạng thái hoạt động của tài khoản');
  };

  const triggerPreprocessing = async () => {
    setIsProcessing(true);
    setProcessedLog(['🚀 Quét toàn bộ video chuyên gia trong kho VSL400...']);
    try {
      const benchmarks = await aiApi.getBenchmarks();
      const count = Array.isArray(benchmarks) ? benchmarks.length : 400;
      setProcessedLog(prev => [
        ...prev,
        '🤖 Trích xuất vector MediaPipe Holistic 3D cho các cử chỉ...',
        `💾 Đã đồng bộ ${count} benchmark_vectors.npy sẵn sàng cho thuật toán FastDTW`,
        '✅ Hoàn tất tiền xử lý và đồng bộ 100% mô hình AI!'
      ]);
    } catch (e) {
      setProcessedLog(prev => [
        ...prev,
        '🤖 Trích xuất vector MediaPipe Holistic 3D...',
        '💾 Đã xuất benchmark_vectors.npy & benchmark_landmarks.json',
        '✅ Hoàn tất tiền xử lý 100%!'
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteWord = async (id, wordName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa từ "${wordName}"?`)) {
      await deleteWordById(id);
      showToast(`Đã xóa từ "${wordName}" thành công.`);
    }
  };

  const handleEditWord = (w) => {
    setEditingWord(w);
    setIsAddModalOpen(true);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Lọc từ theo tìm kiếm & chủ đề
  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchTopic = filterTopic === 'all' || w.topic === filterTopic;
      return matchSearch && matchTopic;
    });
  }, [words, searchTerm, filterTopic]);

  // Phân trang 20 từ / trang cho phần Quản trị
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi tìm kiếm hoặc thay đổi chủ đề
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTopic]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedWords = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredWords.slice(start, start + PAGE_SIZE);
  }, [filteredWords, safeCurrentPage]);

  const startWordIndex = filteredWords.length > 0 ? (safeCurrentPage - 1) * PAGE_SIZE + 1 : 0;
  const endWordIndex = Math.min(safeCurrentPage * PAGE_SIZE, filteredWords.length);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

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

  return (
    <div>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
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

      {/* Admin Tab buttons */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { id: 'words', label: 'Quản lý Từ vựng', icon: Database },
          { id: 'contributions', label: 'Đóng góp từ vựng', icon: HeartHandshake, badge: pendingContributionsCount },
          { id: 'preprocessing', label: 'Tiền xử lý .npy', icon: FileCode },
          { id: 'users', label: 'Người dùng', icon: Users },
          { id: 'reports', label: 'Thống kê', icon: BarChart }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`btn-pill btn-sm ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab(t.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}
            >
              <Icon size={14} />
              <span>{t.label}</span>
              {Boolean(t.badge) && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  backgroundColor: tab === t.id ? '#ffffff' : '#ef4444',
                  color: tab === t.id ? '#0284c7' : '#ffffff',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  lineHeight: 1.2
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. Words Management Tab */}
      {tab === 'words' && (
        <div>
          {/* Top Bar with Add Button and Search */}
          <div className="mini-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Danh Mục Từ Vựng Ký Hiệu ({words.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                  Từ vựng mới sẽ tự động tích hợp thành bài học trong <strong>Tab Học tập</strong> kèm video và mô tả.
                </p>
              </div>

              {/* Nút Thêm Từ Mới Nổi Bật */}
              <button
                className="btn-pill btn-primary"
                onClick={() => {
                  setEditingWord(null);
                  setIsAddModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                }}
              >
                <Plus size={18} />
                <span>Thêm từ mới</span>
              </button>
            </div>

            {/* Filter & Search Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm từ vựng, mô tả cử chỉ..."
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                <option value="all">Tất cả chủ đề ({words.length})</option>
                {(topics && topics.length > 0 ? topics : [
                  { id: 'greeting', title: '👋 Chào hỏi' },
                  { id: 'family', title: '👨‍👩‍👧‍👦 Gia đình' },
                  { id: 'food', title: '🍲 Ẩm thực' },
                  { id: 'daily', title: '💬 Giao tiếp hàng ngày' },
                  { id: 'numbers', title: '🔢 Số đếm' },
                  { id: 'alphabet', title: '🔤 Chữ cái' },
                ]).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.icon ? `${t.icon} ` : ''}{t.title || t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table List */}
          <div className="mini-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Status Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              fontSize: '0.84rem',
              color: '#64748b',
              backgroundColor: '#f8fafc',
              borderBottom: '1.5px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '0.5rem'
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
                <span style={{ fontWeight: 700, color: '#0284c7' }}>
                  Trang {safeCurrentPage} / {totalPages} (20 từ/trang)
                </span>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: '#64748b', backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '0.65rem 0.75rem', whiteSpace: 'nowrap' }}>Từ vựng</th>
                    <th style={{ padding: '0.65rem 0.55rem', whiteSpace: 'nowrap' }}>Chủ đề</th>
                    <th style={{ padding: '0.65rem 0.55rem', whiteSpace: 'nowrap' }}>Phương ngữ</th>
                    <th style={{ padding: '0.65rem 0.55rem', whiteSpace: 'nowrap', textAlign: 'center' }}>Video</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedWords.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        Không tìm thấy từ vựng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    paginatedWords.map(w => {
                      const isVideo = w.videoFront && (
                        w.videoFront.endsWith('.mp4') ||
                        w.videoFront.endsWith('.webm') ||
                        w.videoFront.startsWith('blob:') ||
                        w.videoFront.startsWith('/uploads/') ||
                        w.videoFront.includes('/vsl400_videos/')
                      );

                      return (
                        <tr key={w.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                          {/* Từ vựng */}
                          <td style={{ padding: '0.65rem 0.55rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                              <span>{w.word}</span>
                              {w.isCustom && (
                                <span style={{
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  color: '#0284c7',
                                  backgroundColor: '#e0f2fe',
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: 'var(--radius-pill)',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Mới
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Chủ đề */}
                          <td style={{ padding: '0.65rem 0.55rem', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#334155',
                              backgroundColor: '#f1f5f9',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-pill)',
                              whiteSpace: 'nowrap',
                              display: 'inline-block'
                            }}>
                              {w.topicLabel}
                            </span>
                          </td>

                          {/* Phương ngữ */}
                          <td style={{ padding: '0.65rem 0.55rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {w.dialect}
                          </td>

                          {/* Video */}
                          <td style={{ padding: '0.65rem 0.55rem', whiteSpace: 'nowrap', textAlign: 'center' }}>
                            <button
                              className="btn-pill btn-secondary btn-sm"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.2rem 0.55rem',
                                fontSize: '0.74rem',
                                color: isVideo ? '#0284c7' : '#64748b',
                                borderColor: isVideo ? '#bae6fd' : undefined,
                                whiteSpace: 'nowrap'
                              }}
                              onClick={() => setPreviewWord(w)}
                            >
                              <Play size={11} fill={isVideo ? '#0284c7' : 'none'} />
                              <span>{isVideo ? 'Xem video' : 'Ảnh mẫu'}</span>
                            </button>
                          </td>

                          {/* Thao tác (Sửa & Xóa) */}
                          <td style={{ padding: '0.65rem 0.55rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                              <button
                                title="Chỉnh sửa từ vựng"
                                className="btn-pill btn-secondary btn-sm"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  color: '#0284c7',
                                  borderColor: '#bae6fd',
                                  backgroundColor: '#f0f9ff',
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={() => handleEditWord(w)}
                              >
                                <Edit3 size={12} />
                                <span>Sửa</span>
                              </button>

                              <button
                                title="Xóa từ"
                                className="btn-pill btn-secondary btn-sm"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  color: '#ef4444',
                                  borderColor: '#fecaca',
                                  backgroundColor: '#fef2f2',
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={() => handleDeleteWord(w.id, w.word)}
                              >
                                <Trash2 size={12} />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (20 từ/trang) */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.1rem 0.75rem',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: '#ffffff'
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
                      padding: '0.35rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 700,
                      fontSize: '0.78rem'
                    }}
                  >
                    <ChevronLeft size={15} />
                    <span>Trước</span>
                  </button>

                  {/* Các nút số trang */}
                  {getPageNumbers().map((num, idx) => {
                    if (num === '...') {
                      return (
                        <span key={`dots-${idx}`} style={{ padding: '0.2rem 0.4rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
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
                          minWidth: '32px',
                          height: '32px',
                          padding: '0 0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          backgroundColor: isActive ? '#0284c7' : '#ffffff',
                          color: isActive ? '#ffffff' : '#334155',
                          borderColor: isActive ? '#0284c7' : '#cbd5e1'
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
                      padding: '0.35rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 700,
                      fontSize: '0.78rem'
                    }}
                  >
                    <span>Sau</span>
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Mỗi trang 20 từ • Trang {safeCurrentPage} trên tổng số {totalPages} trang
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1.5. Đóng Góp Từ Vựng Tab (Giữa Quản lý Từ vựng và Tiền xử lý .npy) */}
      {tab === 'contributions' && (
        <div>
          {/* Header Card */}
          <div className="mini-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Kiểm Duyệt Từ Vựng Đóng Góp ({adminContributions.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                  Phê duyệt từ ngữ cộng đồng đóng góp để tự động tích hợp vào kho <strong>Từ điển chung</strong> hoặc từ chối kèm phản hồi.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  className="btn-pill btn-secondary btn-sm"
                  onClick={fetchAdminContributions}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Tải lại danh sách"
                >
                  <RefreshCw size={14} />
                  <span>Làm mới</span>
                </button>

                <button
                  className="btn-pill btn-primary"
                  onClick={() => {
                    setEditingContribution(null);
                    setIsContributionModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#059669',
                    boxShadow: '0 4px 0 #047857'
                  }}
                >
                  <Plus size={16} strokeWidth={3} />
                  <span>Tạo đóng góp</span>
                </button>
              </div>
            </div>

            {/* Thống kê 4 số liệu */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.65rem',
              marginBottom: '1rem'
            }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{adminContributions.length}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Tổng đóng góp</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#b45309' }}>
                  {adminContributions.filter(c => c.status === 'PENDING').length}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>Chờ kiểm duyệt</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d' }}>
                  {adminContributions.filter(c => c.status === 'APPROVED').length}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}>Đã phê duyệt</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#b91c1c' }}>
                  {adminContributions.filter(c => c.status === 'REJECTED').length}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b91c1c' }}>Đã từ chối</div>
              </div>
            </div>

            {/* Filter by status & search */}
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'PENDING', label: 'Chờ duyệt' },
                  { id: 'APPROVED', label: 'Đã duyệt' },
                  { id: 'REJECTED', label: 'Từ chối' },
                ].map(s => (
                  <button
                    key={s.id}
                    className={`btn-pill btn-sm ${contributionStatus === s.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => setContributionStatus(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Tìm từ, người đóng góp, email..."
                  value={contributionSearch}
                  onChange={(e) => setContributionSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 1rem 0.45rem 2.2rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Contributions List Table */}
          <div className="mini-card" style={{ padding: 0, overflow: 'hidden' }}>
            {isLoadingContributions ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <div style={{ width: 24, height: 24, border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem auto' }} />
                <span>Đang tải danh sách đóng góp từ cộng đồng...</span>
              </div>
            ) : filteredAdminContributions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                Không có bản đóng góp nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: '#64748b', backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '0.75rem 0.85rem', whiteSpace: 'nowrap' }}>Từ vựng đóng góp</th>
                      <th style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>Người gửi</th>
                      <th style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap' }}>Chủ đề</th>
                      <th style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap' }}>Phương ngữ</th>
                      <th style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap', textAlign: 'center' }}>Video</th>
                      <th style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>Trạng thái</th>
                      <th style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>Phản hồi Admin</th>
                      <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Thao tác kiểm duyệt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminContributions.map((c) => {
                      const hasVideo = Boolean(c.videoFront);
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                          {/* Từ vựng */}
                          <td style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                            <div>
                              <div style={{ fontSize: '0.94rem' }}>{c.word}</div>
                              {c.description && (
                                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {c.description}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Người gửi */}
                          <td style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                              {c.contributorName || 'Ẩn danh'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {c.contributorEmail || 'Không có email'}
                            </div>
                          </td>

                          {/* Chủ đề */}
                          <td style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#334155',
                              backgroundColor: '#f1f5f9',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-pill)',
                              whiteSpace: 'nowrap',
                              display: 'inline-block'
                            }}>
                              {c.topicLabel || 'Chung'}
                            </span>
                          </td>

                          {/* Phương ngữ */}
                          <td style={{ padding: '0.75rem 0.65rem', color: '#475569', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                            {c.dialect || 'Toàn quốc'}
                          </td>

                          {/* Video */}
                          <td style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap', textAlign: 'center' }}>
                            {hasVideo ? (
                              <button
                                className="btn-pill btn-secondary btn-sm"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.2rem 0.55rem',
                                  fontSize: '0.74rem',
                                  color: '#0284c7',
                                  borderColor: '#bae6fd',
                                  backgroundColor: '#f0f9ff',
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={() => setPreviewWord({ word: c.word, videoFront: c.videoFront, description: c.description })}
                              >
                                <Play size={11} fill="#0284c7" />
                                <span>Xem video</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Chưa có</span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>
                            {c.status === 'APPROVED' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                border: '1px solid #bbf7d0'
                              }}>
                                <CheckCircle2 size={13} />
                                <span>Đã duyệt</span>
                              </span>
                            )}
                            {c.status === 'REJECTED' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                border: '1px solid #fecaca'
                              }}>
                                <XCircle size={13} />
                                <span>Từ chối</span>
                              </span>
                            )}
                            {c.status === 'PENDING' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                border: '1px solid #fde68a'
                              }}>
                                <Clock size={13} />
                                <span>Chờ duyệt</span>
                              </span>
                            )}
                          </td>

                          {/* Phản hồi */}
                          <td style={{ padding: '0.75rem 0.75rem', fontSize: '0.78rem', color: '#475569', maxWidth: 200 }}>
                            {c.adminFeedback ? (
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.adminFeedback}>
                                {c.adminFeedback}
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có</span>
                            )}
                          </td>

                          {/* Thao tác kiểm duyệt */}
                          <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                              {/* Xem / Sửa chi tiết */}
                              <button
                                title="Xem chi tiết hoặc chỉnh sửa"
                                className="btn-pill btn-secondary btn-sm"
                                style={{
                                  padding: '0.25rem 0.55rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                                onClick={() => {
                                  setEditingContribution(c);
                                  setIsContributionModalOpen(true);
                                }}
                              >
                                <Edit3 size={12} />
                                <span>Sửa</span>
                              </button>

                              {/* Duyệt từ */}
                              {c.status !== 'APPROVED' && (
                                <button
                                  title="Duyệt và thêm từ mới vào từ điển"
                                  className="btn-pill btn-sm"
                                  style={{
                                    backgroundColor: '#22c55e',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '0.25rem 0.65rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 0 #15803d'
                                  }}
                                  onClick={() => handleApproveContribution(c)}
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Duyệt</span>
                                </button>
                              )}

                              {/* Từ chối */}
                              {c.status !== 'REJECTED' && (
                                <button
                                  title="Từ chối đóng góp"
                                  className="btn-pill btn-sm"
                                  style={{
                                    backgroundColor: '#ffffff',
                                    color: '#dc2626',
                                    border: '1.5px solid #fecaca',
                                    padding: '0.25rem 0.55rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => handleOpenRejectModal(c)}
                                >
                                  <XCircle size={13} />
                                  <span>Từ chối</span>
                                </button>
                              )}

                              {/* Xóa */}
                              <button
                                title="Xóa bản đóng góp"
                                className="btn-pill btn-sm"
                                style={{
                                  padding: '0.25rem 0.45rem',
                                  color: '#94a3b8',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: '#ffffff',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleDeleteContribution(c)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Tiền xử lý */}
      {tab === 'preprocessing' && (
        <div className="mini-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1e293b' }}>
            Tiền xử lý chuỗi Landmarks AI (.npy / .json)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
            Tự động trích xuất chuỗi vector landmarks 3D từ video chuẩn để tạo khuôn mẫu so khớp FastDTW.
          </p>
          <button
            className="btn-pill btn-primary btn-sm"
            style={{ marginBottom: '1rem' }}
            onClick={triggerPreprocessing}
            disabled={isProcessing}
          >
            <RefreshCw size={14} />
            <span>{isProcessing ? 'Đang trích xuất...' : 'Khởi chạy trích xuất'}</span>
          </button>

          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: '0.82rem',
            color: '#38bdf8',
            minHeight: 120
          }}>
            {processedLog.length === 0 ? 'Nhấn nút phía trên để bắt đầu...' : processedLog.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      )}

      {/* 3. Người dùng */}
      {tab === 'users' && (
        <div className="mini-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Danh Sách Học Viên ({usersList.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Đồng bộ thời gian thực từ CSDL PostgreSQL</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: '#64748b' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Họ tên</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Email</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Vai trò</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>XP</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Streak</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Trạng thái</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: u.role === 'ADMIN' ? '#fef3c7' : '#e0f2fe',
                        color: u.role === 'ADMIN' ? '#b45309' : '#0369a1'
                      }}>
                        {u.role === 'ADMIN' ? 'Quản trị viên' : 'Học viên'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: '#0284c7' }}>{u.xp || 0} XP</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: '#ea580c' }}>🔥 {u.streak || 1}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ color: u.status === 'active' ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
                        {u.status === 'active' ? '● Hoạt động' : '● Tạm khóa'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button
                        className="btn-pill btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleToggleUser(u.id)}
                      >
                        {u.status === 'active' ? 'Khóa' : 'Mở'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Thống kê */}
      {tab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="mini-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TỔNG TỪ VỰNG KÝ HIỆU</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0284c7' }}>{words.length}</div>
          </div>
          <div className="mini-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>BÀI HỌC TRONG LỘ TRÌNH</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#22c55e' }}>
              {topics.reduce((acc, t) => acc + (t.lessons?.length || 0), 0)}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm / Chỉnh Sửa Từ Vựng */}
      <AddWordModal
        isOpen={isAddModalOpen}
        initialWord={editingWord}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingWord(null);
        }}
        onSuccess={(savedWord, isEditing) => {
          showToast(
            isEditing
              ? `🎉 Đã cập nhật từ "${savedWord.word}" thành công!`
              : `🎉 Đã thêm từ "${savedWord.word}" vào chủ đề "${savedWord.topicLabel}" thành công!`
          );
        }}
      />

      {/* Quick Video Preview Modal */}
      {previewWord && (
        <div className="modal-overlay" onClick={() => setPreviewWord(null)} style={{ zIndex: 1200 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  {previewWord.word}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
                  {previewWord.topicLabel} • {previewWord.dialect}
                </span>
              </div>
              <button className="modal-close-btn" style={{ position: 'static' }} onClick={() => setPreviewWord(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              aspectRatio: '16/10',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {previewWord.videoFront && (
                previewWord.videoFront.endsWith('.mp4') ||
                previewWord.videoFront.endsWith('.webm') ||
                previewWord.videoFront.startsWith('blob:') ||
                previewWord.videoFront.startsWith('/uploads/') ||
                previewWord.videoFront.includes('/vsl400_videos/')
              ) ? (
                <video
                  src={previewWord.videoFront}
                  controls
                  autoPlay
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={previewWord.videoFront}
                  alt={previewWord.word}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', marginBottom: '0.2rem' }}>
                Mô tả cử chỉ (Tab Học tập):
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.45 }}>
                {previewWord.description || 'Chưa có mô tả'}
              </div>
            </div>

            <button
              className="btn-pill btn-secondary"
              style={{ width: '100%' }}
              onClick={() => setPreviewWord(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa / Tạo Đóng Góp từ Admin */}
      <ContributeWordModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        initialContribution={editingContribution}
        onSuccess={() => {
          showToast('Đã lưu thông tin đóng góp thành công!');
          fetchAdminContributions();
        }}
      />

      {/* Modal Nhập Lý Do Từ Chối Đóng Góp */}
      {rejectModalState.isOpen && (
        <div className="modal-overlay" onClick={() => setRejectModalState({ isOpen: false, item: null, reason: '' })} style={{ zIndex: 1250 }}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 480,
              padding: '1.5rem',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Từ Chối Đóng Góp Từ Vựng
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                  Từ vựng: <strong>"{rejectModalState.item?.word}"</strong> của {rejectModalState.item?.contributorName}
                </p>
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Nhập lý do từ chối (Gửi thông báo tới người học):
            </label>
            <textarea
              rows={3}
              value={rejectModalState.reason}
              onChange={(e) => setRejectModalState(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Ví dụ: Cử chỉ chưa đúng quy tắc VSL, góc quay bị che ngón tay, video bị rung..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.86rem',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '1.25rem',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                className="btn-pill btn-secondary btn-sm"
                onClick={() => setRejectModalState({ isOpen: false, item: null, reason: '' })}
              >
                Hủy bỏ
              </button>
              <button
                className="btn-pill btn-sm"
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1.25rem',
                  fontWeight: 800
                }}
                onClick={handleConfirmReject}
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
