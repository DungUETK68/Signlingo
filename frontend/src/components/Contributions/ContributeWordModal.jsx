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
  Play,
  HeartHandshake
} from 'lucide-react';
import { uploadVideoFile } from '../../data/wordsStore';
import { contributionsApi } from '../../services/api';

const PRESET_TOPICS = [
  { id: 'greeting', label: 'Chào hỏi & Giao tiếp', icon: '👋' },
  { id: 'family', label: 'Gia đình & Xưng hô', icon: '👨‍👩‍👧‍👦' },
  { id: 'food', label: 'Ẩm thực & Thức uống', icon: '🍲' },
  { id: 'daily', label: 'Giao tiếp hàng ngày', icon: '💬' },
  { id: 'numbers', label: 'Số đếm cơ bản', icon: '🔢' },
  { id: 'alphabet', label: 'Bảng chữ cái ngón tay', icon: '🔤' },
  { id: 'health', label: 'Y tế & Sức khỏe', icon: '🏥' },
  { id: 'education', label: 'Học tập & Nhà trường', icon: '🎓' },
];

const DIALECT_OPTIONS = [
  { id: 'Toàn quốc', label: 'Toàn quốc (Chuẩn chung)', flag: '🇻🇳' },
  { id: 'Miền Bắc', label: 'Miền Bắc (Hà Nội)', flag: '🔴' },
  { id: 'Miền Trung', label: 'Miền Trung (Huế, Đà Nẵng)', flag: '🟡' },
  { id: 'Miền Nam', label: 'Miền Nam (TP.HCM)', flag: '🔵' },
];

export default function ContributeWordModal({ isOpen, onClose, onSuccess, initialContribution = null }) {
  const isEditing = Boolean(initialContribution);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const previewVideoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialContribution) {
        setWord(initialContribution.word || '');
        const isPreset = PRESET_TOPICS.some(t => t.id === initialContribution.topic);
        if (isPreset) {
          setTopic(initialContribution.topic);
          setCustomTopicName('');
        } else {
          setTopic('custom');
          setCustomTopicName(initialContribution.topicLabel || initialContribution.topic || '');
        }
        setDialect(initialContribution.dialect || 'Toàn quốc');
        setDescription(initialContribution.description || '');
        setDifficulty(initialContribution.difficulty || 'Dễ');
        setDuration(initialContribution.duration || '3 phút');
        setHandShape(initialContribution.handShape || '');
        setMovement(initialContribution.movement || '');
        const vUrl = initialContribution.videoFront || '';
        setVideoUrl(vUrl);
        setVideoPreviewUrl(vUrl);
        setVideoMethod(vUrl ? 'url' : 'upload');
        setVideoFile(null);
        setErrorMsg('');
        setShowAdvanced(Boolean(initialContribution.handShape || initialContribution.movement));
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
  }, [isOpen, initialContribution]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setErrorMsg('Vui lòng chọn file video hợp lệ (MP4, WebM, MOV)!');
        return;
      }
      setVideoFile(file);
      setErrorMsg('');
      const preview = URL.createObjectURL(file);
      setVideoPreviewUrl(preview);
    }
  };

  const handleUsePresetVideo = (path = '/vsl400_videos/cam_on_front.mp4') => {
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
      setErrorMsg('Vui lòng nhập tên từ vựng bạn muốn đóng góp!');
      return;
    }
    if (topic === 'custom' && !customTopicName.trim()) {
      setErrorMsg('Vui lòng nhập tên chủ đề tùy chỉnh!');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Vui lòng nhập mô tả hoặc hướng dẫn cách làm cử chỉ!');
      return;
    }

    let finalVideoUrl = videoUrl.trim();
    setIsSubmitting(true);

    try {
      if (videoFile) {
        const uploadRes = await uploadVideoFile(videoFile);
        finalVideoUrl = uploadRes.videoUrl || uploadRes.previewUrl;
      }

      if (!finalVideoUrl) {
        finalVideoUrl = '/vsl400_videos/cam_on_front.mp4';
      }

      const selectedTopicObj = PRESET_TOPICS.find(t => t.id === topic);
      const topicLabel = topic === 'custom' ? customTopicName.trim() : (selectedTopicObj?.label || 'Chào hỏi');
      const topicId = topic === 'custom' ? `topic-${Date.now()}` : topic;

      const payload = {
        word: word.trim(),
        topic: topicId,
        topicLabel: topicLabel,
        dialect: dialect,
        description: description.trim(),
        difficulty: difficulty,
        duration: duration,
        handShape: handShape.trim() || 'Bàn tay mở tự nhiên chuẩn VSL',
        movement: movement.trim() || 'Thực hiện động tác dứt khoát theo video mẫu',
        videoFront: finalVideoUrl,
        videoSide: finalVideoUrl,
        thumbnail: finalVideoUrl.replace(/\.(mp4|webm)$/i, '_thumb.jpg'),
      };

      let result;
      if (isEditing && initialContribution?.id) {
        result = await contributionsApi.updateContribution(initialContribution.id, payload);
      } else {
        result = await contributionsApi.createContribution(payload);
      }

      setIsSubmitting(false);
      onSuccess?.(result, isEditing);
      onClose();
    } catch (err) {
      console.error('Lỗi khi gửi đóng góp từ:', err);
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Đã có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại!');
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
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HeartHandshake size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {isEditing ? 'Chỉnh Sửa Từ Đã Đóng Góp' : 'Đóng Góp Từ Vựng Mới'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Cử chỉ của bạn sẽ được gửi tới Ban quản trị kiểm duyệt trước khi đưa vào kho dữ liệu VSL chung
              </p>
            </div>
          </div>

          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Tên từ vựng */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
              Tên từ vựng đóng góp <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Ví dụ: Cà phê, Hạnh phúc, Bệnh viện, Tự hào..."
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.95rem',
                fontWeight: 700,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 2. Chủ đề & Phương ngữ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Chủ đề */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                Chủ đề từ vựng <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                {PRESET_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.label}
                  </option>
                ))}
                <option value="custom">➕ Chủ đề mới khác...</option>
              </select>

              {topic === 'custom' && (
                <input
                  type="text"
                  value={customTopicName}
                  onChange={(e) => setCustomTopicName(e.target.value)}
                  placeholder="Nhập tên chủ đề mới (ví dụ: Nghề nghiệp, Động vật...)"
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #38bdf8',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              )}
            </div>

            {/* Phương ngữ */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                Phương ngữ vùng miền
              </label>
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
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

          {/* 3. Độ khó & Hướng dẫn */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                Độ khó ước lượng
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Dễ', 'Trung bình', 'Khó'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: difficulty === lvl ? '2px solid #0284c7' : '1.5px solid var(--border-color)',
                      backgroundColor: difficulty === lvl ? '#e0f2fe' : '#ffffff',
                      color: difficulty === lvl ? '#0284c7' : '#475569',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                Thời lượng bài học
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="2 phút">⚡ 2 phút (Cử chỉ nhanh)</option>
                <option value="3 phút">⏱️ 3 phút (Tiêu chuẩn)</option>
                <option value="5 phút">📚 5 phút (Cử chỉ ghép nhiều bước)</option>
              </select>
            </div>
          </div>

          {/* 4. Hướng dẫn chi tiết cử chỉ */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
              Mô tả / Hướng dẫn cử chỉ <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Bàn tay phải nắm hờ, ngón trỏ và ngón cái tạo thành hình chữ C, đưa từ dưới ngực hướng thẳng lên miệng..."
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* 5. Video Cử chỉ Mẫu */}
          <div style={{
            border: '1.5px solid #bae6fd',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            backgroundColor: '#f0f9ff',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Film size={18} color="#0284c7" />
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0369a1' }}>
                  Video cử chỉ ký hiệu minh họa
                </span>
              </div>

              {/* Tùy chọn cách tải */}
              <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#e0f2fe', padding: 2, borderRadius: 'var(--radius-pill)' }}>
                <button
                  type="button"
                  onClick={() => setVideoMethod('upload')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    backgroundColor: videoMethod === 'upload' ? '#0284c7' : 'transparent',
                    color: videoMethod === 'upload' ? '#ffffff' : '#0369a1',
                    cursor: 'pointer'
                  }}
                >
                  Tải video từ máy
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMethod('url')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    backgroundColor: videoMethod === 'url' ? '#0284c7' : 'transparent',
                    color: videoMethod === 'url' ? '#ffffff' : '#0369a1',
                    cursor: 'pointer'
                  }}
                >
                  Nhập link video
                </button>
              </div>
            </div>

            {videoMethod === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  style={{ display: 'none' }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #93c5fd',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0284c7'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#93c5fd'}
                >
                  <Upload size={28} color="#0284c7" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>
                    {videoFile ? videoFile.name : 'Bấm vào đây để chọn file video mẫu'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Hỗ trợ định dạng MP4, WebM hoặc MOV (Dung lượng khuyến nghị &lt; 25MB)
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoPreviewUrl(e.target.value);
                  }}
                  placeholder="Nhập đường dẫn URL video (ví dụ: https://... hoặc /vsl400_videos/...)"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Xem trước video nếu có */}
            {videoPreviewUrl && (
              <div style={{ marginTop: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.35rem' }}>
                  Xem trước video:
                </div>
                <div style={{
                  maxWidth: 320,
                  height: 180,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#0f172a'
                }}>
                  <video
                    ref={previewVideoRef}
                    src={videoPreviewUrl}
                    controls
                    loop
                    muted
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. Tùy chọn nâng cao (Ẩn/Hiện) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: 0
              }}
            >
              <span>{showAdvanced ? '− Thu gọn thông số chuyên sâu' : '+ Thêm thông số cử chỉ nâng cao (Hình bàn tay & Chuyển động)'}</span>
            </button>

            {showAdvanced && (
              <div style={{
                marginTop: '0.85rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.85rem'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Hình dáng bàn tay (Handshape)
                  </label>
                  <input
                    type="text"
                    value={handShape}
                    onChange={(e) => setHandShape(e.target.value)}
                    placeholder="Ví dụ: Nắm tay chữ S, Xòe bàn tay số 5..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Chuyển động (Movement)
                  </label>
                  <input
                    type="text"
                    value={movement}
                    onChange={(e) => setMovement(e.target.value)}
                    placeholder="Ví dụ: Vòng cung từ trong ra ngoài..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem'
          }}>
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
              style={{
                backgroundColor: '#22c55e',
                boxShadow: '0 4px 0 #15803d',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                minWidth: 150,
                justifyContent: 'center'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={3} />
                  <span>{isEditing ? 'Lưu thay đổi' : 'Gửi đóng góp'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
