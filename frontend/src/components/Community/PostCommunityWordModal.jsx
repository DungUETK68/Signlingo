import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Video, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  BookOpen, 
  MapPin,
  Play,
  Users
} from 'lucide-react';
import { uploadVideoFile } from '../../data/wordsStore';
import { communityApi } from '../../services/api';

const PRESET_TOPICS = [
  { id: 'greeting', label: 'Chào hỏi & Giao tiếp', icon: '👋' },
  { id: 'technology', label: 'Công nghệ & Mạng xã hội', icon: '💻' },
  { id: 'trending', label: 'Từ lóng & Giới trẻ', icon: '🔥' },
  { id: 'daily', label: 'Đời sống hiện đại', icon: '☕' },
  { id: 'food', label: 'Ẩm thực & Đồ uống', icon: '🍲' },
  { id: 'family', label: 'Gia đình & Xưng hô', icon: '👨‍👩‍👧‍👦' },
  { id: 'health', label: 'Y tế & Sức khỏe', icon: '🏥' },
  { id: 'education', label: 'Học tập & Nhà trường', icon: '🎓' },
];

const DIALECT_OPTIONS = [
  { id: 'Toàn quốc', label: 'Toàn quốc (Chuẩn chung)', flag: '🇻🇳' },
  { id: 'Miền Bắc', label: 'Miền Bắc (Hà Nội)', flag: '🔴' },
  { id: 'Miền Trung', label: 'Miền Trung (Huế, Đà Nẵng)', flag: '🟡' },
  { id: 'Miền Nam', label: 'Miền Nam (TP.HCM)', flag: '🔵' },
];

export default function PostCommunityWordModal({ isOpen, onClose, onSuccess }) {
  const [word, setWord] = useState('');
  const [topic, setTopic] = useState('technology');
  const [customTopicName, setCustomTopicName] = useState('');
  const [dialect, setDialect] = useState('Toàn quốc');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Dễ');
  const [duration, setDuration] = useState('3 phút');
  const [handShape, setHandShape] = useState('');
  const [movement, setMovement] = useState('');

  // Video state
  const [videoMethod, setVideoMethod] = useState('upload'); // 'upload' | 'url'
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const previewVideoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setWord('');
      setTopic('technology');
      setCustomTopicName('');
      setDialect('Toàn quốc');
      setDescription('');
      setDifficulty('Dễ');
      setDuration('3 phút');
      setHandShape('');
      setMovement('');
      setVideoMethod('upload');
      setVideoFile(null);
      setVideoUrl('');
      setVideoPreviewUrl('');
      setErrorMsg('');
      setShowAdvanced(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Vui lòng chọn file video hợp lệ (MP4, WebM, MOV)');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      setErrorMsg('Dung lượng video không được vượt quá 80MB');
      return;
    }

    setErrorMsg('');
    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setVideoUrl(val);
    setVideoPreviewUrl(val.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedWord = word.trim();
    if (!trimmedWord) {
      setErrorMsg('Vui lòng nhập tên từ vựng');
      return;
    }

    let finalTopicLabel = 'Chào hỏi & Giao tiếp';
    if (topic === 'custom') {
      if (!customTopicName.trim()) {
        setErrorMsg('Vui lòng nhập tên chuyên đề mới');
        return;
      }
      finalTopicLabel = customTopicName.trim();
    } else {
      const matched = PRESET_TOPICS.find(t => t.id === topic);
      if (matched) finalTopicLabel = matched.label;
    }

    setIsSubmitting(true);

    try {
      let finalVideoFront = '';

      if (videoMethod === 'upload') {
        if (videoFile) {
          try {
            const uploadRes = await uploadVideoFile(videoFile);
            finalVideoFront = typeof uploadRes === 'string' 
              ? uploadRes 
              : (uploadRes?.videoUrl || uploadRes?.previewUrl || '');
          } catch (uploadErr) {
            console.warn('Lỗi upload video máy chủ Python AI, lưu URL tạm thời:', uploadErr);
            finalVideoFront = typeof videoPreviewUrl === 'string' ? videoPreviewUrl : '';
          }
        }
      } else {
        finalVideoFront = typeof videoUrl === 'string' ? videoUrl.trim() : '';
      }

      if (!finalVideoFront) {
        finalVideoFront = typeof videoPreviewUrl === 'string' ? videoPreviewUrl : '';
      }

      const payload = {
        word: trimmedWord,
        topic: topic === 'custom' ? 'custom' : topic,
        topicLabel: finalTopicLabel,
        dialect,
        description: description.trim(),
        difficulty,
        duration,
        handShape: handShape.trim(),
        movement: movement.trim(),
        videoFront: finalVideoFront,
      };

      await communityApi.createWord(payload);

      if (onSuccess) {
        onSuccess(payload);
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi đăng từ cộng đồng:', err);
      setErrorMsg(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content animate-scale"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '92%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <Users size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                Đăng Từ Ký Hiệu Mới Lên Cộng Đồng
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#e0f2fe' }}>
                Đề xuất từ mới để cộng đồng bình chọn. Đạt từ 80% ủng hộ sẽ được Admin duyệt vào Từ điển!
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {errorMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              color: '#b91c1c',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} flexShrink={0} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Tên từ vựng */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
              Tên từ vựng ký hiệu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="VD: Trí tuệ nhân tạo, Livestream, Trà sữa nướng, Quét mã..."
                value={word}
                onChange={(e) => setWord(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
          </div>

          {/* 2. Chuyên đề */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
              Chuyên đề phân loại <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {PRESET_TOPICS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  style={{
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: topic === t.id ? '2px solid #0284c7' : '1px solid var(--border-color)',
                    backgroundColor: topic === t.id ? '#f0f9ff' : '#ffffff',
                    color: topic === t.id ? '#0284c7' : '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{t.icon}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTopic('custom')}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: topic === 'custom' ? '2px solid #0284c7' : '1px dashed var(--border-color)',
                  backgroundColor: topic === 'custom' ? '#f0f9ff' : '#ffffff',
                  color: topic === 'custom' ? '#0284c7' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>➕</span>
                <span>Chủ đề khác...</span>
              </button>
            </div>

            {topic === 'custom' && (
              <input
                type="text"
                placeholder="Nhập tên chủ đề mới (VD: Khoa học viễn tưởng, Tiếng lóng GenZ...)"
                value={customTopicName}
                onChange={(e) => setCustomTopicName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid #0284c7',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            )}
          </div>

          {/* 3. Phương ngữ & Độ khó */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                Phương ngữ
              </label>
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                {DIALECT_OPTIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.flag} {d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                Độ khó ước tính
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Dễ">Dễ (Cử chỉ đơn giản)</option>
                <option value="Trung bình">Trung bình (Phối hợp 2 tay)</option>
                <option value="Khó">Khó (Đòi hỏi ngón tay linh hoạt)</option>
              </select>
            </div>
          </div>

          {/* 4. Video minh họa */}
          <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Video size={16} color="#0284c7" />
                <span>Video cử chỉ ký hiệu</span>
              </label>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setVideoMethod('upload')}
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.72rem',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    backgroundColor: videoMethod === 'upload' ? '#0284c7' : '#e2e8f0',
                    color: videoMethod === 'upload' ? '#ffffff' : '#64748b'
                  }}
                >
                  Tải file lên
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMethod('url')}
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.72rem',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    backgroundColor: videoMethod === 'url' ? '#0284c7' : '#e2e8f0',
                    color: videoMethod === 'url' ? '#ffffff' : '#64748b'
                  }}
                >
                  Nhập link URL
                </button>
              </div>
            </div>

            {videoMethod === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #94a3b8',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <Upload size={24} color="#64748b" style={{ margin: '0 auto 0.4rem auto' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    {videoFile ? videoFile.name : 'Bấm để chọn file video từ thiết bị của bạn'}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Hỗ trợ định dạng MP4, WebM (Tối đa 80MB)
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  placeholder="Dán đường dẫn video (VD: https://domain.com/video.mp4)"
                  value={videoUrl}
                  onChange={handleUrlChange}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Video preview */}
            {videoPreviewUrl && (
              <div style={{ marginTop: '0.75rem', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: 180, backgroundColor: '#000000' }}>
                <video
                  ref={previewVideoRef}
                  src={videoPreviewUrl}
                  controls
                  style={{ width: '100%', height: '100%', maxHeight: 180, objectFit: 'contain' }}
                />
              </div>
            )}
          </div>

          {/* 5. Mô tả ý nghĩa */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
              Mô tả ý nghĩa & Cách thể hiện ký hiệu
            </label>
            <textarea
              rows={3}
              placeholder="VD: Cử chỉ dùng khi muốn diễn tả công nghệ thông minh, tay phải mở các ngón đưa lên phía trước trán..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Toggle Thông tin mở rộng */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: 0
              }}
            >
              <Sparkles size={14} />
              <span>{showAdvanced ? 'Ẩn chi tiết kỹ thuật' : 'Thêm chi tiết: Dạng bàn tay & Chuyển động (Tùy chọn)'}</span>
            </button>
          </div>

          {showAdvanced && (
            <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                  Dạng bàn tay (Handshape)
                </label>
                <input
                  type="text"
                  placeholder="VD: Bàn tay nắm, ngón cái xòe"
                  value={handShape}
                  onChange={(e) => setHandShape(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                  Quỹ đạo chuyển động (Movement)
                </label>
                <input
                  type="text"
                  placeholder="VD: Đưa từ trong ngực ra ngoài 2 lần"
                  value={movement}
                  onChange={(e) => setMovement(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn-pill btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-pill btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: 140 }}
            >
              {isSubmitting ? 'Đang gửi...' : 'Đăng từ lên cộng đồng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
