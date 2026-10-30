import React from 'react';
import { 
  Flame, 
  Sparkles, 
  Trophy, 
  Camera, 
  Target, 
  Sliders, 
  UserCheck, 
  ChevronRight,
  Compass
} from 'lucide-react';
import { LEADERBOARD } from '../data/mockData';

export default function RightSidebar({ 
  userProfile, 
  onOpenAuth, 
  onOpenSurvey,
  onStartPractice, 
  onSelectTab 
}) {
  const getLevelLabel = (lvl) => {
    if (lvl === 'elementary') return 'Level 2: Đã biết cơ bản';
    if (lvl === 'intermediate') return 'Level 3: Nâng cao';
    return 'Level 1: Mới bắt đầu';
  };

  return (
    <aside className="right-sidebar">
      {/* Top Quick Status Chips */}
      <div className="stats-header-row">
        <div 
          className="stat-chip stat-chip-streak" 
          title="Chuỗi ngày liên tục"
          onClick={() => onSelectTab('dashboard')}
        >
          <Flame size={18} fill="#f97316" color="#f97316" />
          <span>{userProfile?.streakDays || 7}</span>
        </div>

        <div className="stat-chip stat-chip-gems" title="Điểm kinh nghiệm XP">
          <Sparkles size={16} color="#0891b2" />
          <span>{userProfile?.totalXp || 1240}</span>
        </div>

        {/* Nút bấm tài khoản */}
        <button 
          onClick={onOpenAuth}
          title="Bấm để đăng nhập hoặc đổi tài khoản"
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
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
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
            title="Đổi mức độ hiểu / Khảo sát lại"
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
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {userProfile?.name || 'Học viên'}
          </span>
          <button
            onClick={onOpenAuth}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Đổi tài khoản
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
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>2 / 3 bài</span>
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
          {LEADERBOARD.slice(0, 3).map((u, i) => (
            <div 
              key={u.rank} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.4rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: u.isMe ? '#f0f9ff' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#64748b', width: 14 }}>
                  {i + 1}
                </span>
                <img src={u.avatar} alt={u.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  {u.name.split(' ').slice(-1)[0]}
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
        onClick={() => onStartPractice('Chào')}
      >
        <Camera size={18} />
        <span>Luyện camera ngay</span>
      </button>
    </aside>
  );
}
