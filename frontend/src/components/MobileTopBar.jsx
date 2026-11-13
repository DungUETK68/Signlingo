import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Sparkles,
  Flame,
  Heart,
  LogOut,
  User as UserIcon,
  Hand
} from 'lucide-react';
import { userApi } from '../services/api';

export default function MobileTopBar({
  userProfile,
  onOpenDrawer,
  onSelectTab,
  onLogout
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [refillToast, setRefillToast] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
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

  const streak = userProfile?.streakDays || userProfile?.streak || 1;
  const xp = userProfile?.totalXp ?? userProfile?.xp ?? 0;
  const hearts = userProfile?.hearts ?? 5;

  const getLevelLabel = (lvl) => {
    if (lvl === 'elementary') return 'Level 2: Cơ bản';
    if (lvl === 'intermediate') return 'Level 3: Nâng cao';
    return 'Level 1: Mới bắt đầu';
  };

  return (
    <header className="mobile-top-bar">
      {refillToast && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          fontSize: '0.8rem',
          fontWeight: 800,
          whiteSpace: 'nowrap'
        }}>
          {refillToast}
        </div>
      )}

      {/* Left: Hamburger & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <button
          type="button"
          onClick={onOpenDrawer}
          style={{
            background: 'none',
            border: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.4rem',
            cursor: 'pointer',
            borderRadius: '8px'
          }}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} strokeWidth={2.4} />
        </button>

        <div
          onClick={() => onSelectTab('personalized')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
        >
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
          }}>
            <Hand size={18} strokeWidth={2.4} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0284c7', letterSpacing: '-0.5px' }}>
            Signlingo
          </span>
        </div>
      </div>

      {/* Right: Stats & Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        {/* Hearts */}
        <div
          onClick={handleRefillHearts}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
          title="Bấm để nạp lại đầy tim"
        >
          <Heart size={14} fill="#ef4444" color="#ef4444" />
          <span>{hearts}</span>
        </div>

        {/* Streak */}
        <div
          onClick={() => onSelectTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: '#ffedd5',
            color: '#f97316',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
          title="Chuỗi ngày luyện tập"
        >
          <Flame size={15} fill="#f97316" color="#f97316" />
          <span>{streak}</span>
        </div>

        {/* XP */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: '#cffafe',
            color: '#0891b2',
            fontSize: '0.8rem',
            fontWeight: 800
          }}
          title="Kinh nghiệm XP"
        >
          <Sparkles size={14} color="#0891b2" />
          <span>{xp}</span>
        </div>

        {/* Avatar & Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
            aria-label="User Profile"
          >
            <img
              src={userProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
              alt="Avatar"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
                border: isProfileMenuOpen ? '2px solid #0284c7' : '2px solid #cbd5e1'
              }}
            />
          </button>

          {isProfileMenuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 270,
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              border: '1.5px solid #e2e8f0',
              padding: '1rem',
              zIndex: 1000
            }}>
              {/* User Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <img
                  src={userProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
                  alt="Avatar"
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }}
                />
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userProfile?.name || 'Học viên'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userProfile?.email || 'Học viên Signlingo'}
                  </div>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.2rem',
                    padding: '0.1rem 0.45rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    backgroundColor: (userProfile?.isAdmin || userProfile?.role === 'Quản trị viên') ? '#ecfdf5' : '#f0f9ff',
                    color: (userProfile?.isAdmin || userProfile?.role === 'Quản trị viên') ? '#059669' : '#0284c7'
                  }}>
                    {(userProfile?.isAdmin || userProfile?.role === 'Quản trị viên') ? 'Quản trị viên' : 'Học viên chăm chỉ'}
                  </span>
                </div>
              </div>

              {/* Stats Snapshot */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.4rem',
                padding: '0.5rem 0.65rem',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                marginBottom: '0.85rem',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Trình độ:</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                    {getLevelLabel(userProfile?.learningLevel)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Kinh nghiệm:</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7' }}>
                    {xp} XP
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onSelectTab('dashboard');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#334155',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <UserIcon size={15} color="#0284c7" />
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
                    gap: '0.55rem',
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#dc2626',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={15} color="#dc2626" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

