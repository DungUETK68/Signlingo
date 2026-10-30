import React from 'react';
import {
  BookOpen,
  Search,
  Camera,
  Zap,
  BookmarkCheck,
  User,
  Settings,
  Hand,
  Sparkles
} from 'lucide-react';
import { useSavedLessons } from '../data/wordsStore';

const NAV_ITEMS = [
  { id: 'personalized', label: 'Lộ trình cá nhân', icon: Sparkles, isAi: true },
  { id: 'learning', label: 'Lộ trình chuẩn', icon: BookOpen },
  { id: 'dictionary', label: 'Từ điển', icon: Search },
  { id: 'practice', label: 'Luyện tập AI', icon: Camera, highlight: true },
  { id: 'games', label: 'Thử thách', icon: Zap },
  { id: 'review', label: 'Ôn tập', icon: BookmarkCheck },
  { id: 'dashboard', label: 'Hồ sơ', icon: User },
  { id: 'admin', label: 'Quản trị', icon: Settings },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  const { savedLessons } = useSavedLessons();
  return (
    <aside className="left-sidebar">
      {/* Brand Header */}
      <div className="brand-header" onClick={() => onSelectTab('personalized')}>
        <div className="brand-icon">
          <Hand size={22} strokeWidth={2.4} />
        </div>
        <span className="brand-name">Signlingo</span>
      </div>

      {/* Navigation Buttons */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} color={item.isAi ? (isActive ? '#ffffff' : '#0284c7') : undefined} />
              <span style={{ fontWeight: item.isAi ? 800 : undefined }}>{item.label}</span>
              
              {/* Huy hiệu AI cho Lộ trình cá nhân */}
              {item.isAi && (
                <span style={{
                  marginLeft: 'auto',
                  padding: '0.12rem 0.45rem',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? '#ffffff' : '#e0f2fe',
                  color: isActive ? '#0284c7' : '#0369a1',
                  letterSpacing: '0.04em'
                }}>
                  AI
                </span>
              )}

              {item.highlight && !isActive && (
                <span style={{
                  marginLeft: 'auto',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e'
                }} />
              )}
              {item.id === 'review' && savedLessons.length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? '#0284c7' : '#e0f2fe',
                  color: isActive ? '#ffffff' : '#0369a1'
                }}>
                  {savedLessons.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
