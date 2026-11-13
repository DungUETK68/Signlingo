import React, { useEffect } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  MessageSquareQuote,
  Search,
  Camera,
  Zap,
  BookmarkCheck,
  User,
  Settings,
  LogOut,
  Hand
} from 'lucide-react';

const DRAWER_NAV_ITEMS = [
  { id: 'personalized', label: 'Lộ trình cá nhân', icon: Sparkles },
  { id: 'learning', label: 'Lộ trình chuẩn (12 CĐ)', icon: BookOpen },
  { id: 'grammar', label: 'Ngữ pháp VSL', icon: GraduationCap },
  { id: 'sentences', label: 'Câu thường gặp', icon: MessageSquareQuote },
  { id: 'dictionary', label: 'Từ điển 400 từ', icon: Search },
  { id: 'practice', label: 'Luyện tập Camera AI', icon: Camera },
  { id: 'games', label: 'Thử thách phản xạ 5s', icon: Zap },
  { id: 'review', label: 'Ôn tập ngắt quãng', icon: BookmarkCheck },
  { id: 'dashboard', label: 'Hồ sơ & Thành tích', icon: User },
  { id: 'admin', label: 'Quản trị hệ thống', icon: Settings },
];

export default function MobileDrawer({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  userProfile,
  isAdmin = false,
  onLogout
}) {
  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const visibleItems = DRAWER_NAV_ITEMS.filter((item) => {
    if (item.id === 'admin') return !!isAdmin;
    return true;
  });

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Hand size={20} strokeWidth={2.4} />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>
                Signlingo
              </span>
              <span style={{
                marginLeft: '0.4rem',
                fontSize: '0.62rem',
                fontWeight: 800,
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px'
              }}>
                AI + VSL
              </span>
            </div>
          </div>

          <button
            type="button"
            className="mobile-drawer-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Nav Items List */}
        <nav className="mobile-drawer-nav">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-drawer-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer: User Profile & Logout */}
        <div className="mobile-drawer-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <img
              src={userProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
              alt="Avatar"
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }}
            />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userProfile?.name || 'Học viên'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userProfile?.email || 'Học viên Signlingo'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: '10px',
              border: '1.5px solid #fecaca',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} color="#dc2626" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
