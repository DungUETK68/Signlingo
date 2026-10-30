import React, { useState } from 'react';
import { USER_PROFILE } from '../../data/mockData';
import { 
  RotateCcw, 
  AlertTriangle, 
  Flame, 
  Zap, 
  Calendar, 
  TrendingUp,
  CheckCircle2,
  Award
} from 'lucide-react';

export default function DashboardView({ onStartPracticeWord }) {
  const profile = USER_PROFILE;
  const [hoveredDay, setHoveredDay] = useState(null);

  const maxXp = Math.max(...profile.weeklyActivity.map(d => d.xp), 250);
  const activeDay = hoveredDay || profile.weeklyActivity[profile.weeklyActivity.length - 1]; // mặc định là CN (hôm nay)

  return (
    <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      {/* User Info Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
          alt={profile.name}
          style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
            {profile.name}
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Cấp {profile.level}: {profile.levelTitle}
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <div className="mini-card" style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7' }}>{profile.completedWordsCount}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Từ đã thuộc</div>
        </div>
        <div className="mini-card" style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f97316' }}>{profile.streakDays}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Ngày streak</div>
        </div>
        <div className="mini-card" style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22c55e' }}>{profile.avgAiScore}%</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Điểm AI TB</div>
        </div>
      </div>

      {/* Weekly Activity (Biểu đồ hoạt động 7 ngày qua được thiết kế hoàn thiện) */}
      <div className="mini-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <Calendar size={18} color="#0284c7" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Hoạt động 7 ngày qua
              </h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Duy trì luyện tập đều đặn giúp tăng phản xạ ký hiệu tự nhiên
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.3rem 0.7rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              border: '1px solid #ffedd5'
            }}>
              <Flame size={14} fill="#ea580c" />
              {profile.streakDays} ngày liên tiếp
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.3rem 0.7rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              border: '1px solid #bae6fd'
            }}>
              <Zap size={14} fill="#0284c7" />
              1,240 XP tuần này
            </span>
          </div>
        </div>

        {/* Khung biểu đồ cột dạng pill hiện đại */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: 150,
          padding: '1rem 0.5rem 0.5rem 0.5rem',
          backgroundColor: '#fafbfc',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #f1f5f9',
          gap: '0.5rem'
        }}>
          {profile.weeklyActivity.map((day) => {
            const isHovered = hoveredDay?.day === day.day;
            const isToday = day.day === 'CN';
            // Chiều cao pixel từ 16px đến 85px
            const barHeightPx = Math.max(18, Math.round((day.xp / maxXp) * 85));

            return (
              <div 
                key={day.day} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'flex-end',
                  height: '100%',
                  flex: 1,
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Chỉ số XP hiển thị trên cột */}
                <span style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 800, 
                  color: isHovered || isToday ? '#0284c7' : '#94a3b8',
                  marginBottom: '0.35rem',
                  transition: 'all 0.2s ease',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                }}>
                  {day.xp}
                </span>

                {/* Hộp chứa thanh cột (Track) */}
                <div style={{
                  width: 32,
                  height: 90,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 2,
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  border: isHovered ? '1.5px solid #38bdf8' : isToday ? '1.5px solid #bae6fd' : '1.5px solid transparent'
                }}>
                  {/* Thanh fill tiến độ */}
                  <div style={{
                    width: '100%',
                    height: `${barHeightPx}px`,
                    background: isHovered || isToday 
                      ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)' 
                      : 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: isHovered ? '0 3px 8px rgba(2, 132, 199, 0.4)' : 'none',
                    transition: 'all 0.2s ease'
                  }} />
                </div>

                {/* Tên thứ trong tuần */}
                <span style={{ 
                  fontSize: '0.78rem', 
                  fontWeight: isToday ? 900 : 700, 
                  color: isToday ? '#0284c7' : isHovered ? '#1e293b' : '#64748b',
                  marginTop: '0.45rem',
                  padding: isToday ? '0.1rem 0.4rem' : '0',
                  borderRadius: isToday ? 'var(--radius-pill)' : '0',
                  backgroundColor: isToday ? '#e0f2fe' : 'transparent'
                }}>
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Thẻ chi tiết ngày hoạt động (Interactive Tooltip / Detail Bar) */}
        {activeDay && (
          <div style={{
            marginTop: '0.85rem',
            padding: '0.65rem 1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #bae6fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: '#0369a1' }}>
                Thứ: {activeDay.day === 'CN' ? 'Chủ Nhật (Hôm nay)' : `Thứ ${activeDay.day.slice(1)}`}
              </span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{ color: '#0284c7', fontWeight: 700 }}>
                +{activeDay.xp} XP đạt được
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
              <span>Đã luyện: <strong style={{ color: '#1e293b' }}>{activeDay.words} từ vựng</strong></span>
              <span>•</span>
              <span>Độ chính xác AI TB: <strong style={{ color: '#16a34a' }}>{activeDay.score}%</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Weakness Radar: Từ vựng cần ôn lại */}
      <div className="mini-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
          <AlertTriangle size={16} color="#f97316" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
            Từ vựng cần ôn lại
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {profile.weaknesses.map(w => (
            <div
              key={w.wordId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa'
              }}
            >
              <div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>"{w.word}"</span>
                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#c2410c', fontWeight: 700 }}>
                  {w.avgScore}%
                </span>
                <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>{w.commonError}</div>
              </div>

              <button
                className="btn-pill btn-primary btn-sm"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                onClick={() => onStartPracticeWord(w.word)}
              >
                <RotateCcw size={13} />
                <span>Ôn lại</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
