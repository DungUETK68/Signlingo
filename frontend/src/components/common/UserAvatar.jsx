import React from 'react';

/**
 * Hiển thị Avatar mặc định bằng chữ cái đầu tiên của tên người dùng,
 * đồng bộ tông màu xanh dương của hệ thống Signlingo.
 */
export default function UserAvatar({
  name = '',
  size = 36,
  fontSize,
  border = '2px solid #bae6fd',
  boxShadow = 'none',
  style = {},
}) {
  const cleanName = String(name || '').trim();
  const initial = cleanName ? cleanName.charAt(0).toUpperCase() : 'H';
  const computedFontSize = fontSize || `${Math.max(12, Math.round(size * 0.44))}px`;

  return (
    <div
      aria-label={cleanName || 'Avatar người dùng'}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: computedFontSize,
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0,
        border,
        boxShadow,
        transition: 'all 0.15s ease',
        ...style,
      }}
    >
      {initial}
    </div>
  );
}
