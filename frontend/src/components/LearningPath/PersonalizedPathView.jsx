import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  Camera, 
  Clock, 
  Award, 
  Compass, 
  Sliders, 
  Check, 
  AlertTriangle,
  Zap,
  TrendingUp,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import { usePersonalizedPath, recordPracticeSession } from '../../data/personalizedStore';

export default function PersonalizedPathView({ 
  onStartPracticeWord, 
  onOpenSurvey,
  onOpenLesson 
}) {
  const { 
    profile, 
    capability, 
    path, 
    updateLevel, 
    recalculate, 
    completeLesson 
  } = usePersonalizedPath();

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateMessage, setRecalculateMessage] = useState(null);

  // Xử lý nút Tái phân tích lộ trình bằng AI
  const handleRecalculate = () => {
    setIsRecalculating(true);
    setRecalculateMessage(null);
    setTimeout(() => {
      recalculate();
      setIsRecalculating(false);
      setRecalculateMessage('✅ AI đã phân tích lại lịch sử thực hành và tối ưu hóa lộ trình cá nhân thành công!');
      setTimeout(() => setRecalculateMessage(null), 5000);
    }, 700);
  };

  // Giả lập thử nghiệm khả năng học tập để kiểm chứng cơ chế thích ứng động
  const handleSimulateCapability = (type) => {
    if (type === 'high') {
      recordPracticeSession({ word: 'Chào', score: 96, passed: true, badJoints: [] });
      recordPracticeSession({ word: 'Cảm ơn', score: 94, passed: true, badJoints: [] });
    } else if (type === 'low') {
      recordPracticeSession({ word: 'Cảm ơn', score: 65, passed: false, badJoints: [1, 2] });
      recordPracticeSession({ word: 'Chào', score: 68, passed: false, badJoints: [0] });
    } else {
      recordPracticeSession({ word: 'Số 5', score: 85, passed: true, badJoints: [] });
    }
    handleRecalculate();
  };

  // Tính tổng tiến độ lộ trình cá nhân
  const allLessons = path.flatMap(s => s.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter(l => l.completed).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* 1. Header Khảo Sát & Phân Tích Thích Ứng AI (Adaptive AI Hero Card) */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '0.3rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              <Sparkles size={16} />
              <span>LỘ TRÌNH CÁ NHÂN HÓA THÍCH ỨNG (AI ADAPTIVE PATH)</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="btn-pill"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#0284c7',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '0.4rem 0.9rem',
                  gap: '0.4rem',
                  border: 'none',
                  cursor: isRecalculating ? 'not-allowed' : 'pointer'
                }}
              >
                <RotateCcw size={15} className={isRecalculating ? 'animate-spin' : ''} />
                <span>{isRecalculating ? 'AI đang phân tích...' : 'Tối ưu hóa lại bằng AI'}</span>
              </button>

              <button
                onClick={onOpenSurvey}
                className="btn-pill"
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.6)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '0.4rem 0.85rem',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Sliders size={15} />
                <span>Khảo sát lại</span>
              </button>
            </div>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Lộ Trình Của Bạn: {profile.name}
          </h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.92, maxWidth: 680, lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Hệ thống tự động tinh chỉnh các bài học dựa trên mức độ hiểu biết ban đầu và tốc độ thực hành camera AI thực tế.
          </p>

          {/* 3 Metric Cards Tình Trạng Cá Nhân Hóa */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>Trình độ ban đầu đã chọn</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: '0.2rem' }}>
                {profile.learningLevel === 'beginner' && '🐣 Mới bắt đầu (Level 1)'}
                {profile.learningLevel === 'elementary' && '🌿 Đã biết cơ bản (Level 2)'}
                {profile.learningLevel === 'intermediate' && '🚀 Đã có nền tảng (Level 3)'}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>Đánh giá khả năng AI</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <TrendingUp size={18} />
                <span>{capability.statusTitle}</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>Điểm AI thực hành TB</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: '0.2rem' }}>
                {capability.avgScore}% ({completedLessons}/{totalLessons} bài hoàn thành)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thông báo cập nhật lộ trình */}
      {recalculateMessage && (
        <div style={{
          backgroundColor: '#dcfce7',
          color: '#15803d',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.25rem',
          fontSize: '0.88rem',
          fontWeight: 700,
          boxShadow: 'var(--card-shadow)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {recalculateMessage}
        </div>
      )}

      {/* 2. Thẻ Động Cơ Thích Ứng (Adaptive Recommendation Box) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <BrainCircuit size={20} color="#0284c7" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Động cơ Thích Ứng AI đang tối ưu hóa lộ trình của bạn:
          </h3>
        </div>
        <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
          {capability.recommendation}
        </p>

        {/* Thanh chuyển đổi nhanh mức độ hiểu để kiểm chứng trực tiếp */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid #f1f5f9',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>
            CHUYỂN NHANH MỨC ĐỘ ĐỂ XEM LỘ TRÌNH:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => updateLevel('beginner')}
              className={`btn-pill ${profile.learningLevel === 'beginner' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.3rem 0.75rem' }}
            >
              🐣 1. Người mới bắt đầu
            </button>
            <button
              onClick={() => updateLevel('elementary')}
              className={`btn-pill ${profile.learningLevel === 'elementary' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.3rem 0.75rem' }}
            >
              🌿 2. Đã biết cơ bản
            </button>
            <button
              onClick={() => updateLevel('intermediate')}
              className={`btn-pill ${profile.learningLevel === 'intermediate' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.3rem 0.75rem' }}
            >
              🚀 3. Nâng cao / Có nền tảng
            </button>
          </div>
        </div>

        {/* Thử nghiệm khả năng học thực tế (Mô phỏng điểm AI) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginTop: '0.75rem',
          fontSize: '0.78rem',
          color: '#64748b',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 800 }}>THỬ NGHIỆM ĐIỀU CHỈNH THEO TỐC ĐỘ HỌC:</span>
          <button
            onClick={() => handleSimulateCapability('high')}
            className="btn-pill"
            style={{
              fontSize: '0.72rem',
              padding: '0.25rem 0.65rem',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚡ Giả lập điểm cao (≥ 95% - Mở khóa vượt cấp)
          </button>
          <button
            onClick={() => handleSimulateCapability('low')}
            className="btn-pill"
            style={{
              fontSize: '0.72rem',
              padding: '0.25rem 0.65rem',
              backgroundColor: '#fff7ed',
              color: '#c2410c',
              border: '1px solid #fed7aa',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🤖 Giả lập điểm thấp (&lt; 70% - Tự chèn bài bổ trợ)
          </button>
        </div>
      </div>

      {/* 3. Danh Sách Các Chặng Học Cá Nhân Hóa (Adaptive Stages) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {path.map((stage, sIdx) => (
          <div 
            key={stage.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            {/* Header Chặng */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <div style={{
                  fontSize: '1.6rem',
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: stage.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  {stage.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    {stage.title}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                    {stage.subtitle}
                  </p>
                </div>
              </div>

              {/* Tiến độ chặng */}
              <div style={{ textAlign: 'right', minWidth: 120 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: stage.color }}>
                  {stage.progress}% Hoàn thành
                </span>
                <div style={{
                  width: 120,
                  height: 8,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-pill)',
                  overflow: 'hidden',
                  marginTop: '0.3rem'
                }}>
                  <div style={{
                    width: `${stage.progress}%`,
                    height: '100%',
                    backgroundColor: stage.color,
                    borderRadius: 'var(--radius-pill)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            </div>

            {/* Danh sách các bài học của chặng */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stage.lessons.map((lesson) => {
                const isBooster = lesson.isAiBooster;
                return (
                  <div
                    key={lesson.id}
                    style={{
                      border: isBooster ? '1.5px solid #fdba74' : '1px solid #e2e8f0',
                      backgroundColor: isBooster ? '#fffbeb' : lesson.completed ? '#f8fafc' : '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.85rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Cột 1: Thông tin bài học */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: 260 }}>
                      <div 
                        onClick={() => completeLesson(lesson.id, 92)}
                        title="Bấm để đánh dấu hoàn thành bài học"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          backgroundColor: lesson.completed ? '#22c55e' : isBooster ? '#f97316' : '#e0f2fe',
                          color: lesson.completed ? '#ffffff' : isBooster ? '#ffffff' : '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          cursor: 'pointer',
                          marginTop: '0.1rem'
                        }}
                      >
                        {lesson.completed ? (
                          <Check size={18} strokeWidth={3} />
                        ) : isBooster ? (
                          <AlertTriangle size={18} />
                        ) : (
                          <Play size={16} fill="currentColor" />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
                            {lesson.title}
                          </span>

                          {lesson.badge && (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-pill)',
                              backgroundColor: isBooster ? '#ea580c' : lesson.highlight ? '#0284c7' : '#e0f2fe',
                              color: isBooster || lesson.highlight ? '#ffffff' : '#0369a1'
                            }}>
                              {lesson.badge}
                            </span>
                          )}

                          {lesson.completed && (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: '#16a34a',
                              backgroundColor: '#dcfce7',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 'var(--radius-pill)'
                            }}>
                              ✓ Đạt {lesson.score}%
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4, maxWidth: 540 }}>
                          {lesson.desc}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.4rem', fontSize: '0.76rem', color: '#94a3b8' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={13} />
                            {lesson.duration}
                          </span>
                          <span>•</span>
                          <span>Độ khó: <strong>{lesson.level}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Cột 2: Nút thao tác */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {lesson.word && (
                        <button
                          onClick={() => onStartPracticeWord(lesson.word)}
                          className="btn-pill btn-secondary"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.4rem 0.85rem',
                            gap: '0.35rem',
                            fontWeight: 700
                          }}
                        >
                          <Camera size={15} color="#0284c7" />
                          <span>Luyện AI</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (lesson.word) {
                            onStartPracticeWord(lesson.word);
                          } else if (onOpenLesson) {
                            onOpenLesson(lesson, stage);
                          }
                        }}
                        className={`btn-pill ${lesson.completed ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                          fontSize: '0.82rem',
                          padding: '0.4rem 0.95rem',
                          fontWeight: 800,
                          gap: '0.35rem'
                        }}
                      >
                        <span>{lesson.completed ? 'Ôn lại' : 'Học ngay'}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
