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
  Target,
  GraduationCap,
  MessageSquare,
  Smile,
  Menu,
  X,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import './LandingView.css';

export default function LandingView({ onOpenAuth }) {
  const [activeAngle, setActiveAngle] = useState('front'); // 'front' | 'left' | 'right'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const videoAngles = {
    front: '/vsl400_videos/cam_on_front.mp4',
    left: '/vsl400_videos/cam_on_left.mp4',
    right: '/vsl400_videos/cam_on_right.mp4',
  };

  const sampleWords = [
    { name: 'Cảm ơn', topic: 'Chào hỏi & Giao tiếp', thumb: '/vsl400_videos/cam_on_thumb.jpg', slug: 'cam_on' },
    { name: 'Tạm biệt', topic: 'Chào hỏi & Giao tiếp', thumb: '/vsl400_videos/tam_biet_thumb.jpg', slug: 'tam_biet' },
    { name: 'Bố', topic: 'Gia đình & Xưng hô', thumb: '/vsl400_videos/bo_thumb.jpg', slug: 'bo' },
    { name: 'Mẹ', topic: 'Gia đình & Xưng hô', thumb: '/vsl400_videos/me_thumb.jpg', slug: 'me' },
    { name: 'Ăn', topic: 'Ẩm thực & Thức uống', thumb: '/vsl400_videos/an_thumb.jpg', slug: 'an' },
    { name: 'Yêu', topic: 'Cảm xúc & Tính chất', thumb: '/vsl400_videos/yeu_thumb.jpg', slug: 'yeu' },
  ];

  const sampleSentences = [
    {
      title: 'Em cảm ơn anh',
      structure: 'SOV: Em + Anh + Cảm ơn',
      category: 'Chào hỏi & Xã giao',
      badgeColor: '#0284c7',
      words: ['Em', 'Anh', 'Cảm ơn']
    },
    {
      title: 'Tôi bị đau đầu',
      structure: 'Chủ đề: Tôi + Đầu + Đau',
      category: 'Y tế & Khẩn cấp',
      badgeColor: '#ef4444',
      words: ['Tôi', 'Đầu', 'Đau']
    },
    {
      title: 'Cái này bao nhiêu tiền?',
      structure: 'Nghi vấn: Cái này + Tiền + Bao nhiêu?',
      category: 'Mua sắm & Đời sống',
      badgeColor: '#f59e0b',
      words: ['Cái này', 'Tiền', 'Bao nhiêu']
    },
    {
      title: 'Bạn tên là gì?',
      structure: 'Hỏi danh tính: Bạn + Tên + Gì?',
      category: 'Giao tiếp hàng ngày',
      badgeColor: '#10b981',
      words: ['Bạn', 'Tên', 'Gì']
    }
  ];

  const handleNavClick = (anchor) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page-root">
      {/* 1. Header Navigation */}
      <header className="landing-header">
        <div className="landing-header-inner">
          {/* Brand */}
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-brand-logo">
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="landing-brand-title">Signlingo</span>
                <span className="landing-brand-badge">VSL400 + AI</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                Học Ngôn Ngữ Ký Hiệu Thông Minh
              </div>
            </div>
          </div>

          {/* Center Nav Links (Desktop) */}
          <nav className="landing-nav-desktop">
            <a href="#features" onClick={(e) => { e.preventDefault(); handleNavClick('#features'); }} className="landing-nav-link">
              Công nghệ AI
            </a>
            <a href="#grammar" onClick={(e) => { e.preventDefault(); handleNavClick('#grammar'); }} className="landing-nav-link" style={{ color: '#059669', fontWeight: 800 }}>
              Ngữ pháp VSL ✨
            </a>
            <a href="#sentences" onClick={(e) => { e.preventDefault(); handleNavClick('#sentences'); }} className="landing-nav-link" style={{ color: '#0284c7', fontWeight: 800 }}>
              Câu thường gặp 💬
            </a>
            <a href="#dictionary" onClick={(e) => { e.preventDefault(); handleNavClick('#dictionary'); }} className="landing-nav-link">
              Từ điển 400 từ
            </a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); handleNavClick('#how-it-works'); }} className="landing-nav-link">
              Lộ trình học
            </a>
          </nav>

          {/* Top-Right Action Buttons (Desktop) */}
          <div className="landing-auth-desktop">
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
              className="landing-btn-primary"
              style={{ padding: '0.55rem 1.35rem', fontSize: '0.9rem' }}
            >
              <span>Đăng ký</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="landing-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`landing-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="landing-mobile-nav-list">
            <a href="#features" onClick={(e) => { e.preventDefault(); handleNavClick('#features'); }} className="landing-mobile-nav-link">
              <span>Công nghệ AI</span>
              <ChevronRight size={18} color="#94a3b8" />
            </a>
            <a href="#grammar" onClick={(e) => { e.preventDefault(); handleNavClick('#grammar'); }} className="landing-mobile-nav-link" style={{ color: '#059669', fontWeight: 800 }}>
              <span>Ngữ pháp Ngôn ngữ Ký hiệu</span>
              <ChevronRight size={18} color="#059669" />
            </a>
            <a href="#sentences" onClick={(e) => { e.preventDefault(); handleNavClick('#sentences'); }} className="landing-mobile-nav-link" style={{ color: '#0284c7', fontWeight: 800 }}>
              <span>100 Câu thường gặp thực tế</span>
              <ChevronRight size={18} color="#0284c7" />
            </a>
            <a href="#dictionary" onClick={(e) => { e.preventDefault(); handleNavClick('#dictionary'); }} className="landing-mobile-nav-link">
              <span>Từ điển VSL 400 từ</span>
              <ChevronRight size={18} color="#94a3b8" />
            </a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); handleNavClick('#how-it-works'); }} className="landing-mobile-nav-link">
              <span>Lộ trình học 3 bước</span>
              <ChevronRight size={18} color="#94a3b8" />
            </a>
          </div>

          <div className="landing-mobile-auth-btns">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
              className="landing-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Đăng ký tài khoản miễn phí</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
              className="landing-btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="landing-hero-section">
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
            <span>Nền tảng học Ngôn ngữ Ký hiệu Việt Nam thông minh với AI</span>
          </div>

          <h1 className="landing-hero-heading">
            Làm chủ <span style={{ color: '#0284c7' }}>Ngôn Ngữ Ký Hiệu</span> thông minh cùng Trí Tuệ Nhân Tạo
          </h1>

          <p className="landing-hero-subtitle">
            Học toàn diện từ <strong>Từ vựng 3 góc quay</strong>, <strong>Ngữ pháp VSL chuẩn khoa học</strong> đến <strong>100 câu giao tiếp thực tế</strong>. 
            Luyện tập tương tác trực tiếp qua webcam với AI nhận diện <strong>75 khớp ngón tay</strong> và chấm điểm tức thì.
          </p>

          {/* Primary Action Buttons */}
          <div className="landing-hero-ctas">
            <button
              onClick={() => onOpenAuth('register')}
              className="landing-btn-primary"
            >
              <span>Bắt đầu học ngay (Miễn phí)</span>
              <ArrowRight size={20} />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="landing-btn-secondary"
            >
              Tôi đã có tài khoản
            </button>
          </div>

          {/* Highlights Mini List */}
          <div className="landing-hero-features-list">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', color: '#475569', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#22c55e" />
              <span>Chấm điểm AI thời gian thực</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', color: '#475569', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#22c55e" />
              <span>Video 3 góc quay chuẩn VSL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', color: '#475569', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#22c55e" />
              <span>100 Câu thực tế & Ngữ pháp SOV</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', color: '#475569', fontWeight: 700 }}>
              <CheckCircle2 size={18} color="#22c55e" />
              <span>100% Hoàn toàn miễn phí</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Demo Mockup */}
        <div className="landing-hero-mockup">
          {/* Card Top Header */}
          <div className="landing-mockup-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>
                Từ vựng: "Cảm ơn"
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
            ].map((angle) => (
              <button
                key={angle.id}
                onClick={() => setActiveAngle(angle.id)}
                style={{
                  padding: '0.45rem 0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeAngle === angle.id ? '#0284c7' : 'transparent',
                  color: activeAngle === angle.id ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  textAlign: 'center'
                }}
              >
                {angle.label}
              </button>
            ))}
          </div>

          {/* Video Container */}
          <div className="landing-mockup-video-box">
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
              bottom: 10,
              left: 10,
              right: 10,
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(8px)',
              padding: '0.55rem 0.8rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff',
              fontSize: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              flexWrap: 'wrap',
              gap: '0.4rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                <span style={{ fontWeight: 700 }}>MediaPipe AI: Khớp chuẩn</span>
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
            border: '1px solid #bbf7d0',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 700 }}>
              Bạn muốn thử luyện cử chỉ "Cảm ơn" bằng webcam?
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
      <section className="landing-stats-section">
        <div className="landing-stats-grid">
          <div>
            <div className="landing-stat-num" style={{ color: '#0284c7' }}>400+</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              Từ Vựng VSL Chuẩn
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Bộ dữ liệu VSL400 chính thức</div>
          </div>
          <div>
            <div className="landing-stat-num" style={{ color: '#059669' }}>100+</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              Câu Giao Tiếp Thực Tế
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Phân tích cấu trúc ngữ pháp</div>
          </div>
          <div>
            <div className="landing-stat-num" style={{ color: '#ea580c' }}>8 Quy Tắc</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              Ngữ Pháp VSL Khoa Học
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Cấu trúc SOV & Phi thủ ngữ</div>
          </div>
          <div>
            <div className="landing-stat-num" style={{ color: '#8b5cf6' }}>75 Khớp</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginTop: '0.2rem' }}>
              Landmark Camera AI
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Phân tích cử chỉ 3D thời gian thực</div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3rem auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.3rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            fontSize: '0.78rem',
            fontWeight: 800,
            marginBottom: '0.75rem'
          }}>
            CÔNG NGHỆ ĐỘT PHÁ
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Công Nghệ AI Tiên Phong Cho Ngôn Ngữ Ký Hiệu
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.75rem' }}>
            Kết hợp thị giác máy tính hiện đại với phương pháp học tương tác trực quan giúp bạn nắm vững ký hiệu một cách chuẩn xác nhất.
          </p>
        </div>

        <div className="landing-features-grid">
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
              Từ Điển 400 Từ Độc Quyền 3 Góc Quay
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              Khác với video một góc truyền thống dễ bị che khuất ngón tay, Signlingo cung cấp cả 3 góc quay: 
              <strong> Chính diện, Nghiêng trái và Nghiêng phải</strong> cho mỗi từ vựng, giúp bạn nhìn rõ toàn bộ không gian cử chỉ.
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
              Minigames 5 Giây & Gamification
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              Thử thách phản xạ nhanh 5s, chuỗi ngày Streak Duolingo, trái tim sinh mệnh, XP và Bảng xếp hạng thi đua 
              giúp quá trình học ngôn ngữ ký hiệu trở nên đầy hứng khởi mỗi ngày.
            </p>
          </div>
        </div>
      </section>

      {/* 5. NEW: VSL Grammar Showcase Section */}
      <section id="grammar" className="landing-grammar-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="landing-grammar-grid">
            {/* Left Content */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '0.8rem',
                fontWeight: 800,
                marginBottom: '1rem',
                border: '1px solid #bbf7d0'
              }}>
                <GraduationCap size={16} />
                <span>CHUYÊN ĐỀ NGỮ PHÁP CHUẨN KHOA HỌC</span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: '1rem' }}>
                Học Đúng <span style={{ color: '#059669' }}>Ngữ Pháp VSL</span> - Không Còn Lo Dịch "Word-by-Word"
              </h2>

              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                Ngôn ngữ ký hiệu không phải là tiếng Việt nói ghép từng chữ cái. VSL sở hữu hệ thống ngữ pháp độc lập, 
                vận hành theo tư duy thị giác và không gian 3 chiều. Signlingo giúp bạn làm chủ trọn vẹn bản chất này:
              </p>

              {/* Grammar Key Pillars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Layers size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Cấu trúc "Chủ đề – Lời dẫn" & Trật tự SOV
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Định hình đối tượng trong không gian thị giác trước (Chủ đề / Bổ ngữ), sau đó mới thực hiện hành động (Lời dẫn / Động từ).
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Quy tắc cụm từ: Danh từ + Số từ & Tính từ
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Khác với tiếng nói ("4 sinh viên"), VSL luôn làm ký hiệu sự vật trước rồi mới xòe số lượng ("Sinh viên / 4").
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Smile size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Yếu tố Phi Thủ Ngữ (NMM - Non-Manual Markers)
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Biểu cảm khuôn mặt, rướn mày, hạ mày, cử động đầu và ánh mắt quyết định 50% ngữ nghĩa của câu hỏi hay phủ định.
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenAuth('register')}
                className="landing-btn-primary"
                style={{ backgroundColor: '#059669', boxShadow: '0 4px 0 #047857' }}
              >
                <span>Luyện tập Ngữ pháp VSL ngay</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Right Interactive Visual Comparison */}
            <div className="landing-grammar-compare-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>
                  So sánh tư duy ngữ pháp
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                  Quy tắc cốt lõi
                </span>
              </div>

              {/* Case 1: SOV */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>
                  Ví dụ 1: Cấu trúc câu trần thuật
                </div>
                <div className="landing-compare-row">
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Tiếng Việt nói (SVO)
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginTop: '0.35rem' }}>
                      "Tôi thích màu đỏ"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Chủ ngữ ➔ Động từ ➔ Bổ ngữ
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ecfdf5', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                      Ngôn ngữ ký hiệu VSL (SOV)
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#047857', marginTop: '0.35rem' }}>
                      "Tôi / Màu đỏ / Thích"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
                      Chủ thể ➔ Định vị sự vật ➔ Cảm xúc
                    </div>
                  </div>
                </div>
              </div>

              {/* Case 2: Danh từ + Số từ */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>
                  Ví dụ 2: Trật tự đếm số lượng
                </div>
                <div className="landing-compare-row">
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Tiếng Việt nói
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginTop: '0.35rem' }}>
                      "4 sinh viên"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Số đếm đứng trước danh từ
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ecfdf5', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                      Ngôn ngữ ký hiệu VSL
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#047857', marginTop: '0.35rem' }}>
                      "Sinh viên / 4"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
                      Biết đối tượng trước ➔ Xòe số đếm sau
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Teaser */}
              <div style={{
                marginTop: '1.25rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                border: '1px dashed #86efac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={18} color="#059669" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534' }}>
                    Bộ trắc nghiệm 8 quy tắc VSL nhận thưởng XP
                  </span>
                </div>
                <button
                  onClick={() => onOpenAuth('register')}
                  style={{
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    cursor: 'pointer'
                  }}
                >
                  Thử trắc nghiệm
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW: VSL Common Sentences Section */}
      <section id="sentences" className="landing-sentences-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.3rem 0.85rem',
                borderRadius: '9999px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                fontSize: '0.78rem',
                fontWeight: 800,
                marginBottom: '0.65rem'
              }}>
                <MessageSquare size={15} />
                <span>GIAO TIẾP THỰC CHIẾN</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                100+ Mẫu Câu Giao Tiếp Đời Thường
              </h2>
              <p style={{ fontSize: '0.98rem', color: '#64748b', marginTop: '0.4rem', maxWidth: 650 }}>
                Chuyển từ học từng từ rời rạc sang ghép thành câu hoàn chỉnh. Tự tin trò chuyện mượt mà cùng cộng đồng người Điếc trong mọi bối cảnh.
              </p>
            </div>

            <button
              onClick={() => onOpenAuth('register')}
              className="landing-btn-blue"
            >
              <span>Xem toàn bộ 100 câu</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Sample Sentences Grid */}
          <div className="landing-sentences-grid">
            {sampleSentences.map((st, idx) => (
              <div key={idx} className="landing-sentence-card" onClick={() => onOpenAuth('register')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    backgroundColor: `${st.badgeColor}15`,
                    color: st.badgeColor,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    border: `1px solid ${st.badgeColor}40`
                  }}>
                    {st.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                    Mẫu câu #{idx + 1}
                  </span>
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.35rem' }}>
                  "{st.title}"
                </div>

                <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 700, marginBottom: '0.9rem' }}>
                  {st.structure}
                </div>

                {/* Word badges in sentence */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Cử chỉ ghép:</span>
                  {st.words.map((w, wIdx) => (
                    <span
                      key={wIdx}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      {w}
                    </span>
                  ))}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#22c55e', fontSize: '0.75rem', fontWeight: 800 }}>
                    <Play size={12} fill="#22c55e" />
                    <span>Video mẫu</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features highlight mini banner for sentences */}
          <div style={{
            marginTop: '2rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            backgroundColor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={20} color="#22c55e" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>Phân tích từng từ</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chi tiết vai trò trong câu</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={20} color="#22c55e" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>Video liên hoàn</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Quan sát chuyển tiếp cử chỉ</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={20} color="#22c55e" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>Ghép câu tương tác</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Luyện phản xạ cấu trúc SOV</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Dictionary Showcase Section */}
      <section id="dictionary" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '4.5rem 1.5rem' }}>
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
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 900, color: '#0f172a' }}>
                Từ Điển VSL 400 Từ Vựng Thực Tế
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.3rem' }}>
                Đầy đủ các chủ đề thiết thực: Chào hỏi, Gia đình, Ăn uống, Con số, Chữ cái, Xã hội...
              </p>
            </div>

            <button
              onClick={() => onOpenAuth('register')}
              className="landing-btn-blue"
            >
              <span>Khám phá toàn bộ 400 từ</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Word Preview Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem'
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
                <div style={{ position: 'relative', height: 120, backgroundColor: '#0f172a' }}>
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
                    top: 6,
                    left: 6,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#ffffff',
                    padding: '0.12rem 0.45rem',
                    borderRadius: '9999px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    3 góc quay
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 6,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Play size={12} fill="#ffffff" />
                  </div>
                </div>

                <div style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    {word.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                    {word.topic}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. How it works (3 Steps) */}
      <section id="how-it-works" style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 3rem auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 900, color: '#0f172a' }}>
            Lộ Trình Tiếp Cận Chỉ Với 3 Bước
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>
            Phương pháp học thực chiến kết hợp phản hồi thị giác tức thời từ AI
          </p>
        </div>

        <div className="landing-steps-grid">
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
              Học Từ Vựng & Ngữ Pháp
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              Nắm vững 400 từ vựng VSL 3 góc quay và thấu hiểu các nguyên tắc cấu trúc câu SOV chuẩn khoa học.
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
              Ghép Câu Thực Tế
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              Luyện 100 câu giao tiếp đời thường, xem video liên hoàn và thực hành bài tập ghép từ thành câu trực quan.
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
              Bật Camera & Chấm Điểm AI
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              Thực hành cử chỉ trước webcam. AI nhận diện 75 điểm khớp và phản hồi tức thì góc xoay, độ chính xác.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Bottom Call to Action Banner */}
      <section style={{
        backgroundColor: '#0284c7',
        color: '#ffffff',
        padding: '4.5rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
            Sẵn Sàng Làm Chủ Ngôn Ngữ Ký Hiệu?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '2.25rem' }}>
            Tham gia cùng hàng ngàn học viên để xóa bỏ rào cản giao tiếp, kết nối với cộng đồng người Điếc Việt Nam.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenAuth('register')}
              className="landing-btn-primary"
              style={{ padding: '0.95rem 2.25rem', fontSize: '1.05rem' }}
            >
              <span>Đăng ký tài khoản miễn phí</span>
              <ArrowRight size={20} />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              style={{
                padding: '0.9rem 2rem',
                borderRadius: '9999px',
                fontSize: '1rem',
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

      {/* 10. Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '2.5rem 1.5rem',
        borderTop: '1px solid #1e293b'
      }}>
        <div className="landing-footer-inner" style={{
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
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>• Dự án VSL thông minh ứng dụng AI</span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            © {new Date().getFullYear()} Signlingo Project. Vì cộng đồng người Điếc Việt Nam.
          </div>
        </div>
      </footer>
    </div>
  );
}
