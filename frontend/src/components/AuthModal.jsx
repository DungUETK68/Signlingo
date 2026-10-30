import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Clock, 
  ArrowRight,
  Zap,
  BookOpen,
  Award
} from 'lucide-react';
import { getUserProfile, saveUserProfile, recalculateAdaptivePath } from '../data/personalizedStore';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, forceOnboarding = false }) {
  const [step, setStep] = useState(forceOnboarding ? 'onboarding' : 'auth'); // 'auth' | 'onboarding'
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('minhanh.signlingo@edu.vn');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('Nguyễn Minh Anh');

  // Trạng thái khảo sát Onboarding
  const [selectedLevel, setSelectedLevel] = useState('beginner'); // 'beginner' | 'elementary' | 'intermediate'
  const [learningGoalMinutes, setLearningGoalMinutes] = useState(15);
  const [priorityTopic, setPriorityTopic] = useState('greeting');

  // Đồng bộ trạng thái mỗi khi mở modal: nếu đã đăng nhập hoặc bấm khảo sát lại -> chuyển thẳng đến bước chọn mức độ
  useEffect(() => {
    if (isOpen) {
      const currentProfile = getUserProfile();
      if (currentProfile) {
        setFullName(currentProfile.name || 'Nguyễn Minh Anh');
        setEmail(currentProfile.email || 'minhanh.signlingo@edu.vn');
        setSelectedLevel(currentProfile.learningLevel || 'beginner');
        setLearningGoalMinutes(currentProfile.learningGoalMinutes || 15);
        setPriorityTopic(currentProfile.priorityTopic || 'greeting');
      }

      // Phân định rõ ràng:
      // - Nếu ấn "Khảo sát lại" (forceOnboarding === true) -> chuyển thẳng tới màn hình chọn mức độ ('onboarding')
      // - Nếu ấn "Đổi tài khoản" (forceOnboarding === false) -> hiển thị form đăng nhập ('auth')
      if (forceOnboarding) {
        setStep('onboarding');
      } else {
        setStep('auth');
      }
    }
  }, [isOpen, forceOnboarding]);

  if (!isOpen) return null;

  // Xử lý nộp form đăng nhập / đăng ký
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!isRegister && (!fullName || fullName === 'Nguyễn Minh Anh')) {
      // Nếu là đăng nhập, tự động lấy tên từ email nếu chưa có
      const username = email.split('@')[0] || 'học viên';
      const cleanName = username.charAt(0).toUpperCase() + username.slice(1);
      setFullName(cleanName);
    }
    // Chuyển sang bước Khảo sát trình độ ban đầu để cá nhân hóa lộ trình
    setStep('onboarding');
  };

  // Hoàn tất khảo sát trình độ và kích hoạt Lộ trình cá nhân
  const handleCompleteOnboarding = () => {
    const updatedProfile = saveUserProfile({
      name: fullName || 'Học viên Signlingo',
      email: email || 'user@signlingo.edu.vn',
      role: 'Học viên chăm chỉ',
      isLoggedIn: true,
      hasCompletedOnboarding: true,
      learningLevel: selectedLevel,
      learningGoalMinutes,
      priorityTopic,
      streakDays: 7,
      totalXp: 1240
    });

    // Kích hoạt sinh lộ trình thích ứng
    recalculateAdaptivePath();

    if (onLoginSuccess) {
      onLoginSuccess(updatedProfile, selectedLevel);
    }
    onClose();
  };

  // Chọn nhanh tài khoản demo để test
  const handleQuickDemo = (demoType) => {
    if (demoType === 'beginner') {
      setFullName('Nguyễn Minh Anh (Mới học)');
      setEmail('minhanh.beginner@edu.vn');
      setSelectedLevel('beginner');
    } else if (demoType === 'elementary') {
      setFullName('Trần Quốc Huy (Đã biết cơ bản)');
      setEmail('quochuy.basic@edu.vn');
      setSelectedLevel('elementary');
    } else {
      setFullName('Lê Hoàng Nam (Nâng cao)');
      setEmail('hoangnam.pro@edu.vn');
      setSelectedLevel('intermediate');
    }
    setStep('onboarding');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: step === 'onboarding' ? 580 : 460,
          transition: 'max-width 0.25s ease' 
        }}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* BƯỚC 1: ĐĂNG NHẬP / ĐĂNG KÝ */}
        {step === 'auth' && (
          <div style={{ padding: '2.25rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}>
                <Sparkles size={24} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                {isRegister ? 'Tạo Tài Khoản Signlingo' : 'Chào Mừng Trở Lại!'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {isRegister ? 'Đăng ký tài khoản để AI thiết lập lộ trình riêng' : 'Đăng nhập để tiếp tục hành trình học ngôn ngữ ký hiệu'}
              </p>
              <div style={{
                marginTop: '0.65rem',
                fontSize: '0.78rem',
                color: '#0284c7',
                backgroundColor: '#e0f2fe',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-block',
                fontWeight: 600
              }}>
                💡 Nhập bất kỳ email & mật khẩu nào vẫn đăng nhập thành công
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {isRegister && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                    Họ và tên của bạn:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required={isRegister}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                        borderRadius: 'var(--radius-pill)',
                        border: '1.5px solid var(--border-light)',
                        outline: 'none',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                  Địa chỉ Email:
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.6rem',
                      borderRadius: 'var(--radius-pill)',
                      border: '1.5px solid var(--border-light)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                  Mật khẩu:
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập bất kỳ mật khẩu nào"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.6rem',
                      borderRadius: 'var(--radius-pill)',
                      border: '1.5px solid var(--border-light)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pill btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.4rem', gap: '0.4rem' }}
              >
                <span>{isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Quick Demo Selector */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textAlign: 'center', marginBottom: '0.6rem' }}>
                HOẶC THỬ NGHIỆM NHANH VỚI MẪU:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('beginner')}
                  className="btn-pill btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '0.4rem 0.3rem', textAlign: 'center', justifyContent: 'center' }}
                >
                  🐣 Người mới
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('elementary')}
                  className="btn-pill btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '0.4rem 0.3rem', textAlign: 'center', justifyContent: 'center' }}
                >
                  🌿 Cơ bản
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('intermediate')}
                  className="btn-pill btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '0.4rem 0.3rem', textAlign: 'center', justifyContent: 'center' }}
                >
                  🚀 Nâng cao
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isRegister ? 'Đăng nhập ngay' : 'Đăng ký miễn phí'}
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 2: KHẢO SÁT CÁ NHÂN HÓA TRÌNH ĐỘ BAN ĐẦU (ONBOARDING ASSESSMENT) */}
        {step === 'onboarding' && (
          <div style={{ padding: '2rem 1.75rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem',
                fontWeight: 800,
                marginBottom: '0.5rem'
              }}>
                <Compass size={14} />
                <span>CÁ NHÂN HÓA BẰNG AI</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Chào {fullName.split(' ').slice(-1)[0]}! Trình độ VSL của bạn?
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                Hãy chọn mức độ hiểu biết ngôn ngữ ký hiệu hiện tại để AI xây dựng lộ trình học thích ứng riêng cho bạn:
              </p>
            </div>

            {/* 3 Mức Độ Lựa Chọn */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {/* Mức 1: Người mới bắt đầu */}
              <div
                onClick={() => setSelectedLevel('beginner')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${selectedLevel === 'beginner' ? '#0284c7' : '#e2e8f0'}`,
                  backgroundColor: selectedLevel === 'beginner' ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  fontSize: '1.6rem',
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: selectedLevel === 'beginner' ? '#e0f2fe' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  🐣
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                      Người mới bắt đầu (Level 1)
                    </h4>
                    {selectedLevel === 'beginner' && <CheckCircle2 size={18} color="#0284c7" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>
                    Chưa từng học ngôn ngữ ký hiệu. Lộ trình AI bắt đầu từ <strong>bảng chữ cái ngón tay, số đếm từ 1-10</strong> và các cử chỉ chào hỏi vỡ lòng.
                  </p>
                </div>
              </div>

              {/* Mức 2: Đã biết cơ bản */}
              <div
                onClick={() => setSelectedLevel('elementary')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${selectedLevel === 'elementary' ? '#0284c7' : '#e2e8f0'}`,
                  backgroundColor: selectedLevel === 'elementary' ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  fontSize: '1.6rem',
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: selectedLevel === 'elementary' ? '#e0f2fe' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  🌿
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                      Đã biết cơ bản (Level 2)
                    </h4>
                    {selectedLevel === 'elementary' && <CheckCircle2 size={18} color="#0284c7" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>
                    Đã thuộc chữ cái và số đếm. Lộ trình AI tự động bỏ qua phần chữ cái, đi thẳng vào <strong>giao tiếp đời sống, gia đình, ẩm thực</strong> và đàm thoại ngắn.
                  </p>
                </div>
              </div>

              {/* Mức 3: Đã có nền tảng */}
              <div
                onClick={() => setSelectedLevel('intermediate')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${selectedLevel === 'intermediate' ? '#0284c7' : '#e2e8f0'}`,
                  backgroundColor: selectedLevel === 'intermediate' ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  fontSize: '1.6rem',
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: selectedLevel === 'intermediate' ? '#e0f2fe' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  🚀
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                      Đã có nền tảng / Nâng cao (Level 3)
                    </h4>
                    {selectedLevel === 'intermediate' && <CheckCircle2 size={18} color="#0284c7" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>
                    Đã giao tiếp được. Lộ trình AI tập trung vào <strong>tốc độ phản xạ cao (Speed 5s), biểu cảm khuôn mặt</strong> và chinh phục độ chính xác vi khớp 95%+.
                  </p>
                </div>
              </div>
            </div>

            {/* Mục Tiêu Thời Gian Học Mỗi Ngày */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Clock size={16} color="#0284c7" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e293b' }}>
                  Thời lượng học mỗi ngày:
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { m: 5, label: '🐢 Thong thả (5p)' },
                  { m: 15, label: '⚡ Tiêu chuẩn (15p)' },
                  { m: 30, label: '🔥 Cấp tốc (30p)' }
                ].map(item => (
                  <button
                    key={item.m}
                    type="button"
                    onClick={() => setLearningGoalMinutes(item.m)}
                    className={`btn-pill ${learningGoalMinutes === item.m ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem', textAlign: 'center', justifyContent: 'center' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteOnboarding}
              className="btn-pill btn-primary btn-lg"
              style={{ width: '100%', gap: '0.5rem', boxShadow: 'var(--btn-shadow)' }}
            >
              <Sparkles size={18} />
              <span>Cập Nhật Lộ Trình Cá Nhân Hóa Ngay</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: '#64748b' }}>
              Muốn sử dụng tài khoản khác?{' '}
              <button
                type="button"
                onClick={() => setStep('auth')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Đăng nhập tài khoản khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
