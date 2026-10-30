import React, { useState, useMemo } from 'react';
import { useSignWords, deleteWordById } from '../../data/wordsStore';
import AddWordModal from './AddWordModal';
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
  ExternalLink,
  BookOpen
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
  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Minh Anh', email: 'minhanh@edu.vn', status: 'active' },
    { id: 2, name: 'Bảo Ngọc', email: 'baongoc@gmail.com', status: 'active' },
    { id: 3, name: 'Hoàng Nam (Spam)', email: 'namvu@spam.net', status: 'suspended' },
  ]);

  const handleToggleUser = (id) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  const triggerPreprocessing = () => {
    setIsProcessing(true);
    setProcessedLog(['🚀 Quét toàn bộ video chuyên gia...']);
    setTimeout(() => {
      setProcessedLog(prev => [...prev, '🤖 Trích xuất vector MediaPipe Holistic 3D...']);
    }, 1000);
    setTimeout(() => {
      setProcessedLog(prev => [
        ...prev,
        '💾 Đã xuất benchmark_vectors.npy & benchmark_landmarks.json',
        '✅ Hoàn tất tiền xử lý 100%!'
      ]);
      setIsProcessing(false);
    }, 2200);
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
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', overflowX: 'auto' }}>
        {[
          { id: 'words', label: 'Quản lý Từ vựng', icon: Database },
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
            >
              <Icon size={14} />
              <span>{t.label}</span>
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
                <option value="all">Tất cả chủ đề</option>
                <option value="greeting">👋 Chào hỏi</option>
                <option value="family">👨‍👩‍👧‍👦 Gia đình</option>
                <option value="food">🍲 Ẩm thực</option>
                <option value="daily">💬 Giao tiếp hàng ngày</option>
                <option value="numbers">🔢 Số đếm</option>
                <option value="alphabet">🔤 Chữ cái</option>
              </select>
            </div>
          </div>

          {/* Table List */}
          <div className="mini-card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: '#64748b', backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '0.65rem 0.55rem', whiteSpace: 'nowrap' }}>Từ vựng</th>
                    <th style={{ padding: '0.65rem 0.55rem', whiteSpace: 'nowrap' }}>Chủ đề</th>
                    <th style={{ padding: '0.65rem 0.55rem', whiteSpace: 'nowrap' }}>Phương ngữ</th>
                    <th style={{ padding: '0.65rem 0.55rem', whiteSpace: 'nowrap', textAlign: 'center' }}>Video</th>
                    <th style={{ padding: '0.65rem 0.55rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWords.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        Không tìm thấy từ vựng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredWords.map(w => {
                      const isVideo = w.videoFront && (
                        w.videoFront.endsWith('.mp4') ||
                        w.videoFront.endsWith('.webm') ||
                        w.videoFront.startsWith('blob:') ||
                        w.videoFront.startsWith('/uploads/') ||
                        w.videoFront.includes('chao.mp4')
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
        <div className="mini-card" style={{ padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: '#64748b' }}>
                <th style={{ padding: '0.5rem' }}>Họ tên</th>
                <th style={{ padding: '0.5rem' }}>Email</th>
                <th style={{ padding: '0.5rem' }}>Trạng thái</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700 }}>{u.name}</td>
                  <td style={{ padding: '0.65rem 0.5rem', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{ color: u.status === 'active' ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
                      {u.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>
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
                previewWord.videoFront.includes('chao.mp4')
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
    </div>
  );
}
