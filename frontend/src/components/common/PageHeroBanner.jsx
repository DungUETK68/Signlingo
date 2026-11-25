import React from 'react';

/**
 * Banner tiêu chuẩn đồng bộ giao diện xanh dương gradient cho các trang chính.
 */
export default function PageHeroBanner({
  badgeIcon,
  badgeText,
  badgeExtra,
  leftSlot,
  title,
  subtitle,
  rightSlot,
  bottomSlot,
  style,
}) {
  return (
    <div className="page-hero-banner" style={style}>
      <div className="page-hero-row">
        <div
          className="page-hero-main"
          style={leftSlot ? { display: 'flex', alignItems: 'center', gap: '1rem' } : undefined}
        >
          {leftSlot}
          <div style={{ flex: 1, minWidth: 0 }}>
            {(badgeText || badgeIcon || badgeExtra) && (
              <div className="page-hero-badge">
                {badgeIcon}
                {badgeText && <span>{badgeText}</span>}
                {badgeExtra}
              </div>
            )}
            {title && <h1 className="page-hero-title">{title}</h1>}
            {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
          </div>
        </div>

        {rightSlot && <div className="page-hero-right">{rightSlot}</div>}
      </div>

      {bottomSlot && (
        <div style={{ position: 'relative', zIndex: 1, marginTop: '1rem' }}>
          {bottomSlot}
        </div>
      )}
    </div>
  );
}
