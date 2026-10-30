import React, { useState } from 'react';
import { X, Camera, Video, Gauge } from 'lucide-react';

export default function LessonModal({ lesson, topic, onClose, onStartPractice }) {
  const [speed, setSpeed] = useState(1.0);
  const [viewAngle, setViewAngle] = useState('front');

  if (!lesson) return null;

  const currentMediaUrl = viewAngle === 'front' 
    ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80'
    : 'https://images.unsplash.com/photo-1580894732454-defbe5ff2886?auto=format&fit=crop&w=900&q=80';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ padding: '1.75rem' }}>
          {/* Minimal Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>{topic?.title}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{lesson.duration}</span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>
            {lesson.title}
          </h2>

          {/* Video Player */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            aspectRatio: '16/10',
            marginBottom: '1rem'
          }}>
            <img 
              src={currentMediaUrl} 
              alt={lesson.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Quick controls toolbar */}
            <div style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.75rem',
              right: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              backdropFilter: 'blur(8px)'
            }}>
              {/* Speed Buttons */}
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button
                  className={`btn-pill btn-sm ${speed === 1.0 ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={() => setSpeed(1.0)}
                >
                  1.0x
                </button>
                <button
                  className={`btn-pill btn-sm ${speed === 0.5 ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', backgroundColor: speed === 0.5 ? '#f97316' : undefined }}
                  onClick={() => setSpeed(0.5)}
                >
                  0.5x Chậm
                </button>
              </div>

              {/* View Angles */}
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button
                  className={`btn-pill btn-sm ${viewAngle === 'front' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={() => setViewAngle('front')}
                >
                  Chính diện
                </button>
                <button
                  className={`btn-pill btn-sm ${viewAngle === 'side' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={() => setViewAngle('side')}
                >
                  Góc 45°
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tip (1 line) */}
          <div style={{
            fontSize: '0.86rem',
            color: '#475569',
            backgroundColor: '#f8fafc',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem'
          }}>
            💡 <strong>Mẹo:</strong> {lesson.description}
          </div>

          {/* Action Button */}
          <button 
            className="btn-pill btn-green"
            style={{ width: '100%', padding: '0.85rem' }}
            onClick={() => {
              onClose();
              onStartPractice(lesson.title);
            }}
          >
            <Camera size={18} />
            <span>THỰC HÀNH CÙNG AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
