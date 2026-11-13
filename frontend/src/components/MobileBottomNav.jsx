import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Camera,
  MessageSquareQuote,
  Search
} from 'lucide-react';

const BOTTOM_NAV_ITEMS = [
  { id: 'personalized', label: 'Lộ trình', icon: Sparkles },
  { id: 'grammar', label: 'Ngữ pháp', icon: GraduationCap },
  { id: 'practice', label: 'Luyện AI', icon: Camera, highlight: true },
  { id: 'sentences', label: 'Câu VSL', icon: MessageSquareQuote },
  { id: 'dictionary', label: 'Từ điển', icon: Search },
];

export default function MobileBottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isHighlight = item.highlight;

          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-bottom-btn ${isActive ? 'active' : ''} ${isHighlight ? 'highlight' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <div className="mobile-bottom-icon-wrap">
                <Icon
                  size={isHighlight ? 22 : 20}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className="mobile-bottom-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

