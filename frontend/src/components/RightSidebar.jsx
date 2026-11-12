import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Sparkles, 
  Trophy, 
  Camera, 
  Target, 
  Sliders, 
  UserCheck, 
  ChevronRight,
  Compass,
  Heart,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { LEADERBOARD } from '../data/mockData';
import { progressApi, userApi } from '../services/api';

export default function RightSidebar({ 
  userProfile, 
  onOpenAuth, 
  onOpenSurvey,
  onStartPractice, 
  onSelectTab,
  onLogout
}) {
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD.slice(0, 3));
  const [refillToast, setRefillToast] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng menu hồ sơ khi bấm chuột ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleRefillHearts = async () => {
    try {
      await userApi.refillHearts();
      setRefillToast('❤️ Đã nạp lại 5 trái tim!');
      window.dispatchEvent(new CustomEvent('signlingo_personalized_updated', { detail: { hearts: 5 } }));
      setTimeout(() => setRefillToast(''), 3000);
    } catch (e) {
      setRefillToast('❤️ Đã nạp lại 5 trái tim!');
      setTimeout(() => setRefillToast(''), 3000);
    }
  };

  // Tải bảng xếp hạng thực tế từ backend NestJS
  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      try {
        const data = await progressApi.getLeaderboard(5);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLeaderboard(data.slice(0, 4));
        }
      } catch (err) {
        console.warn('Không thể tải leaderboard từ server:', err);
      }
    };
    fetchLeaderboard();
    return () => { isMounted = false; };
  }, [userProfile?.totalXp]);

  const getLevelLabel = (lvl) => {
    if (lvl === 'elementary') return 'Level 2: Đã biết cơ bản';
    if (lvl === 'intermediate') return 'Level 3: Nâng cao';
    return 'Level 1: Mới bắt đầu';
  };

  const streak = userProfile?.streakDays || userProfile?.streak || 1;
  const xp = userProfile?.totalXp ?? userProfile?.xp ?? 0;
  const hearts = userProfile?.hearts ?? 5;

  return (
    <aside className="right-sidebar">
      {refillToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.65rem 1.15rem',
          borderRadius: 'var(--radius-pill)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontSize: '0.82rem',
          fontWeight: 800,
          border: '1px solid #ef4444',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {refillToast}
        </div>
      )}
      {/* Top Quick Status Chips */}
      <div className="stats-header-row">
        {/* Hearts */}
        <div 
          className="stat-chip" 
          title="Bấm để nạp lại đầy 5 trái tim" 
          style={{ color: '#ef4444', cursor: 'pointer' }}
          onClick={handleRefillHearts}
        >
          <Heart size={16} fill="#ef4444" color="#ef4444" />
          <span>{hearts}</span>
        </div>

        {/* Streak */}
        <div 
          className="stat-chip stat-chip-streak" 
          title="Chuỗi ngày luyện tập liên tục"
          onClick={() => onSelectTab('dashboard')}
        >
          <Flame size={18} fill="#f97316" color="#f97316" />
          <span>{streak}</span>
        </div>

        {/* XP */}
        <div className="stat-chip stat-chip-gems" title="Tổng điểm kinh nghiệm XP">
          <Sparkles size={16} color="#0891b2" />
          <span>{xp}</span>
        </div>

        {/* Avatar Profile with Dropdown Menu */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            title="Thông tin tài khoản & Đăng xuất"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              padding: 0
            }}
          >
            <img
              src={userProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
              alt="User"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                border: isProfileMenuOpen ? '2px solid #0284c7' : '2px solid #0284c7',
                boxShadow: isProfileMenuOpen ? '0 0 0 3px rgba(2, 132, 199, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            />
          </button>

          {/* User Profile Dropdown */}
          {isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: 280,
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0',
                padding: '1.1rem',
                zIndex: 1000,
                animation: 'fadeIn 0.15s ease'
              }}
            >
              {/* Header: Avatar, Name, Email, Role */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.9rem' }}>
                <img
                  src={userProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
                  alt="Avatar"
                  style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7', flexShrink: 0 }}
                />
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userProfile?.name || 'Học viên'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userProfile?.email || 'Chưa cập nhật email'}
                  </div>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.25rem',
                    padding: '0.12rem 0.5rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    backgroundColor: (userProfile?.isAdmin || userProfile?.role === 'Quản trị viên') ? '#ecfdf5' : '#f0f9ff',
                    color: (userProfile?.isAdmin || userProfile?.role === 'Quản trị viên') ? '#059669' : '#0284c7'
                  }}>
                    {(userProfile?.isAdmin || userProfile?.role === 'Quản trị viên') ? 'Quản trị viên' : 'Học viên chăm chỉ'}
                  </span>
                </div>
              </div>

              {/* Thông tin thống kê nhanh */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '0.9rem',
                border: '1px solid #f1f5f9'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Trình độ:</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
                    {getLevelLabel(userProfile?.learningLevel)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Kinh nghiệm:</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7' }}>
                    {xp} XP
                  </div>
                </div>
              </div>

              {/* Danh sách hành động */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onSelectTab('dashboard');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#334155',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <UserIcon size={16} color="#0284c7" />
                  <span>Trang cá nhân & Cài đặt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#dc2626',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                >
                  <LogOut size={16} color="#dc2626" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile & Personalized Status Card */}
      <div className="mini-card" style={{ padding: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', fontWeight: 800, color: '#0284c7' }}>
            <Compass size={14} />
            <span>TRÌNH ĐỘ HỌC HIỆN TẠI</span>
          </div>
          <button
            onClick={onOpenSurvey}
            title="Đổi mục tiêu / Khảo sát lại trình độ"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.1rem'
            }}
          >
            <Sliders size={14} />
          </button>
        </div>

        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.2rem' }}>
          {getLevelLabel(userProfile?.learningLevel)}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
              {userProfile?.name || 'Học viên'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {userProfile?.email || ''}
            </span>
          </div>
          
          {/* Nút Đăng xuất */}
          <button
            onClick={onLogout}
            title="Đăng xuất khỏi tài khoản"
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <LogOut size={12} />
            <span>Thoát</span>
          </button>
        </div>
      </div>

      {/* Daily Quest Card */}
      <div className="mini-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.92rem', color: '#1e293b' }}>
            <Target size={16} color="#0284c7" />
            <span>Mục tiêu ngày</span>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>{userProfile?.dailyGoalMinutes || 15} phút</span>
        </div>
        <div style={{
          height: 10,
          backgroundColor: '#f1f5f9',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden'
        }}>
          <div style={{ width: '66%', height: '100%', backgroundColor: '#22c55e', borderRadius: 'var(--radius-pill)' }} />
        </div>
      </div>

      {/* Mini Leaderboard Widget */}
      <div className="mini-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.92rem', color: '#1e293b' }}>
            <Trophy size={16} color="#f59e0b" />
            <span>Bảng xếp hạng tuần</span>
          </div>
          <span 
            style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => onSelectTab('games')}
          >
            Xem tất cả
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {leaderboard.map((u, i) => (
            <div 
              key={u.id || u.rank || i} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.4rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: u.id === userProfile?.id ? '#f0f9ff' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#64748b', width: 14 }}>
                  {i + 1}
                </span>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#0284c7'
                }}>
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.fullName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    (u.fullName || u.name || 'H').charAt(0).toUpperCase()
                  )}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  {(u.fullName || u.name || 'Học viên').split(' ').slice(-1)[0]}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>
                {u.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fast Practice CTA */}
      <button 
        className="btn-pill btn-primary"
        style={{ width: '100%', gap: '0.5rem', marginTop: 'auto' }}
        onClick={() => onStartPractice('Cảm ơn')}
      >
        <Camera size={18} />
        <span>Thực hành camera AI</span>
      </button>
    </aside>
  );
}
