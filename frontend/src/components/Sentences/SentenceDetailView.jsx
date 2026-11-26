import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Camera,
  Play,
  RotateCcw,
  Layers,
  Gauge,
  CheckCircle2,
  Video,
  Bookmark,
} from 'lucide-react';
import { useSavedSentences } from '../../data/wordsStore';
import { progressApi, resolveAngleVideoUrl } from '../../services/api';
import VideoAngleSwitcher from '../VideoAngleSwitcher';

export default function SentenceDetailView({ sentence, onBack, onStartPractice }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewAngle, setViewAngle] = useState('front'); // 'front' | 'left' | 'right'
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [completedState, setCompletedState] = useState(!!sentence?.completed);
  const videoRef = useRef(null);
  const { isSaved, toggleSave } = useSavedSentences();

  useEffect(() => {
    setCurrentWordIndex(0);
    setCompletedState(!!sentence?.completed);
  }, [sentence?.id, sentence?.slug, sentence?.completed]);

  const words = sentence?.words || [];
  const currentWord = words[currentWordIndex] || words[0];

  // Xác định đường dẫn video mẫu theo đủ 3 góc quay (Chính diện, Nghiêng trái, Nghiêng phải)
  const currentVideoSrc = React.useMemo(() => {
    return resolveAngleVideoUrl(currentWord, viewAngle);
  }, [currentWord, viewAngle]);

  // Cập nhật tốc độ phát video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentWordIndex]);

  // Tự động phát video khi chuyển từ hoặc đổi góc quay
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentWordIndex, viewAngle, playbackSpeed]);

  // Khi video của từ hiện tại phát xong -> Tự động chuyển sang từ tiếp theo
  const handleVideoEnded = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
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

  const handleCompleteSentence = async () => {
    setCompletedState(true);
    confetti({ particleCount: 65, spread: 60 });
    try {
      await progressApi.completeLesson(
        sentence.slug || sentence.id || sentence.title,
        100
      );
      window.dispatchEvent(
        new CustomEvent('signlingo_data_updated', {
          detail: { action: 'complete_sentence', slug: sentence.slug },
        })
      );
    } catch (e) {}
  };

  if (!sentence) return null;

  const topicCategoryLabel =
    sentence.topicLabel || sentence.category || 'Giao tiếp & Xã giao';
  const savedNow = isSaved(sentence.id, sentence.slug);

  return (
    <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out', paddingBottom: '3rem' }}>
      {/* 1. Header Điều Hướng: Nút Quay Lại & Breadcrumb (đồng bộ 100% với trang Học từ vựng) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <button
          className="btn-pill btn-secondary btn-sm"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 800,
            color: '#0284c7',
            borderColor: '#bae6fd',
            backgroundColor: '#f0f9ff',
          }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại Danh sách câu</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          <span>{topicCategoryLabel}</span>
          <span>›</span>
          <span style={{ fontWeight: 800, color: '#1e293b' }}>"{sentence.title}"</span>
        </div>
      </div>

      {/* 2. Khung Nội Dung Bài Học Câu Chính (đưa toàn bộ mô tả, trật tự ký hiệu & nút Lưu vào trong khung giống Học từ vựng) */}
      <div className="mini-card lesson-detail-card" style={{ marginBottom: '1.5rem' }}>
        {/* Hàng nhãn thông tin (Chuyên mục • Độ khó • Số ký hiệu) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#f1f5f9',
                color: '#475569',
              }}
            >
              {topicCategoryLabel} • Độ khó: {sentence.difficulty || 'Dễ'} • {words.length} ký hiệu
            </span>
          </div>
        </div>

        {/* Hàng Tiêu đề câu, Mô tả & Nút Đánh dấu đã học / Lưu bên phải */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.35rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
              "{sentence.title}"
            </h1>

            <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
              {sentence.explanation ||
                sentence.structure ||
                'Quan sát trật tự ghép các ký hiệu thành phần và thực hiện liền mạch đúng ngữ pháp VSL.'}
            </p>

            {/* Dải Trật tự ký hiệu nằm gọn ngay trong khung mô tả */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.45rem',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                Trật tự ký hiệu:
              </span>
              {words.map((w, idx) => {
                const label = w.word || w.name;
                const active = currentWordIndex === idx;
                return (
                  <React.Fragment key={w.slug || idx}>
                    <button
                      type="button"
                      onClick={() => setCurrentWordIndex(idx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.22rem 0.65rem',
                        borderRadius: 'var(--radius-pill)',
                        border: active ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        backgroundColor: active ? '#0284c7' : '#ffffff',
                        color: active ? '#ffffff' : '#0f172a',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {idx + 1}. {label}
                    </button>
                    {idx < words.length - 1 && (
                      <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.82rem' }}>→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Cụm nút Đánh dấu đã học & Lưu đồng bộ với trang Học từ vựng */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCompleteSentence}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: completedState ? '#dcfce7' : '#ffffff',
                color: completedState ? '#15803d' : '#0284c7',
                border: completedState ? '1.5px solid #86efac' : '1.5px solid #bae6fd',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}
              title="Ghi nhận hoàn thành câu giao tiếp"
            >
              <CheckCircle2 size={18} color={completedState ? '#16a34a' : '#0284c7'} />
              <span>{completedState ? 'Đã hoàn thành' : 'Đánh dấu đã học'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSave(sentence)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: savedNow ? '#eff6ff' : '#ffffff',
                color: savedNow ? '#0284c7' : '#64748b',
                border: savedNow ? '1.5px solid #93c5fd' : '1.5px solid #e2e8f0',
                boxShadow: savedNow
                  ? '0 2px 8px rgba(2, 132, 199, 0.15)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}
              title={savedNow ? 'Bấm để bỏ lưu câu' : 'Lưu câu để đưa vào danh sách Ôn tập'}
            >
              <Bookmark
                size={18}
                fill={savedNow ? '#0284c7' : 'none'}
                color={savedNow ? '#0284c7' : '#64748b'}
              />
              <span>{savedNow ? 'Đã lưu' : 'Lưu'}</span>
            </button>
          </div>
        </div>

        {/* Stepper Chỉ Dẫn 2 Bước đồng bộ với Học từ vựng */}
        <div className="lesson-stepper">
          <div className="lesson-step-card active">
            <div className="lesson-step-badge active">1</div>
            <div className="lesson-step-text">
              <div className="lesson-step-title active">Bước 1: Quan sát mẫu</div>
              <div className="lesson-step-sub">Xem chuỗi ký hiệu tốc độ thường & 0.5x</div>
            </div>
          </div>

          <div
            className="lesson-step-card"
            onClick={() => onStartPractice(sentence)}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            title="Chuyển ngay sang Bước 2: Luyện tập câu với Camera AI"
          >
            <div className="lesson-step-badge">2</div>
            <div className="lesson-step-text">
              <div className="lesson-step-title">Bước 2: Luyện tập AI</div>
              <div className="lesson-step-sub">Bật camera chấm điểm toàn câu</div>
            </div>
          </div>
        </div>

        {/* Khung Video Chuỗi Ký Hiệu Mẫu */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            aspectRatio: '16/10',
            marginBottom: '0.75rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            src={currentVideoSrc}
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onEnded={handleVideoEnded}
            onClick={togglePlayPause}
          />

          {/* Nhãn từ đang phát ở góc trên trái video */}
          <div
            style={{
              position: 'absolute',
              top: '0.65rem',
              left: '0.65rem',
              backgroundColor: 'rgba(15, 23, 42, 0.78)',
              color: '#ffffff',
              padding: '0.28rem 0.7rem',
              borderRadius: 'var(--radius-pill)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              pointerEvents: 'none',
            }}
          >
            <Video size={13} />
            <span style={{ color: '#38bdf8' }}>
              Từ {currentWordIndex + 1}/{words.length}:
            </span>
            <span>{currentWord?.word || currentWord?.name}</span>
            {currentWord?.role && (
              <span style={{ opacity: 0.8, fontWeight: 600 }}>({currentWord.role})</span>
            )}
          </div>

          {!isPlaying && (
            <button
              type="button"
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
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <Play size={24} fill="#ffffff" style={{ marginLeft: 3 }} />
            </button>
          )}
        </div>

        {/* Thanh điều khiển Tốc độ & 3 Góc quay đồng bộ bên dưới video */}
        <div className="lesson-video-toolbar">
          <div className="lesson-toolbar-group">
            <span className="lesson-toolbar-label">Tốc độ:</span>
            <div className="lesson-toolbar-btns">
              <button
                type="button"
                className={`btn-pill btn-sm ${playbackSpeed === 1.0 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.32rem 0.75rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                onClick={() => setPlaybackSpeed(1.0)}
              >
                1.0x Thường
              </button>
              <button
                type="button"
                className={`btn-pill btn-sm ${playbackSpeed === 0.5 ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.32rem 0.75rem',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                  backgroundColor: playbackSpeed === 0.5 ? '#f97316' : undefined,
                  borderColor: playbackSpeed === 0.5 ? '#f97316' : undefined,
                  boxShadow: playbackSpeed === 0.5 ? '0 3px 0 #c2410c' : undefined,
                }}
                onClick={() => setPlaybackSpeed(0.5)}
              >
                🐢 0.5x Chậm
              </button>
              <button
                type="button"
                className="btn-pill btn-secondary btn-sm"
                style={{ padding: '0.32rem 0.75rem', fontSize: '0.78rem', whiteSpace: 'nowrap', gap: '0.3rem' }}
                onClick={replaySentenceFromStart}
              >
                <RotateCcw size={13} />
                <span>Phát lại câu</span>
              </button>
            </div>
          </div>

          <VideoAngleSwitcher
            angle={viewAngle}
            onChange={setViewAngle}
            className="lesson-toolbar-group"
          />
        </div>

        {/* Thanh chuyển nhanh giữa các từ trong câu */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.max(1, words.length)}, minmax(0, 1fr))`,
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          {words.map((w, idx) => {
            const isActive = currentWordIndex === idx;
            const label = w.word || w.name;
            return (
              <button
                key={w.slug || idx}
                type="button"
                onClick={() => setCurrentWordIndex(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.5rem 0.35rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid',
                  borderColor: isActive ? '#0284c7' : '#e2e8f0',
                  backgroundColor: isActive ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: '0.72rem', color: isActive ? '#0284c7' : '#94a3b8', fontWeight: 800 }}>
                  Từ {idx + 1}
                </span>
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    color: isActive ? '#0284c7' : '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2 Box Kỹ Thuật Ngữ Pháp & Hướng Dẫn Thực Hiện (đồng bộ với 2 Box bên Học từ vựng) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.85rem 1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#0284c7',
                marginBottom: '0.25rem',
              }}
            >
              <Layers size={14} /> Cấu trúc ngữ pháp VSL
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
              {sentence.structure || 'Chủ đề đặt trước, hành động/lời dẫn thực hiện sau (SOV).'}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.85rem 1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#16a34a',
                marginBottom: '0.25rem',
              }}
            >
              <Gauge size={14} /> Nhịp nối các từ trong câu
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
              {currentWord?.hint ||
                'Chuyển tiếp mượt mà giữa các ký hiệu thành phần, kết hợp ánh mắt và biểu cảm tự nhiên.'}
            </div>
          </div>
        </div>

        {/* Nút Hành Động Lớn: Bật Camera Thực Hành Câu Cùng AI */}
        <button
          type="button"
          className="btn-pill btn-green"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.05rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
          }}
          onClick={() => onStartPractice(sentence)}
        >
          <Camera size={20} />
          <span>BƯỚC 2: BẬT CAMERA THỰC HÀNH CÂU CÙNG AI</span>
        </button>
      </div>

      {/* 3. Hướng dẫn chi tiết từng ký hiệu thành phần bên dưới */}
      <div>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Layers size={18} color="#0284c7" />
          <span>Chi tiết từng ký hiệu thành phần ({words.length} từ)</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {words.map((w, idx) => {
            const label = w.word || w.name;
            return (
              <div
                key={w.slug || idx}
                className="mini-card"
                style={{
                  padding: '0.95rem 1.2rem',
                  backgroundColor: currentWordIndex === idx ? '#f0f9ff' : '#ffffff',
                  border: '1.5px solid',
                  borderColor: currentWordIndex === idx ? '#0284c7' : '#e2e8f0',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setCurrentWordIndex(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
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
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                      <span style={{ fontSize: '1.02rem', fontWeight: 900, color: '#0f172a' }}>
                        {label}
                      </span>
                      {w.role && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.12rem 0.5rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: '#e2e8f0',
                            color: '#475569',
                          }}
                        >
                          {w.role}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.45 }}>
                      {w.hint || w.description || 'Thực hiện cử chỉ theo chuẩn bộ dữ liệu VSL400.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
