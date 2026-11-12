import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Clock, 
  ArrowRight,
  Zap,
  BookOpen,
  Award,
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { getUserProfile, saveUserProfile, recalculateAdaptivePath } from '../data/personalizedStore';
import { authApi } from '../services/api';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  forceOnboarding = false,
  isMandatory = false,
  initialMode = 'login',
}) {
  const [step, setStep] = useState(forceOnboarding ? 'onboarding' : 'auth'); // 'auth' | 'onboarding'
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Trạng thái khảo sát Onboarding
  const [selectedLevel, setSelectedLevel] = useState('beginner'); // 'beginner' | 'elementary' | 'intermediate'
  const [learningGoalMinutes, setLearningGoalMinutes] = useState(15);
  const [priorityTopic, setPriorityTopic] = useState('greeting');

  // Trạng thái gọi API
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Đồng bộ trạng thái mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setIsRegister(initialMode === 'register');
      const currentProfile = getUserProfile();
      if (initialMode === 'register') {
        setEmail('');
        setPassword('');
        setFullName('');
      } else if (currentProfile && currentProfile.isLoggedIn) {
        setFullName(currentProfile.name || '');
        setEmail(currentProfile.email || '');
        setSelectedLevel(currentProfile.learningLevel || 'beginner');
        setLearningGoalMinutes(currentProfile.learningGoalMinutes || 15);
        setPriorityTopic(currentProfile.priorityTopic || 'greeting');
      } else {
        setEmail('');
        setPassword('');
        setFullName('');
      }

      if (forceOnboarding) {
        setStep('onboarding');
      } else {
        setStep('auth');
      }
    }
  }, [isOpen, forceOnboarding, initialMode]);

  if (!isOpen) return null;

  // Xử lý nộp form đăng nhập / đăng ký qua NestJS Backend API
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isRegister) {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('Vui lòng điền đầy đủ cả 3 thông tin: Họ và tên, Email và Mật khẩu!');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự!');
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Vui lòng nhập Email và Mật khẩu!');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        // 1. Đăng ký tài khoản mới qua API
        const data = await authApi.register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          learningLevel: selectedLevel
        });

        setSuccessMessage('Đăng ký thành công! Hãy thiết lập mục tiêu học tập.');
        const registeredName = data.user.fullName || fullName.trim();
        const profile = {
          id: data.user.id,
          name: registeredName,
          email: data.user.email,
          role: data.user.role === 'ADMIN' ? 'Quản trị viên' : 'Học viên chăm chỉ',
          isAdmin: data.user.role === 'ADMIN',
          learningLevel: selectedLevel,
          dailyGoalMinutes: 15,
          priorityTopic: 'greeting',
          streakDays: 1,
          totalXp: data.user.xp || 0,
          hearts: 5,
          gems: 100,
          isLoggedIn: true,
          hasCompletedOnboarding: false
        };
        saveUserProfile(profile);
        
        // Chuyển sang bước Onboarding để chọn cấp độ & mục tiêu
        setTimeout(() => {
          setStep('onboarding');
          setIsLoading(false);
        }, 600);
      } else {
        // 2. Đăng nhập qua API
        const data = await authApi.login({
          email: email.trim(),
          password
        });

        const profile = {
          id: data.user.id,
          name: data.user.fullName || 'Học viên Signlingo',
          email: data.user.email,
          role: data.user.role === 'ADMIN' ? 'Quản trị viên' : 'Học viên chăm chỉ',
          isAdmin: data.user.role === 'ADMIN',
          learningLevel: data.user.learningLevel || selectedLevel,
          dailyGoalMinutes: data.user.dailyGoalMinutes || 15,
          priorityTopic: data.user.priorityTopic || 'greeting',
          streakDays: data.user.streak || 1,
          totalXp: data.user.xp || 0,
          hearts: data.user.hearts ?? 5,
          gems: data.user.gems ?? 100,
          isLoggedIn: true,
          hasCompletedOnboarding: true
        };
        saveUserProfile(profile);
        recalculateAdaptivePath();

        if (onLoginSuccess) {
          onLoginSuccess(profile, profile.learningLevel);
        }
        setIsLoading(false);
        onClose();
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Có lỗi xảy ra trong quá trình xác thực. Vui lòng kiểm tra lại!');
    }
  };

  // Hoàn tất khảo sát trình độ và kích hoạt Lộ trình cá nhân
  const handleCompleteOnboarding = () => {
    const current = getUserProfile();
    const updatedProfile = saveUserProfile({
      ...current,
      name: fullName.trim() || current.name || 'Học viên Signlingo',
      email: email.trim() || current.email,
      isLoggedIn: true,
      hasCompletedOnboarding: true,
      learningLevel: selectedLevel,
      learningGoalMinutes,
      priorityTopic
    });

    // Kích hoạt sinh lộ trình thích ứng
    recalculateAdaptivePath();

    if (onLoginSuccess) {
      onLoginSuccess(updatedProfile, selectedLevel);
    }
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={() => {
        if (!isMandatory) onClose();
      }}
    >
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: step === 'onboarding' ? 580 : 460,
          transition: 'max-width 0.25s ease',
          position: 'relative'
        }}
      >
        {/* Nút đóng: chỉ hiển thị khi đã đăng nhập (không bị ép buộc) */}
        {!isMandatory && (
          <button className="modal-close-btn" onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        )}

        {/* BƯỚC 1: ĐĂNG NHẬP / ĐĂNG KÝ */}
        {step === 'auth' && (
          <div style={{ padding: '2.25rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}>
                <Sparkles size={26} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                {isRegister ? 'Tạo Tài Khoản Signlingo' : 'Đăng Nhập Signlingo'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {isRegister 
                  ? 'Đăng ký tài khoản để AI lưu trữ tiến trình học & phân tích cử chỉ' 
                  : 'Vui lòng đăng nhập bằng tài khoản của bạn để vào học'}
              </p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {errorMessage && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                color: '#dc2626',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontWeight: 600
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Thông báo thành công */}
            {successMessage && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-md)',
                color: '#16a34a',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontWeight: 600
              }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {isRegister && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                    Họ và tên của bạn: <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên đầy đủ của bạn"
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
                  Địa chỉ Email: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
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
                  Mật khẩu: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
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
                disabled={isLoading}
                className="btn-pill btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.4rem', gap: '0.5rem', justifyContent: 'center' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin-animation" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isRegister ? 'Đăng nhập ngay' : 'Đăng ký tài khoản mới'}
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
                Chào {fullName.split(' ').slice(-1)[0] || 'bạn'}! Trình độ VSL của bạn?
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                Chọn mức độ hiểu biết ngôn ngữ ký hiệu hiện tại để AI xây dựng lộ trình học thích ứng riêng cho bạn:
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
                  🌱
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      Level 1: Người mới hoàn toàn
                    </h3>
                    {selectedLevel === 'beginner' && <CheckCircle2 size={18} color="#0284c7" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Chưa từng tiếp xúc với ngôn ngữ ký hiệu. Bắt đầu từ cử chỉ chào hỏi, gia đình, ẩm thực quen thuộc.
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
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      Level 2: Đã biết cử chỉ cơ bản
                    </h3>
                    {selectedLevel === 'elementary' && <CheckCircle2 size={18} color="#0284c7" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Đã biết bảng chữ cái và các từ vựng giao tiếp đơn giản. Muốn ghép từ thành câu và tăng tốc độ phản xạ.
                  </p>
                </div>
              </div>

              {/* Mức 3: Nâng cao */}
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
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      Level 3: Giao tiếp nâng cao
                    </h3>
                    {selectedLevel === 'intermediate' && <CheckCircle2 size={18} color="#0284c7" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Đã giao tiếp được các câu thông thường. Muốn tinh chỉnh độ chính xác của góc tay, ngón tay qua camera AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Lựa chọn Mục tiêu thời gian học mỗi ngày */}
            <div style={{ marginBottom: '1.5rem', padding: '0.9rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.6rem' }}>
                <Clock size={16} color="#0284c7" />
                <span>Mục tiêu luyện tập mỗi ngày:</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { min: 10, label: 'Thong thả (10p)' },
                  { min: 15, label: 'Tiêu chuẩn (15p)' },
                  { min: 30, label: 'Chăm chỉ (30p)' }
                ].map((item) => (
                  <button
                    key={item.min}
                    type="button"
                    onClick={() => setLearningGoalMinutes(item.min)}
                    style={{
                      padding: '0.5rem 0.2rem',
                      borderRadius: 'var(--radius-pill)',
                      border: `1.5px solid ${learningGoalMinutes === item.min ? '#0284c7' : '#cbd5e1'}`,
                      backgroundColor: learningGoalMinutes === item.min ? '#0284c7' : '#ffffff',
                      color: learningGoalMinutes === item.min ? '#ffffff' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
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
              style={{ width: '100%', gap: '0.5rem', justifyContent: 'center' }}
            >
              <span>Bắt Đầu Hành Trình Học Tập</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
