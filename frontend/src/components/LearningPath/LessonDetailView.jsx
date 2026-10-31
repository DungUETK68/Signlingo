import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  Play, 
  RotateCcw, 
  Video, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Gauge, 
  ChevronRight, 
  ChevronLeft,
  Star,
  BookOpen,
  Bookmark
} from 'lucide-react';
import { getAllWords, useSavedLessons } from '../../data/wordsStore';

export default function LessonDetailView({ lesson, topic, onBack, onStartPractice, onSelectLesson }) {
  const [speed, setSpeed] = useState(1.0);
  const [viewAngle, setViewAngle] = useState('front');
  const videoPlayerRef = useRef(null);
  const { isSaved, toggleSave } = useSavedLessons();

  if (!lesson || !topic) return null;

  const allWords = getAllWords();
  // Tìm kiếm từ vựng tương ứng trong từ điển hoặc từ mới thêm
  const matchedWord = allWords.find(
    w => w.id === lesson.wordId ||
         w.word.toLowerCase() === lesson.title.toLowerCase() || 
         lesson.title.toLowerCase().includes(w.word.toLowerCase()) ||
         w.word.toLowerCase().includes(lesson.title.toLowerCase())
  ) || {
    word: lesson.title,
    description: lesson.description,
    videoFront: lesson.videoUrl || '/chao.mp4',
    handShape: 'Bàn tay mở tự nhiên chuẩn VSL',
    movement: 'Thực hiện động tác dứt khoát theo video mẫu'
  };

  // Lấy video chuẩn theo góc quay: chính diện (front) hoặc góc nghiêng (side)
  const currentVideo = React.useMemo(() => {
    if (viewAngle === 'side') {
      if (matchedWord.videoSide) return matchedWord.videoSide;
      if (lesson.videoSideUrl) return lesson.videoSideUrl;
      if (lesson.videoUrl && lesson.videoUrl.includes('_front.mp4')) {
        return lesson.videoUrl.replace('_front.mp4', '_side.mp4');
      }
      return matchedWord.videoSide || matchedWord.videoFront || lesson.videoUrl || '/chao.mp4';
    }

    // viewAngle === 'front'
    return matchedWord.videoFront || lesson.videoUrl || '/chao.mp4';
  }, [viewAngle, matchedWord, lesson]);

  const isVideoFormat = currentVideo && (
    currentVideo.endsWith('.mp4') || 
    currentVideo.endsWith('.webm') || 
    currentVideo.startsWith('blob:') ||
    currentVideo.startsWith('/uploads/') ||
    currentVideo.includes('chao.mp4')
  );

  const handleSetSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.playbackRate = newSpeed;
    }
  };

  useEffect(() => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.playbackRate = speed;
    }
  }, [currentVideo, speed]);

  // Tìm index của bài học hiện tại trong topic để hỗ trợ nút Next/Prev
  const currentIndex = topic.lessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? topic.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < topic.lessons.length - 1 ? topic.lessons[currentIndex + 1] : null;

  return (
    <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      {/* 1. Header Điều Hướng: Nút Quay Lại & Breadcrumb */}
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 800,
            color: '#0284c7',
            borderColor: '#bae6fd',
            backgroundColor: '#f0f9ff'
          }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại Lộ trình</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          <span>{topic.title}</span>
          <span>›</span>
          <span style={{ fontWeight: 800, color: '#1e293b' }}>{lesson.title}</span>
        </div>
      </div>

      {/* 2. Thẻ Nội Dung Bài Học Chính */}
      <div className="mini-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        {/* Badges & Meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#e0f2fe',
              color: '#0369a1'
            }}>
              {topic.level}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#f1f5f9',
              color: '#475569'
            }}>
              {lesson.duration} • {lesson.level}
            </span>
          </div>

          {lesson.completed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#15803d',
              backgroundColor: '#dcfce7',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-pill)'
            }}>
              <Star size={13} fill="#15803d" />
              <span>Điểm cao nhất: {lesson.score}%</span>
            </div>
          )}
        </div>

        {/* Title row with Save / Bookmark Button at the far right */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
              {lesson.title}
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              {lesson.description}
            </p>
          </div>

          <button
            onClick={() => toggleSave(lesson, topic)}
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
              backgroundColor: isSaved(lesson.id, lesson.title) ? '#eff6ff' : '#ffffff',
              color: isSaved(lesson.id, lesson.title) ? '#0284c7' : '#64748b',
              border: isSaved(lesson.id, lesson.title) ? '1.5px solid #93c5fd' : '1.5px solid #e2e8f0',
              boxShadow: isSaved(lesson.id, lesson.title) ? '0 2px 8px rgba(2, 132, 199, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
              flexShrink: 0
            }}
            title={isSaved(lesson.id, lesson.title) ? 'Bấm để bỏ lưu bài học' : 'Lưu bài học để vào mục Ôn tập'}
          >
            <Bookmark 
              size={18} 
              fill={isSaved(lesson.id, lesson.title) ? '#0284c7' : 'none'} 
              color={isSaved(lesson.id, lesson.title) ? '#0284c7' : '#64748b'} 
            />
            <span>{isSaved(lesson.id, lesson.title) ? 'Đã lưu' : 'Lưu'}</span>
          </button>
        </div>

        {/* Stepper Chỉ Dẫn 2 Bước */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          backgroundColor: '#f8fafc',
          padding: '0.6rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1.5px solid #bae6fd'
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>1</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>Bước 1: Quan sát mẫu</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Xem video tốc độ thường & 0.5x</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.65rem 0.85rem',
            opacity: 0.85
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>2</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>Bước 2: Luyện tập AI</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Bật webcam chấm điểm cử chỉ</div>
            </div>
          </div>
        </div>

        {/* Khung Video Chuyên Gia Làm Mẫu */}
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          aspectRatio: '16/10',
          marginBottom: '1.25rem',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isVideoFormat ? (
            <video 
              key={currentVideo}
              ref={videoPlayerRef}
              src={currentVideo} 
              controls
              autoPlay
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <img 
              src={currentVideo} 
              alt={lesson.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Top Label Tag */}
          <div style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            display: 'flex',
            gap: '0.4rem',
            pointerEvents: 'none'
          }}>
            <span style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <Video size={13} /> {isVideoFormat ? 'Video mẫu chuyên gia VSL' : 'Ảnh mẫu chuyên gia VSL'}
            </span>
          </div>

          {/* Video Control Bar: Tốc độ 0.5x / 1.0x & Góc quay */}
          <div style={{
            position: 'absolute',
            bottom: '0.85rem',
            left: '0.85rem',
            right: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            backdropFilter: 'blur(8px)',
            flexWrap: 'wrap',
            gap: '0.5rem',
            zIndex: 5
          }}>
            {/* Speed Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginRight: '0.2rem' }}>Tốc độ:</span>
              <button
                className={`btn-pill btn-sm ${speed === 1.0 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => handleSetSpeed(1.0)}
              >
                1.0x Thường
              </button>
              <button
                className={`btn-pill btn-sm ${speed === 0.5 ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  backgroundColor: speed === 0.5 ? '#f97316' : undefined
                }}
                onClick={() => handleSetSpeed(0.5)}
              >
                🐢 0.5x Quay chậm
              </button>
            </div>

            {/* View Angle Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginRight: '0.2rem' }}>Góc quay:</span>
              <button
                className={`btn-pill btn-sm ${viewAngle === 'front' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => setViewAngle('front')}
              >
                Chính diện
              </button>
              <button
                className={`btn-pill btn-sm ${viewAngle === 'side' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => setViewAngle('side')}
              >
                Góc nghiêng 45°
              </button>
            </div>
          </div>
        </div>

        {/* Mẹo Kỹ Thuật Thực Hiện Cử Chỉ (2 Box Tinh Gọn) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: '#0284c7', marginBottom: '0.25rem' }}>
              <Layers size={14} /> Hình dáng bàn tay
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
              {matchedWord.handShape || 'Giữ bàn tay tự nhiên, các đốt ngón tay mở hoặc khép đúng góc độ chuẩn.'}
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: '#16a34a', marginBottom: '0.25rem' }}>
              <Gauge size={14} /> Quỹ đạo chuyển động
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
              {matchedWord.movement || 'Đặt bàn tay trước ngực ở cự ly khoảng 25cm và thực hiện chuyển động dứt khoát.'}
            </div>
          </div>
        </div>

        {/* Nút Hành Động Lớn: Chuyển Sang Bật Camera Thực Hành Với AI */}
        <button
          className="btn-pill btn-green"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.05rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem'
          }}
          onClick={() => onStartPractice(lesson.title)}
        >
          <Camera size={20} />
          <span>BƯỚC 2: BẬT CAMERA THỰC HÀNH CÙNG AI</span>
        </button>
      </div>

      {/* 3. Nút Điều Hướng Bài Trước / Bài Kế Tiếp Trong Cùng Chương */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3rem' }}>
        {prevLesson ? (
          <button
            className="btn-pill btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => onSelectLesson(prevLesson)}
          >
            <ChevronLeft size={16} />
            <span>Bài trước: {prevLesson.title}</span>
          </button>
        ) : <div />}

        {nextLesson ? (
          <button
            className="btn-pill btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => onSelectLesson(nextLesson)}
          >
            <span>Bài tiếp: {nextLesson.title}</span>
            <ChevronRight size={16} />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
