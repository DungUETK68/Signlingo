import React from 'react';
import {
  Library,
  GraduationCap,
  ShieldCheck,
  Flame,
  ChevronRight,
} from 'lucide-react';

/**
 * MemoryDistributionCard
 * Bảng thống kê "Phân bổ ghi nhớ" 6 cấp độ (tham chiếu giao diện VstepOwl):
 *  - Hàng 1: 4 chỉ số tổng quan (Tổng từ đã lưu, Đã bắt đầu học, Nhớ vững, Khó nhớ)
 *  - Hàng 2: Thanh tiến trình phân đoạn 6 màu theo tỷ lệ thực tế
 *  - Hàng 3: 6 ô mức độ tương tác (Chưa Nhớ -> Nhớ Mong Manh -> Nhớ Chủ Động -> Nhớ Tự Tin -> Nhớ Mạnh -> Nhớ Dài Hạn)
 */
export default function MemoryDistributionCard({
  stats,
  selectedLevel = null, // null | 0..5 | 'hard'
  onSelectLevel,
  onOpenAllByLevel,
}) {
  if (!stats) return null;

  const {
    totalWords = 0,
    startedCount = 0,
    startedPercent = 0,
    strongCount = 0,
    strongPercent = 0,
    hardCount = 0,
    levelsBreakdown = [],
  } = stats;

  const handleToggleLevel = (lvl) => {
    if (!onSelectLevel) return;
    onSelectLevel(selectedLevel === lvl ? null : lvl);
  };

  return (
    <div style={{ marginBottom: '1.35rem' }}>
      {/* Tiêu đề & Liên kết Xem tất cả từ theo mức */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <h3
          style={{
            fontSize: '1.18rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
          }}
        >
          Phân bổ ghi nhớ
        </h3>

        {onOpenAllByLevel && (
          <button
            type="button"
            onClick={onOpenAllByLevel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span>Xem tất cả từ theo mức</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Khung thẻ chính chuẩn VstepOwl */}
      <div className="srs-distribution-card">
        {/* HÀNG 1: 4 Ô KPI Tổng Quan */}
        <div className="srs-kpi-grid">
          {/* KPI 1: Tổng từ đã lưu */}
          <div
            className="srs-kpi-cell"
            onClick={() => onSelectLevel && onSelectLevel(null)}
            style={{ cursor: onSelectLevel ? 'pointer' : 'default' }}
          >
            <div className="srs-kpi-label">
              <Library size={15} color="#64748b" />
              <span>Tổng từ đã lưu</span>
            </div>
            <div className="srs-kpi-value">{totalWords}</div>
            <div className="srs-kpi-sub">Trong bộ ôn tập</div>
          </div>

          {/* KPI 2: Đã bắt đầu học */}
          <div className="srs-kpi-cell">
            <div className="srs-kpi-label">
              <GraduationCap size={16} color="#64748b" />
              <span>Đã bắt đầu học</span>
            </div>
            <div className="srs-kpi-value">
              {startedCount}/{totalWords}
            </div>
            <div className="srs-kpi-sub">{startedPercent}% số từ đã lưu</div>
          </div>

          {/* KPI 3: Nhớ vững */}
          <div className="srs-kpi-cell">
            <div className="srs-kpi-label">
              <ShieldCheck size={15} color="#64748b" />
              <span>Nhớ vững</span>
            </div>
            <div className="srs-kpi-value">{strongCount}</div>
            <div className="srs-kpi-sub">
              {strongPercent}% • từ mức Nhớ Tự Tin trở lên
            </div>
          </div>

          {/* KPI 4: Khó nhớ */}
          <div
            className={`srs-kpi-cell ${selectedLevel === 'hard' ? 'active-hard' : ''}`}
            onClick={() => handleToggleLevel('hard')}
            style={{ cursor: onSelectLevel ? 'pointer' : 'default' }}
            title="Bấm để lọc riêng các từ khó nhớ"
          >
            <div className="srs-kpi-label">
              <Flame size={15} color="#f97316" />
              <span>Khó nhớ</span>
            </div>
            <div className="srs-kpi-value">{hardCount}</div>
            <div className="srs-kpi-sub">Hay chọn ôn lại, nên ôn kỹ hơn</div>
          </div>
        </div>

        {/* HÀNG 2: Thanh Tiến Trình Đa Sắc 6 Mức Độ */}
        <div className="srs-bar-section">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#64748b',
              marginBottom: '0.55rem',
              gap: '0.5rem',
            }}
          >
            <span>
              {selectedLevel !== null
                ? 'Đang lọc danh sách theo mức đã chọn (bấm lại để xem tất cả)'
                : 'Chọn một mức để xem các từ ở mức đó'}
            </span>
            <span style={{ fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
              {totalWords} từ
            </span>
          </div>

          <div className="srs-segmented-bar">
            {totalWords === 0 ? (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0' }} />
            ) : (
              levelsBreakdown.map((item) => {
                if (item.count <= 0) return null;
                const widthPct = (item.count / totalWords) * 100;
                return (
                  <div
                    key={item.level}
                    title={`${item.title}: ${item.count} từ (${item.percent}%)`}
                    onClick={() => handleToggleLevel(item.level)}
                    style={{
                      width: `${widthPct}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      cursor: onSelectLevel ? 'pointer' : 'default',
                      transition: 'width 0.35s ease, opacity 0.2s ease',
                      opacity:
                        selectedLevel === null || selectedLevel === item.level ? 1 : 0.35,
                    }}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* HÀNG 3: 6 Ô Mức Độ Ghi Nhớ Tương Tác */}
        <div className="srs-levels-grid">
          {levelsBreakdown.map((lvl) => {
            const isSelected = selectedLevel === lvl.level;
            return (
              <button
                key={lvl.level}
                type="button"
                className={`srs-level-cell ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleLevel(lvl.level)}
                style={{
                  backgroundColor: isSelected ? lvl.bgColor : '#ffffff',
                  boxShadow: isSelected ? `inset 0 0 0 2px ${lvl.color}` : 'none',
                }}
              >
                <div className="srs-level-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        minWidth: 9,
                        borderRadius: '50%',
                        backgroundColor: lvl.color,
                        display: 'inline-block',
                      }}
                    />
                    <span className="srs-level-title">{lvl.title}</span>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                </div>

                <div className="srs-level-count-row">
                  <span
                    className="srs-level-count"
                    style={{ color: lvl.count > 0 ? '#0f172a' : '#94a3b8' }}
                  >
                    {lvl.count}
                  </span>
                  <span className="srs-level-pct">({lvl.percent}%)</span>
                </div>

                <div className="srs-level-sub">{lvl.subtitle}</div>
                <div className="srs-level-interval">
                  {lvl.waitHours ? `Chu kỳ: ${lvl.intervalLabel}` : 'Hoàn tất • Vĩnh viễn'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
