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
  Sparkles,
  MessageSquareQuote,
  GraduationCap
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'personalized', label: 'Lộ trình cá nhân', icon: Sparkles },
  { id: 'learning', label: 'Lộ trình chuẩn', icon: BookOpen },
  { id: 'grammar', label: 'Ngữ pháp', icon: GraduationCap },
  { id: 'sentences', label: 'Câu thường gặp', icon: MessageSquareQuote },
  { id: 'dictionary', label: 'Từ điển', icon: Search },
  { id: 'practice', label: 'Luyện tập AI', icon: Camera },
  { id: 'games', label: 'Thử thách', icon: Zap },
  { id: 'review', label: 'Ôn tập', icon: BookmarkCheck },
  { id: 'dashboard', label: 'Hồ sơ', icon: User },
  { id: 'admin', label: 'Quản trị', icon: Settings },
];

export default function Sidebar({ activeTab, onSelectTab }) {
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
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
