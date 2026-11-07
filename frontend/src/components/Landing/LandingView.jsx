import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Play,
  RotateCw,
  Compass,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Video,
  Layers,
  Heart,
  Users,
  Target
} from 'lucide-react';

export default function LandingView({ onOpenAuth }) {
  const [activeAngle, setActiveAngle] = useState('front'); // 'front' | 'left' | 'right'

  const videoAngles = {
    front: '/vsl400_videos/chao_front.mp4',
    left: '/vsl400_videos/chao_left.mp4',
    right: '/vsl400_videos/chao_right.mp4',
  };

  const sampleWords = [
    { name: 'Chào', topic: 'Chào hỏi', thumb: '/vsl400_videos/chao_thumb.jpg', slug: 'chao' },
    { name: 'Cảm ơn', topic: 'Chào hỏi', thumb: '/vsl400_videos/cam_on_thumb.jpg', slug: 'cam_on' },
    { name: 'Tạm biệt', topic: 'Chào hỏi', thumb: '/vsl400_videos/tam_biet_thumb.jpg', slug: 'tam_biet' },
    { name: 'Bố', topic: 'Gia đình', thumb: '/vsl400_videos/bo_thumb.jpg', slug: 'bo' },
    { name: 'Mẹ', topic: 'Gia đình', thumb: '/vsl400_videos/me_thumb.jpg', slug: 'me' },
    { name: 'Yêu', topic: 'Cảm xúc', thumb: '/vsl400_videos/yeu_thumb.jpg', slug: 'yeu' },
  ];

  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>
      {/* 1. Header Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1.5px solid #e2e8f0',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0284c7', letterSpacing: '-0.5px' }}>
                Signlingo
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                border: '1px solid #bae6fd'
              }}>
                VSL400 + AI
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              Học Ngôn Ngữ Ký Hiệu Thông Minh
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="landing-nav-links">
          <a href="#features" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', textDecoration: 'none' }}>
            Công nghệ AI
          </a>
          <a href="#dictionary" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', textDecoration: 'none' }}>
            Từ điển 400 từ
          </a>
          <a href="#adaptive" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', textDecoration: 'none' }}>
            Lộ trình học
          </a>
          <a href="#community" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', textDecoration: 'none' }}>
            Cộng đồng
          </a>
        </nav>

        {/* Top-Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => onOpenAuth('login')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: 800,
              backgroundColor: '#ffffff',
              color: '#0284c7',
              border: '2px solid #bae6fd',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            style={{
              padding: '0.55rem 1.35rem',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: 800,
              backgroundColor: '#22c55e',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 0 #15803d',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>Đăng ký</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '4rem 1.5rem 3rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '3rem',
        alignItems: 'center'
      }}>
        {/* Left Column: Heading & CTAs */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '1.25rem',
            border: '1px solid #bae6fd'
          }}>
            <Sparkles size={16} color="#0284c7" />
            <span>Nền tảng học Ngôn ngữ Ký hiệu Việt Nam số 1 với AI</span>
          </div>

          <h1 style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.18,
            letterSpacing: '-1px',
            marginBottom: '1.25rem'
          }}>
            Làm chủ <span style={{ color: '#0284c7' }}>Ngôn Ngữ Ký Hiệu</span> thông minh cùng Trí Tuệ Nhân Tạo
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#475569',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            Học chuẩn 400+ từ vựng VSL qua video <strong>3 góc quay camera</strong> độc quyền. 
            Luyện tập tương tác trực tiếp qua webcam được hệ thống AI nhận diện <strong>75 khớp ngón tay</strong> và chấm điểm thời gian thực.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button
              onClick={() => onOpenAuth('register')}
              style={{
                padding: '0.9rem 2rem',
                borderRadius: '9999px',
                fontSize: '1.05rem',
                fontWeight: 900,
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 5px 0 #15803d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>Bắt đầu học ngay (Miễn phí)</span>
              <ArrowRight size={20} />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              style={{
                padding: '0.85rem 1.75rem',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 800,
                backgroundColor: '#ffffff',
                color: '#1e293b',
                border: '2px solid #cbd5e1',
                boxShadow: '0 3px 0 #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              Tôi đã có tài khoản
            </button>
          </div>

          {/* Highlights Mini List */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#22c55e" />
              <span>Chấm điểm AI thời gian thực</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#22c55e" />
              <span>Video 3 góc quay chuẩn VSL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#22c55e" />
              <span>100% Hoàn toàn miễn phí</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Demo Mockup */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '1.25rem',
          boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.15)',
          border: '2px solid #e0f2fe',
          position: 'relative'
        }}>
          {/* Card Top Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>
                Từ vựng: "Chào"
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px'
              }}>
                Chính xác 96% 🎉
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#0284c7',
              backgroundColor: '#e0f2fe',
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px'
            }}>
              <Camera size={14} />
              <span>AI Skeleton 75 điểm</span>
            </div>
          </div>

          {/* Interactive 3-Angle Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginBottom: '0.85rem',
            backgroundColor: '#f1f5f9',
            padding: '0.3rem',
            borderRadius: '12px'
          }}>
            {[
              { id: 'front', label: '1. Chính diện' },
              { id: 'left', label: '2. Nghiêng trái' },
              { id: 'right', label: '3. Nghiêng phải' },
            ].map(angle => (
              <button
                key={angle.id}
                onClick={() => setActiveAngle(angle.id)}
                style={{
                  padding: '0.45rem 0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeAngle === angle.id ? '#0284c7' : 'transparent',
                  color: activeAngle === angle.id ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                {angle.label}
              </button>
            ))}
          </div>

          {/* Video Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 280,
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#0f172a'
          }}>
            <video
              key={activeAngle}
              src={videoAngles[activeAngle]}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* AI Landmark Skeleton Overlay Indicator */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.6rem 0.85rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff',
              fontSize: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                <span style={{ fontWeight: 700 }}>MediaPipe Hands & Pose: Hoàn hảo</span>
              </div>
              <span style={{ color: '#38bdf8', fontWeight: 800 }}>60 FPS • Real-time</span>
            </div>
          </div>

          {/* Quick CTA inside Mockup */}
          <div style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 700 }}>
              Bạn muốn thử luyện cử chỉ "Chào" bằng webcam của mình?
            </div>
            <button
              onClick={() => onOpenAuth('register')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Thử ngay
            </button>
          </div>
        </div>
      </section>

      {/* 3. Stats Counter Section */}
      <section style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
        padding: '2.5rem 1.5rem'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0284c7' }}>400+</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              Từ Vựng VSL Chuẩn
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Bộ dữ liệu VSL400 chính thức</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#22c55e' }}>3 Góc Quay</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              Mỗi Từ Vựng
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Chính diện, Trái, Phải</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f97316' }}>75 Khớp</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              Landmark AI
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Phân tích ngón tay 3D</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#8b5cf6' }}>100%</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              Miễn Phí
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Hỗ trợ cộng đồng Điếc VN</div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3rem auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Công Nghệ AI Tiên Phong Cho Ngôn Ngữ Ký Hiệu
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.75rem' }}>
            Kết hợp thị giác máy tính hiện đại với phương pháp học tương tác trực quan giúp bạn nắm vững ký hiệu một cách chuẩn xác nhất.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {/* Card 1 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Camera size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
              Chấm Điểm Camera AI Thời Gian Thực
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              Sử dụng webcam của bạn để phân tích chuyển động khớp ngón tay và tư thế theo thời gian thực.
              Hệ thống so sánh với dữ liệu cử chỉ chuẩn để chấm điểm phần trăm chính xác và chỉ ra lỗi gập ngón tay cần khắc phục.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Video size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
              Từ Điển 400 Từ Độc Quyền 3 Góc Quay
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              Khác với video một góc truyền thống dễ bị che khuất ngón tay, Signlingo cung cấp cả 3 góc quay: 
              <strong>Chính diện, Nghiêng trái và Nghiêng phải</strong> cho mỗi từ vựng, giúp bạn nhìn rõ toàn bộ không gian cử chỉ.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              backgroundColor: '#ffedd5',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Compass size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
              Lộ Trình Cá Nhân Hóa (Adaptive SRS)
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              Dựa trên mục tiêu và kết quả luyện tập của bạn, thuật toán thích ứng Spaced Repetition tự động 
              nhận diện các từ vựng bạn còn yếu và sắp xếp lịch ôn tập định kỳ, giúp bạn không bao giờ quên cử chỉ đã học.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              backgroundColor: '#f3e8ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Flame size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
              Minigames 5 Giây & Gamification
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              Thử thách phản xạ nhanh 5s, chuỗi ngày Streak Duolingo, trái tim sinh mệnh, XP và Bảng xếp hạng thi đua 
              giúp quá trình học ngôn ngữ ký hiệu trở nên đầy hứng khởi mỗi ngày.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Dictionary Showcase Section */}
      <section id="dictionary" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{
                display: 'inline-block',
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                fontSize: '0.78rem',
                fontWeight: 800,
                marginBottom: '0.5rem'
              }}>
                KHO DỮ LIỆU CHUẨN
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
                Từ Điển VSL 400 Từ Vựng Thực Tế
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.3rem' }}>
                Đầy đủ các chủ đề thiết thực: Chào hỏi, Gia đình, Ăn uống, Con số, Chữ cái, Xã hội...
              </p>
            </div>

            <button
              onClick={() => onOpenAuth('register')}
              style={{
                padding: '0.7rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: 800,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 0 #0369a1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Khám phá toàn bộ 400 từ</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Word Preview Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1.25rem'
          }}>
            {sampleWords.map((word) => (
              <div
                key={word.name}
                onClick={() => onOpenAuth('register')}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#38bdf8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ position: 'relative', height: 130, backgroundColor: '#0f172a' }}>
                  <img
                    src={word.thumb}
                    alt={word.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    color: '#ffffff',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    3 góc quay
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Play size={14} fill="#ffffff" />
                  </div>
                </div>

                <div style={{ padding: '0.85rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {word.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    {word.topic}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How it works (3 Steps) */}
      <section id="adaptive" style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 3rem auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>
            Học Ngôn Ngữ Ký Hiệu Chỉ Với 3 Bước
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>
            Phương pháp học thực chiến kết hợp phản hồi thị giác tức thời
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1.5px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              fontSize: '1.4rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              1
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Chọn Từ Vựng / Bài Học
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              Khám phá lộ trình theo cấp độ của bạn hoặc tra cứu trực tiếp trong từ điển 400 từ vựng VSL.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1.5px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              fontSize: '1.4rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              2
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Quan Sát 3 Góc Video Mẫu
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              Chuyển đổi linh hoạt giữa góc thẳng và 2 góc nghiêng để nắm rõ vị trí và chiều xoay của từng ngón tay.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1.5px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#ffedd5',
              color: '#ea580c',
              fontSize: '1.4rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              3
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Bật Camera & Nhận Điểm AI
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              Thực hành cử chỉ trước webcam. AI nhận diện và phản hồi tức thì độ chính xác và chỉ ra góc gập cần chỉnh sửa.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call to Action Banner */}
      <section id="community" style={{
        backgroundColor: '#0284c7',
        color: '#ffffff',
        padding: '5rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
            Sẵn Sàng Làm Chủ Ngôn Ngữ Ký Hiệu?
          </h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Tham gia cùng hàng ngàn học viên để xóa bỏ rào cản giao tiếp, kết nối với cộng đồng người Điếc Việt Nam.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenAuth('register')}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '9999px',
                fontSize: '1.1rem',
                fontWeight: 900,
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 5px 0 #15803d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>Đăng ký tài khoản miễn phí</span>
              <ArrowRight size={20} />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              style={{
                padding: '0.95rem 2rem',
                borderRadius: '9999px',
                fontSize: '1.05rem',
                fontWeight: 800,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '2.5rem 1.5rem',
        borderTop: '1px solid #1e293b'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>Signlingo</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>• Nền tảng học VSL ứng dụng AI</span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            © {new Date().getFullYear()} Signlingo Project. Vì cộng đồng người Điếc Việt Nam.
          </div>
        </div>
      </footer>
    </div>
  );
}
