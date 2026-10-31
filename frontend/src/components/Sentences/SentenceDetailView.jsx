import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Video,
  Volume2
} from 'lucide-react';

export default function SentenceDetailView({ sentence, onBack, onStartPractice }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewAngle, setViewAngle] = useState('front'); // 'front' | 'side'
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const videoRef = useRef(null);

  const words = sentence?.words || [];
  const currentWord = words[currentWordIndex] || words[0];

  // Xác định đường dẫn video mẫu theo góc quay (Chính diện hoặc Góc nghiêng)
  const currentVideoSrc = React.useMemo(() => {
    if (!currentWord) return '/chao.mp4';
    if (viewAngle === 'side' && currentWord.videoSide) {
      return currentWord.videoSide;
    }
    return currentWord.videoFront || '/chao.mp4';
  }, [currentWord, viewAngle]);

  // Cập nhật tốc độ phát video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentWordIndex]);

  // Tự động phát video khi chuyển từ
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentWordIndex, viewAngle]);

  // Khi video của từ hiện tại phát xong -> Tự động chuyển sang từ tiếp theo
  const handleVideoEnded = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      // Đã phát hết câu: Tạm dừng nhẹ 800ms rồi lặp lại từ đầu câu để người học dễ ngấm nhịp
      setTimeout(() => {
        setCurrentWordIndex(0);
      }, 800);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const replaySentenceFromStart = () => {
    setCurrentWordIndex(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  if (!sentence) return null;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* 1. Header Điều hướng */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <button
          className="btn-pill btn-secondary btn-sm"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
        >
          <ArrowLeft size={16} />
          <span>Danh sách câu</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#e0f2fe',
            color: '#0284c7'
          }}>
            {sentence.topicLabel}
          </span>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#f1f5f9',
            color: '#475569'
          }}>
            Độ khó: {sentence.difficulty}
          </span>
        </div>
      </div>

      {/* 2. Tiêu đề câu & Dải ký hiệu VSL */}
      <div className="mini-card" style={{
        marginBottom: '1.25rem',
        padding: '1.25rem',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
        border: '1.5px solid #bae6fd',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          Học Câu Giao Tiếp VSL
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.6rem 0' }}>
          "{sentence.title}"
        </h1>

        {/* Chuỗi thứ tự ký hiệu VSL */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
            Trật tự ký hiệu:
          </span>
          {words.map((w, idx) => (
            <React.Fragment key={w.slug || idx}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: currentWordIndex === idx ? '#0284c7' : '#ffffff',
                color: currentWordIndex === idx ? '#ffffff' : '#0f172a',
                fontSize: '0.85rem',
                fontWeight: 800,
                boxShadow: currentWordIndex === idx ? '0 2px 8px rgba(2, 132, 199, 0.35)' : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentWordIndex(idx)}
              >
                <span>{idx + 1}. {w.word}</span>
              </span>
              {idx < words.length - 1 && (
                <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.85rem' }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 3. Khung Video Mẫu Ghép Chuỗi Liên Tiếp */}
      <div className="mini-card" style={{
        padding: '1.25rem',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid #e2e8f0',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
      }}>
        {/* Thanh chỉ báo từ đang phát */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              <Play size={12} fill="#ffffff" />
              <span>Đang phát: Từ {currentWordIndex + 1}/{words.length}</span>
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              {currentWord?.word}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
              ({currentWord?.role})
            </span>
          </div>

          {/* Tùy chỉnh góc nhìn & tốc độ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Nút đổi góc nhìn */}
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-pill)', padding: 2 }}>
              <button
                className={`btn-pill btn-sm ${viewAngle === 'front' ? 'btn-primary' : ''}`}
                style={{
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: 'none',
                  backgroundColor: viewAngle === 'front' ? '#0284c7' : 'transparent',
                  color: viewAngle === 'front' ? '#ffffff' : '#64748b'
                }}
                onClick={() => setViewAngle('front')}
              >
                Chính diện
              </button>
              <button
                className={`btn-pill btn-sm ${viewAngle === 'side' ? 'btn-primary' : ''}`}
                style={{
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: 'none',
                  backgroundColor: viewAngle === 'side' ? '#0284c7' : 'transparent',
                  color: viewAngle === 'side' ? '#ffffff' : '#64748b'
                }}
                onClick={() => setViewAngle('side')}
              >
                Góc nghiêng
              </button>
            </div>

            {/* Tốc độ phát */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {[0.5, 0.75, 1.0].map(s => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  style={{
                    padding: '0.2rem 0.45rem',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: playbackSpeed === s ? '#0284c7' : '#cbd5e1',
                    backgroundColor: playbackSpeed === s ? '#e0f2fe' : '#ffffff',
                    color: playbackSpeed === s ? '#0284c7' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Màn hình phát video */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: 380,
          backgroundColor: '#000000',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <video
            ref={videoRef}
            src={currentVideoSrc}
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onEnded={handleVideoEnded}
            onClick={togglePlayPause}
          />

          {/* Overlay từ hiện tại ở góc trên video */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(15, 23, 42, 0.82)',
            color: '#ffffff',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 800
          }}>
            <span style={{ color: '#38bdf8' }}>{currentWordIndex + 1}/{words.length}:</span>
            <span>{currentWord?.word}</span>
          </div>

          {/* Nút bấm Play/Pause nhanh ở giữa khi pause */}
          {!isPlaying && (
            <button
              onClick={togglePlayPause}
              style={{
                position: 'absolute',
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'rgba(2, 132, 199, 0.9)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <Play size={24} fill="#ffffff" style={{ marginLeft: 3 }} />
            </button>
          )}
        </div>

        {/* Thanh nút chuyển nhanh giữa các từ bên dưới video */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${words.length}, 1fr)`,
          gap: '0.5rem',
          marginTop: '0.85rem'
        }}>
          {words.map((w, idx) => {
            const isActive = currentWordIndex === idx;
            return (
              <button
                key={w.slug || idx}
                onClick={() => setCurrentWordIndex(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.5rem 0.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid',
                  borderColor: isActive ? '#0284c7' : '#e2e8f0',
                  backgroundColor: isActive ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '0.72rem', color: isActive ? '#0284c7' : '#94a3b8', fontWeight: 800 }}>
                  Từ {idx + 1}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 900, color: isActive ? '#0284c7' : '#1e293b' }}>
                  {w.word}
                </span>
              </button>
            );
          })}
        </div>

        {/* Nút điều khiển phát lại toàn bộ câu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.75rem', gap: '0.75rem' }}>
          <button
            className="btn-pill btn-secondary btn-sm"
            onClick={replaySentenceFromStart}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <RotateCcw size={14} />
            <span>Phát lại từ đầu câu</span>
          </button>
        </div>
      </div>

      {/* 4. Hướng dẫn chi tiết từng từ trong câu */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="#0284c7" />
          <span>Hướng dẫn từng ký hiệu thành phần ({words.length} từ)</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {words.map((w, idx) => (
            <div
              key={w.slug || idx}
              className="mini-card"
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: currentWordIndex === idx ? '#f0f9ff' : '#ffffff',
                border: '1.5px solid',
                borderColor: currentWordIndex === idx ? '#0284c7' : '#e2e8f0',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentWordIndex(idx)}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: currentWordIndex === idx ? '#0284c7' : '#e2e8f0',
                color: currentWordIndex === idx ? '#ffffff' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {idx + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                    {w.word}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: '#e2e8f0',
                    color: '#475569'
                  }}>
                    {w.role}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                  {w.description || 'Thực hiện cử chỉ theo chuẩn bộ dữ liệu VSL400.'}
                </div>
              </div>

              <button
                className="btn-pill btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentWordIndex(idx);
                }}
              >
                <Video size={13} style={{ marginRight: 4 }} />
                <span>Xem mẫu</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Nút Luyện Tập Câu với Camera AI */}
      <div style={{
        position: 'sticky',
        bottom: 20,
        backgroundColor: '#ffffff',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        border: '1.5px solid #0284c7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        zIndex: 50
      }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
            Đã nắm rõ ngữ pháp và cách ghép câu?
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Hệ thống AI sẽ đánh giá lần lượt từng từ và tổng kết điểm toàn câu
          </div>
        </div>

        <button
          className="btn-pill btn-primary"
          style={{
            padding: '0.75rem 1.75rem',
            fontSize: '0.95rem',
            fontWeight: 900,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#0284c7'
          }}
          onClick={() => onStartPractice(sentence)}
        >
          <Camera size={18} />
          <span>Luyện tập câu với AI Camera</span>
        </button>
      </div>
    </div>
  );
}

