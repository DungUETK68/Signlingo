import React, { useState } from 'react';
import { useSavedLessons, useSignWords } from '../../data/wordsStore';
import { 
  BookmarkCheck, 
  Play, 
  Trash2, 
  Search, 
  BookOpen, 
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ReviewView({ onOpenLesson, onStartPracticeWord, onNavigateLearning }) {
  const { savedLessons, removeSaved } = useSavedLessons();
  const { topics } = useSignWords();
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc theo từ khóa tìm kiếm
  const filteredLessons = savedLessons.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.topicTitle && item.topicTitle.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  const handleStudyNow = (item) => {
    // Tìm chủ đề tương ứng trong topics để truyền sang trang bài học
    let matchedTopic = topics.find(t => t.id === item.topicId || t.title === item.topicTitle);
    if (!matchedTopic) {
      matchedTopic = {
        id: item.topicId || 'custom-topic',
        title: item.topicTitle || 'Chủ đề ôn tập',
        level: item.level || 'Căn bản (Level 1)',
        lessons: [item]
      };
    }
    
    // Tìm bài học chuẩn trong topic nếu có
    const fullLesson = (matchedTopic.lessons && matchedTopic.lessons.find(l => l.id === item.id || l.title === item.title)) || item;

    if (onOpenLesson) {
      onOpenLesson(fullLesson, matchedTopic);
    } else if (onStartPracticeWord) {
      onStartPracticeWord(item.title);
    }
  };

  const handleDelete = (e, itemId) => {
    e.stopPropagation();
    removeSaved(itemId);
  };

  return (
    <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      {/* 1. Header Tab Ôn Tập */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#e0f2fe',
              color: '#0284c7'
            }}>
              <BookmarkCheck size={13} />
              BÀI HỌC ĐÃ LƯU
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              • {savedLessons.length} từ vựng cần ôn luyện
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b' }}>
            Khu Vực Ôn Tập Ký Hiệu
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.2rem' }}>
            Nơi tập hợp các bài học bạn đã lưu lại để rèn luyện trí nhớ cơ bắp và củng cố độ chuẩn xác cử chỉ.
          </p>
        </div>

        {/* Thanh tìm kiếm nhanh trong danh sách đã lưu */}
        {savedLessons.length > 0 && (
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 320
          }}>
            <Search 
              size={17} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Tìm kiếm từ đã lưu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.3rem',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.88rem',
                outline: 'none',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0284c7';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.backgroundColor = '#f8fafc';
              }}
            />
          </div>
        )}
      </div>

      {/* 2. Danh sách bài học / Từ vựng đã lưu */}
      {savedLessons.length === 0 ? (
        // Empty State khi chưa có bài học nào được lưu
        <div className="mini-card" style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <BookmarkCheck size={36} strokeWidth={2} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
            Chưa có bài học nào được lưu
          </h3>
          <p style={{
            fontSize: '0.92rem',
            color: '#64748b',
            maxWidth: 420,
            margin: '0 auto 1.5rem auto',
            lineHeight: 1.5
          }}>
            Khi xem chi tiết bất kỳ bài học nào trong tab <strong>Học tập</strong>, hãy nhấn vào nút <strong>"Lưu"</strong> ở góc phải để thêm vào danh sách ôn tập tại đây!
          </p>
          <button
            className="btn-pill btn-primary"
            onClick={onNavigateLearning}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <BookOpen size={18} />
            <span>Khám phá bài học ngay</span>
          </button>
        </div>
      ) : filteredLessons.length === 0 ? (
        // Không tìm thấy kết quả tìm kiếm
        <div className="mini-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
            Không tìm thấy từ đã lưu nào khớp với từ khóa "<strong>{searchQuery}</strong>".
          </p>
        </div>
      ) : (
        // Bảng danh sách từ vựng đã lưu (Chuẩn đẹp & rộng rãi đồng bộ 900px)
        <div className="mini-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid var(--border-color)' }}>
                  <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                    Từ vựng / Bài học
                  </th>
                  <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>
                    Chủ đề
                  </th>
                  <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>
                    Thời lượng & Cấp độ
                  </th>
                  <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((item, idx) => (
                  <tr 
                    key={item.id || idx}
                    style={{
                      borderBottom: idx === filteredLessons.length - 1 ? 'none' : '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Cột 1: Tên từ vựng & mô tả */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <p style={{
                          fontSize: '0.82rem',
                          color: '#64748b',
                          margin: '0.25rem 0 0 0',
                          lineHeight: 1.4,
                          maxWidth: 340
                        }}>
                          {item.description}
                        </p>
                      )}
                    </td>

                    {/* Cột 2: Chủ đề */}
                    <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: '#f1f5f9',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#334155',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.topicTitle || 'Chào hỏi & Làm quen'}
                      </span>
                    </td>

                    {/* Cột 3: Thời lượng & Cấp độ */}
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                        <Clock size={14} color="#94a3b8" />
                        <span>{item.duration || '3 phút'}</span>
                        <span>•</span>
                        <span style={{ color: '#0284c7', fontWeight: 700 }}>{item.difficulty || item.level || 'Dễ'}</span>
                      </div>
                    </td>

                    {/* Cột 4: Thao tác (Học & Xóa) */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}>
                        {/* Nút Học */}
                        <button
                          className="btn-pill btn-primary btn-sm"
                          onClick={() => handleStudyNow(item)}
                          style={{
                            padding: '0.4rem 0.85rem',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                          }}
                          title="Học bài học này ngay"
                        >
                          <Play size={14} fill="currentColor" />
                          <span>Học</span>
                        </button>

                        {/* Nút Xóa */}
                        <button
                          onClick={(e) => handleDelete(e, item.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-pill)',
                            border: '1.5px solid #fecdd3',
                            backgroundColor: '#fff1f2',
                            color: '#e11d48',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffe4e6';
                            e.currentTarget.style.borderColor = '#fda4af';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff1f2';
                            e.currentTarget.style.borderColor = '#fecdd3';
                          }}
                          title="Xóa khỏi danh sách ôn tập"
                        >
                          <Trash2 size={14} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
