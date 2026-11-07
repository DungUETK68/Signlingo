import React, { useState, useEffect } from 'react';
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
import { progressApi } from '../services/api';

export default function RightSidebar({ 
  userProfile, 
  onOpenAuth, 
  onOpenSurvey,
  onStartPractice, 
  onSelectTab,
  onLogout
}) {
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD.slice(0, 3));

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
      {/* Top Quick Status Chips */}
      <div className="stats-header-row">
        {/* Hearts */}
        <div className="stat-chip" title="Số lượt thực hành (Trái tim)" style={{ color: '#ef4444' }}>
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

        {/* Avatar Profile */}
        <button 
          onClick={onOpenAuth}
          title="Thông tin tài khoản"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <img
            src={userProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
            alt="User"
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }}
          />
        </button>
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
              {userProfile?.name || 'Học viên Signlingo'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {userProfile?.email || 'learner@signlingo.com'}
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
