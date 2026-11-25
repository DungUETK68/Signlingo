import React from 'react';

const ANGLE_OPTIONS = [
  { id: 'front', label: 'Chính diện' },
  { id: 'left', label: 'Nghiêng trái' },
  { id: 'right', label: 'Nghiêng phải' },
];

/**
 * VideoAngleSwitcher
 * Thanh chuyển đổi đủ 3 góc quay chuẩn VSL400 (Chính diện, Nghiêng trái, Nghiêng phải)
 * Hiển thị gọn gàng trên 1 hàng, tách bên ngoài video để không che nội dung trên điện thoại.
 */
export default function VideoAngleSwitcher({
  angle = 'front',
  onChange,
  compact = false,
  showLabel = true,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`video-angle-bar subtabs-scroll-row ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: compact ? 'flex-start' : 'space-between',
        gap: '0.4rem',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        ...style,
      }}
    >
      {showLabel && (
        <span
          style={{
            color: '#475569',
            fontSize: compact ? '0.74rem' : '0.78rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Góc quay:
        </span>
      )}

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'nowrap',
          flexShrink: 0,
        }}
      >
        {ANGLE_OPTIONS.map((opt) => {
          const active = angle === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`btn-pill btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onChange && onChange(opt.id)}
              style={{
                padding: compact ? '0.24rem 0.62rem' : '0.32rem 0.75rem',
                fontSize: compact ? '0.73rem' : '0.78rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
