import React from 'react';
import { 
  BookOpen, 
  Search, 
  Camera, 
  Gamepad2, 
  BarChart3, 
  Settings, 
  Flame, 
  Sparkles, 
  User, 
  Hand,
  CheckCircle2
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'learning', label: 'Lộ trình học', icon: BookOpen },
  { id: 'dictionary', label: 'Từ điển VSL', icon: Search },
  { id: 'practice', label: 'AI Luyện tập', icon: Camera, highlight: true },
  { id: 'games', label: 'Trò chơi & Phản xạ', icon: Gamepad2 },
  { id: 'dashboard', label: 'Tiến độ', icon: BarChart3 },
  { id: 'admin', label: 'Quản trị', icon: Settings },
];

export default function Navbar({ activeTab, onSelectTab, onOpenAuth, userProfile }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Logo Brand */}
        <div className="logo-brand" onClick={() => onSelectTab('learning')}>
          <div className="logo-icon-wrap">
            <Hand size={24} strokeWidth={2.4} />
          </div>
          <div>
            <div className="logo-title">
              Signlingo
              <span className="logo-badge">AI VSL</span>
            </div>
            <span className="logo-sub">Ngôn Ngữ Ký Hiệu Việt Nam</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-menu">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(item.id)}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'inline-block'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Streak pill */}
          <div 
            className="streak-pill" 
            title="Chuỗi ngày học liên tục: 7 ngày"
            onClick={() => onSelectTab('dashboard')}
          >
            <Flame size={17} fill="#f59e0b" color="#f59e0b" />
            <span>{userProfile?.streakDays || 7} ngày</span>
          </div>

          {/* XP pill */}
          <div className="xp-pill" title="Điểm kinh nghiệm tích lũy">
            <Sparkles size={16} color="#0284c7" />
            <span>{userProfile?.totalXp || 1240} XP</span>
          </div>

          {/* User profile / login button */}
          <button className="user-btn" onClick={onOpenAuth}>
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" 
              alt="Avatar" 
              className="user-avatar"
            />
            <span className="user-name-abbr">{userProfile?.name?.split(' ').slice(-1)[0] || 'Minh Anh'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
