import React, { useState } from 'react';
import { X, Camera, BookOpen } from 'lucide-react';

export default function WordDetailModal({ wordData, onClose, onStartPractice, onOpenLesson }) {
  const [viewAngle, setViewAngle] = useState('front');

  if (!wordData) return null;
  const currentVideo = viewAngle === 'front' ? wordData.videoFront : wordData.videoSide;
  const isVideo = currentVideo && (
    currentVideo.endsWith('.mp4') || 
    currentVideo.endsWith('.webm') || 
    currentVideo.startsWith('blob:') ||
    currentVideo.startsWith('/uploads/') ||
    currentVideo.includes('chao.mp4')
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>{wordData.topicLabel}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{wordData.dialect}</span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>
            {wordData.word}
          </h2>

          {/* Video preview */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            aspectRatio: '16/10',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isVideo ? (
              <video
                key={currentVideo}
                src={currentVideo}
                controls
                autoPlay
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img src={currentVideo} alt={wordData.word} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}

            <div style={{
              position: 'absolute',
              bottom: '0.6rem',
              right: '0.6rem',
              display: 'flex',
              gap: '0.3rem',
              backgroundColor: 'rgba(15,23,42,0.8)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-pill)'
            }}>
              <button
                className={`btn-pill btn-sm ${viewAngle === 'front' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                onClick={() => setViewAngle('front')}
              >
                Chính diện
              </button>
              <button
                className={`btn-pill btn-sm ${viewAngle === 'side' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                onClick={() => setViewAngle('side')}
              >
                Góc 45°
              </button>
            </div>
          </div>

          {/* Quick instructions (1 short line) */}
          <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1.25rem' }}>
            {wordData.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: onOpenLesson ? '1fr 1fr' : '1fr', gap: '0.65rem' }}>
            {onOpenLesson && (
              <button
                className="btn-pill btn-primary"
                style={{ padding: '0.8rem', fontWeight: 800, fontSize: '0.88rem', gap: '0.4rem' }}
                onClick={() => {
                  onClose();
                  onOpenLesson(wordData);
                }}
              >
                <BookOpen size={18} />
                <span>HỌC BƯỚC 1</span>
              </button>
            )}

            <button
              className="btn-pill btn-green"
              style={{ padding: '0.8rem', fontWeight: 800, fontSize: '0.88rem', gap: '0.4rem' }}
              onClick={() => {
                onClose();
                onStartPractice(wordData.word);
              }}
            >
              <Camera size={18} />
              <span>LUYỆN TẬP AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
