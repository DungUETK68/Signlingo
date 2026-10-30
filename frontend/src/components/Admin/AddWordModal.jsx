import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Video, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Film, 
  Layers, 
  Gauge, 
  BookOpen, 
  MapPin,
  Clock,
  Play
} from 'lucide-react';
import { addCustomWord, uploadVideoFile } from '../../data/wordsStore';

const PRESET_TOPICS = [
  { id: 'greeting', label: 'Chào hỏi & Làm quen', icon: '👋' },
  { id: 'family', label: 'Gia đình thân thương', icon: '👨‍👩‍👧‍👦' },
  { id: 'food', label: 'Ẩm thực & Đồ ăn', icon: '🍲' },
  { id: 'daily', label: 'Giao tiếp hàng ngày', icon: '💬' },
  { id: 'numbers', label: 'Số đếm cơ bản', icon: '🔢' },
  { id: 'alphabet', label: 'Bảng chữ cái ngón tay', icon: '🔤' },
];

const DIALECT_OPTIONS = [
  { id: 'Toàn quốc', label: 'Toàn quốc (Chuẩn chung)', flag: '🇻🇳' },
  { id: 'Miền Bắc', label: 'Miền Bắc (Hà Nội)', flag: '🔴' },
  { id: 'Miền Trung', label: 'Miền Trung (Huế, ĐN)', flag: '🟡' },
  { id: 'Miền Nam', label: 'Miền Nam (TP.HCM)', flag: '🔵' },
];

export default function AddWordModal({ isOpen, onClose, onSuccess, initialWord = null }) {
  const isEditing = Boolean(initialWord);

  const [word, setWord] = useState('');
  const [topic, setTopic] = useState('greeting');
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
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const previewVideoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialWord) {
        setWord(initialWord.word || '');
        const isPreset = PRESET_TOPICS.some(t => t.id === initialWord.topic);
        if (isPreset) {
          setTopic(initialWord.topic);
          setCustomTopicName('');
        } else {
          setTopic('custom');
          setCustomTopicName(initialWord.topicLabel || initialWord.topic || '');
        }
        setDialect(initialWord.dialect || 'Toàn quốc');
        setDescription(initialWord.description || '');
        setDifficulty(initialWord.difficulty || 'Dễ');
        setDuration(initialWord.duration || '3 phút');
        setHandShape(initialWord.handShape || '');
        setMovement(initialWord.movement || '');
        const vUrl = initialWord.videoFront || '';
        setVideoUrl(vUrl);
        setVideoPreviewUrl(vUrl);
        setVideoMethod(vUrl ? 'url' : 'upload');
        setVideoFile(null);
        setErrorMsg('');
        setShowAdvanced(Boolean(initialWord.handShape || initialWord.movement));
      } else {
        setWord('');
        setTopic('greeting');
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
    }
  }, [isOpen, initialWord]);

  if (!isOpen) return null;

  // Xử lý chọn file video
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setErrorMsg('Vui lòng chọn định dạng file video hợp lệ (MP4, WebM, MOV)!');
        return;
      }
      setVideoFile(file);
      setErrorMsg('');
      const preview = URL.createObjectURL(file);
      setVideoPreviewUrl(preview);
    }
  };

  // Chọn video mẫu nhanh có sẵn trong hệ thống
  const handleUsePresetVideo = (path = '/chao.mp4') => {
    setVideoMethod('url');
    setVideoUrl(path);
    setVideoPreviewUrl(path);
    setVideoFile(null);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!word.trim()) {
      setErrorMsg('Vui lòng nhập tên từ vựng!');
      return;
    }
    if (topic === 'custom' && !customTopicName.trim()) {
      setErrorMsg('Vui lòng nhập tên chủ đề tùy chỉnh!');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Vui lòng nhập mô tả cử chỉ (dùng để hướng dẫn học viên trong Tab Học tập)!');
      return;
    }

    // Video URL check
    let finalVideoUrl = videoUrl.trim();

    setIsUploading(true);

    try {
      if (videoFile) {
        // Tải video lên server hoặc lấy Blob URL
        const uploadRes = await uploadVideoFile(videoFile);
        finalVideoUrl = uploadRes.videoUrl || uploadRes.previewUrl;
      }

      if (!finalVideoUrl) {
        // Mặc định dùng video chuẩn nếu chưa chọn
        finalVideoUrl = '/chao.mp4';
      }

      const selectedTopicObj = PRESET_TOPICS.find(t => t.id === topic);
      const topicLabel = topic === 'custom' ? customTopicName.trim() : (selectedTopicObj?.label || 'Chào hỏi');
      const topicId = topic === 'custom' ? `topic-${Date.now()}` : topic;

      const newWordData = {
        id: initialWord?.id,
        word: word.trim(),
        topic: topicId,
        topicLabel: topicLabel,
        dialect: dialect,
        description: description.trim(),
        details: description.trim(),
        difficulty: difficulty,
        duration: duration,
        handShape: handShape.trim() || 'Bàn tay mở tự nhiên chuẩn VSL',
        movement: movement.trim() || 'Thực hiện động tác dứt khoát theo video mẫu',
        videoFront: finalVideoUrl,
        videoSide: finalVideoUrl,
        isCustom: initialWord ? initialWord.isCustom : true,
      };

      const savedWord = await addCustomWord(newWordData);
      setIsUploading(false);
      onSuccess?.(savedWord, isEditing);
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu từ:', err);
      setIsUploading(false);
      setErrorMsg('Đã có lỗi xảy ra khi lưu từ. Vui lòng thử lại!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: 680, 
          maxHeight: '90vh', 
          overflowY: 'auto',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1.5px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {isEditing ? 'Chỉnh Sửa Từ Vựng' : 'Thêm Từ Vựng Mới'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                {isEditing 
                  ? 'Cập nhật nội dung, mô tả cử chỉ và video hướng dẫn cho từ vựng này' 
                  : <>Từ mới sẽ tự động hiển thị trong <strong>Tab Học tập</strong>, Từ điển và Luyện AI</>}
              </p>
            </div>
          </div>

          <button 
            className="modal-close-btn" 
            onClick={onClose}
            style={{ position: 'static' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Tên từ vựng */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
              Tên từ vựng ký hiệu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="VD: Cảm ơn, Tạm biệt, Hoan nghênh..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.95rem',
                outline: 'none',
                fontWeight: 600
              }}
              required
            />
          </div>

          {/* 2. Chủ đề & Phương ngữ (2 Cột) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Chủ đề */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
                Chủ đề bài học <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  fontWeight: 600
                }}
              >
                {PRESET_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.label}
                  </option>
                ))}
                <option value="custom">➕ Tạo chủ đề mới...</option>
              </select>

              {topic === 'custom' && (
                <input
                  type="text"
                  value={customTopicName}
                  onChange={(e) => setCustomTopicName(e.target.value)}
                  placeholder="Nhập tên chủ đề mới (VD: Giao thông)..."
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #0284c7',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                  required
                />
              )}
            </div>

            {/* Phương ngữ */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
                Phương ngữ ký hiệu <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  fontWeight: 600
                }}
              >
                {DIALECT_OPTIONS.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.flag} {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Mô tả cử chỉ (Phục vụ Tab Học tập) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                Mô tả cử chỉ <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>
                Hiển thị trong Tab Học tập
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết cách thực hiện: vị trí tay, hình dáng ngón tay, hướng di chuyển để học viên làm theo khi vào bài học..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.45
              }}
              required
            />
          </div>

          {/* 4. Đăng video */}
          <div style={{ 
            marginBottom: '1.25rem',
            backgroundColor: '#f8fafc',
            border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Film size={16} color="#0284c7" />
                <span>Đăng Video Hướng Dẫn</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>

              {/* Chuyển đổi giữa upload và URL */}
              <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: '#e2e8f0', padding: '0.2rem', borderRadius: 'var(--radius-pill)' }}>
                <button
                  type="button"
                  className={`btn-pill btn-sm ${videoMethod === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.2rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={() => setVideoMethod('upload')}
                >
                  Tải file video
                </button>
                <button
                  type="button"
                  className={`btn-pill btn-sm ${videoMethod === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.2rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={() => setVideoMethod('url')}
                >
                  Link video / Mẫu
                </button>
              </div>
            </div>

            {/* Phương thức 1: Tải file từ máy tính */}
            {videoMethod === 'upload' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {!videoFile && !videoPreviewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #93c5fd',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#eff6ff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Upload size={28} color="#0284c7" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                      Bấm để chọn video từ máy tính (.mp4, .webm)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Hỗ trợ MP4, WebM dung lượng khuyến nghị dưới 50MB
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                      <Video size={18} color="#0284c7" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {videoFile ? videoFile.name : 'Video đã chọn'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-pill btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', color: '#ef4444' }}
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreviewUrl('');
                      }}
                    >
                      Chọn lại
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Phương thức 2: Dùng URL hoặc Video mẫu */}
            {videoMethod === 'url' && (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setVideoPreviewUrl(e.target.value);
                    }}
                    placeholder="Nhập đường dẫn URL video (VD: /chao.mp4 hoặc https://...)"
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  <button
                    type="button"
                    className="btn-pill btn-secondary btn-sm"
                    style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700, color: '#0284c7', borderColor: '#bae6fd' }}
                    onClick={() => handleUsePresetVideo('/chao.mp4')}
                  >
                    🎬 Dùng video mẫu (/chao.mp4)
                  </button>
                </div>
              </div>
            )}

            {/* Khung Xem Trước Video (Live Video Preview) */}
            {videoPreviewUrl && (
              <div style={{ marginTop: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Check size={14} /> Xem trước video
                  </span>
                </div>
                <div style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: '#0f172a',
                  aspectRatio: '16/9',
                  maxHeight: 220,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <video
                    ref={previewVideoRef}
                    src={videoPreviewUrl}
                    controls
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Cài đặt mở rộng (Accordion) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#0284c7',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0'
              }}
            >
              <span>{showAdvanced ? '▼ Thu gọn chi tiết kỹ thuật' : '▶ Bổ sung hình dáng tay & quỹ đạo (Tùy chọn)'}</span>
            </button>

            {showAdvanced && (
              <div style={{
                marginTop: '0.75rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gap: '0.75rem'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                    Hình dáng bàn tay (Hand Shape)
                  </label>
                  <input
                    type="text"
                    value={handShape}
                    onChange={(e) => setHandShape(e.target.value)}
                    placeholder="VD: Bàn tay mở 5 ngón khép tự nhiên (Open-B)..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                    Quỹ đạo chuyển động (Movement)
                  </label>
                  <input
                    type="text"
                    value={movement}
                    onChange={(e) => setMovement(e.target.value)}
                    placeholder="VD: Chạm thái dương -> Đưa về phía đối tác..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                      Độ khó
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.82rem',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="Dễ">Dễ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Khó">Khó</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                      Thời lượng học bài
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="3 phút"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.82rem',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1.5px solid var(--border-color)'
          }}>
            <button
              type="button"
              className="btn-pill btn-secondary"
              onClick={onClose}
              disabled={isUploading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-pill btn-primary"
              disabled={isUploading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: 160,
                justifyContent: 'center'
              }}
            >
              {isUploading ? (
                <span>{isEditing ? 'Đang lưu thay đổi...' : 'Đang tải video & lưu...'}</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>{isEditing ? 'Lưu thay đổi' : 'Lưu & Thêm vào Tab Học tập'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
