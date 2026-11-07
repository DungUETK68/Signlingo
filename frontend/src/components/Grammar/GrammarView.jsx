import React, { useState } from 'react';
import {
  GraduationCap,
  Layers,
  Hash,
  Boxes,
  HelpCircle,
  XCircle,
  Smile,
  Navigation,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  ChevronRight,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VSL_GRAMMAR_RULES, VSL_GRAMMAR_QUIZ } from '../../data/grammarData';
import { getSentenceById } from '../../data/sentencesData';

const RULE_ICONS = {
  Layers: Layers,
  Hash: Hash,
  Boxes: Boxes,
  HelpCircle: HelpCircle,
  XCircle: XCircle,
  Smile: Smile,
  Navigation: Navigation,
  Zap: Zap,
};

export default function GrammarView({ onSelectTab, onOpenSentenceDetail }) {
  const [activeRuleId, setActiveRuleId] = useState(VSL_GRAMMAR_RULES[0].id);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const activeRule = VSL_GRAMMAR_RULES.find((r) => r.id === activeRuleId) || VSL_GRAMMAR_RULES[0];
  const IconComponent = RULE_ICONS[activeRule.iconName] || Layers;

  // Lấy các câu mẫu liên quan trong bộ 36 câu
  const sampleSentences = (activeRule.sampleSentenceSlugs || [])
    .map((slug) => getSentenceById(slug))
    .filter(Boolean);

  // Xử lý chọn đáp án trắc nghiệm
  const handleSelectOption = (questionId, optionId) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Nộp bài trắc nghiệm
  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    VSL_GRAMMAR_QUIZ.forEach((q) => {
      const selected = quizAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected === correctOpt?.id) correctCount++;
    });

    if (correctCount >= 3) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    }
  };

  // Làm lại trắc nghiệm
  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const calculateScore = () => {
    let score = 0;
    VSL_GRAMMAR_QUIZ.forEach((q) => {
      const selected = quizAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected === correctOpt?.id) score++;
    });
    return score;
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: '4rem' }}>
      {/* 1. Header Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 680 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 800,
                marginBottom: '0.75rem',
              }}
            >
              <GraduationCap size={16} />
              <span>Cẩm nang Ngữ pháp Ngôn ngữ Ký hiệu Việt Nam (VSL)</span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, margin: '0 0 0.65rem 0', lineHeight: 1.25 }}>
              Lý thuyết & Quy tắc Ngữ pháp VSL
            </h1>
            <p style={{ fontSize: '0.96rem', margin: 0, opacity: 0.92, lineHeight: 1.55 }}>
              Khám phá bản chất tư duy thị giác, nguyên lý "Chủ đề – Lời dẫn", trật tự SOV và các đặc thù ngôn ngữ học của người khiếm thính Việt Nam.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              minWidth: 160,
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#fde047" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>8 Quy tắc vàng</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="#93c5fd" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>36 Câu mẫu VSL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="#86efac" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Trắc nghiệm ôn tập</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thanh Menu chọn Quy tắc (8 Rules Horizontal Bar) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.75rem' }}>
          Chọn chủ đề ngữ pháp để khám phá:
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {VSL_GRAMMAR_RULES.map((rule) => {
            const isSelected = rule.id === activeRuleId;
            const Icon = RULE_ICONS[rule.iconName] || Layers;
            return (
              <button
                key={rule.id}
                onClick={() => setActiveRuleId(rule.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                  backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                  boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.12)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 900,
                    fontSize: '0.85rem',
                  }}
                >
                  {rule.order}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isSelected ? '#0284c7' : '#94a3b8', textTransform: 'uppercase' }}>
                    {rule.tag}
                  </div>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: isSelected ? '#0369a1' : '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {rule.title.split(':')[1]?.trim() || rule.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Chi tiết Bài học Ngữ pháp đang chọn (Rule Detail Box) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid #e2e8f0',
          padding: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          marginBottom: '2.5rem',
        }}
      >
        {/* Tiêu đề & Tag bài học */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: 800,
            }}
          >
            Quy tắc 0{activeRule.order} / 08 • {activeRule.tag}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>•</span>
          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{activeRule.shortDesc}</span>
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>
          {activeRule.title}
        </h2>

        {/* Tóm tắt cốt lõi */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderLeft: `4px solid ${activeRule.badgeColor || '#0284c7'}`,
            padding: '1rem 1.25rem',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            fontSize: '0.95rem',
            color: '#334155',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
            fontWeight: 500,
          }}
        >
          <strong>💡 Nguyên lý cốt lõi: </strong> {activeRule.summary}
        </div>

        {/* BẢNG SO SÁNH TRỰC QUAN: Tiếng Việt nói vs VSL Ký hiệu */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.75rem' }}>
            Đối chiếu Ngôn ngữ nói & Ngôn ngữ ký hiệu VSL:
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              alignItems: 'stretch',
            }}
          >
            {/* Box 1: Tiếng Việt nói */}
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#991b1b', textTransform: 'uppercase' }}>
                  🗣️ Tiếng Việt Nói (SVO)
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c' }}>
                  {activeRule.spokenExample.type}
                </span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#7f1d1d', marginBottom: '0.75rem' }}>
                "{activeRule.spokenExample.text}"
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {activeRule.spokenExample.breakdown.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#dc2626' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 2: Ngôn ngữ ký hiệu VSL */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#166534', textTransform: 'uppercase' }}>
                  🤟 VSL Ký Hiệu (Chủ đề - Lời dẫn)
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d' }}>
                  {activeRule.signExample.type}
                </span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#14532d', marginBottom: '0.75rem' }}>
                "{activeRule.signExample.text}"
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {activeRule.signExample.breakdown.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Phân tích ngôn ngữ học chuyên sâu */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.75rem' }}>
            Phân tích bản chất ngôn ngữ học & tư duy thị giác:
          </h3>
          <div
            style={{
              fontSize: '0.92rem',
              color: '#475569',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              backgroundColor: '#f8fafc',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #e2e8f0',
            }}
          >
            {activeRule.deepDive}
          </div>
        </div>

        {/* Các câu mẫu thực tế trong bộ từ điển VSL400 */}
        {sampleSentences.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                Các câu mẫu minh họa chuẩn trong Signlingo:
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {sampleSentences.length} câu liên quan
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {sampleSentences.map((sent) => (
                <div
                  key={sent.id || sent.slug}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>
                        {sent.category || sent.topic}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{sent.difficulty}</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.35rem' }}>
                      "{sent.title}"
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.65rem' }}>
                      <strong>Trật tự ký hiệu: </strong> {sent.structure || sent.signOrderText}
                    </div>
                  </div>

                  <button
                    className="btn-pill btn-primary btn-sm"
                    style={{
                      width: '100%',
                      padding: '0.45rem',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#0284c7',
                    }}
                    onClick={() => {
                      if (onOpenSentenceDetail) {
                        onOpenSentenceDetail(sent.id || sent.slug);
                      } else if (onSelectTab) {
                        onSelectTab('sentences');
                      }
                    }}
                  >
                    <Play size={13} fill="#ffffff" />
                    <span>Luyện câu này</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mẹo ghi nhớ cho học viên */}
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fef3c7',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={18} color="#d97706" />
            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#92400e' }}>
              Mẹo ghi nhớ thực chiến cho học viên:
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#78350f', lineHeight: 1.6 }}>
            {activeRule.tips.map((tip, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. PHẦN TRẮC NGHIỆM ÔN TẬP NGỮ PHÁP (Grammar Mini-Quiz) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid #e2e8f0',
          padding: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                }}
              >
                <Award size={18} />
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Trắc Nghiệm Ghi Nhớ Ngữ Pháp VSL
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              Kiểm tra khả năng phản xạ và độ hiểu biết của bạn về 8 quy tắc vừa học.
            </p>
          </div>

          {quizSubmitted && (
            <div
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: calculateScore() >= 3 ? '#ecfdf5' : '#fff1f2',
                borderRadius: 'var(--radius-pill)',
                border: `1.5px solid ${calculateScore() >= 3 ? '#a7f3d0' : '#fecdd3'}`,
                color: calculateScore() >= 3 ? '#065f46' : '#9f1239',
                fontWeight: 900,
                fontSize: '0.95rem',
              }}
            >
              Kết quả: {calculateScore()} / {VSL_GRAMMAR_QUIZ.length} Điểm
            </div>
          )}
        </div>

        {/* Danh sách câu hỏi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.75rem' }}>
          {VSL_GRAMMAR_QUIZ.map((q, idx) => {
            const selectedOpt = quizAnswers[q.id];
            return (
              <div
                key={q.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem' }}>
                  Câu {idx + 1}: {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt) => {
                    const isPicked = selectedOpt === opt.id;
                    let bg = '#ffffff';
                    let borderColor = '#cbd5e1';
                    let textColor = '#334155';

                    if (quizSubmitted) {
                      if (opt.isCorrect) {
                        bg = '#ecfdf5';
                        borderColor = '#10b981';
                        textColor = '#065f46';
                      } else if (isPicked && !opt.isCorrect) {
                        bg = '#fff1f2';
                        borderColor = '#ef4444';
                        textColor = '#991b1b';
                      }
                    } else if (isPicked) {
                      bg = '#e0f2fe';
                      borderColor = '#0284c7';
                      textColor = '#0369a1';
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.65rem 0.95rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${borderColor}`,
                          backgroundColor: bg,
                          color: textColor,
                          textAlign: 'left',
                          fontSize: '0.88rem',
                          fontWeight: isPicked ? 700 : 500,
                          cursor: quizSubmitted ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: isPicked ? '#0284c7' : '#f1f5f9',
                            color: isPicked ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Lời giải thích khi đã nộp bài */}
                {quizSubmitted && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      color: '#1e40af',
                      borderLeft: '3px solid #3b82f6',
                    }}
                  >
                    <strong>💡 Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nút nộp bài / Làm lại */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!quizSubmitted ? (
            <button
              className="btn-pill btn-primary"
              style={{
                padding: '0.7rem 1.8rem',
                fontSize: '0.92rem',
                fontWeight: 900,
                backgroundColor: '#0284c7',
              }}
              onClick={handleSubmitQuiz}
              disabled={Object.keys(quizAnswers).length === 0}
            >
              Chấm điểm bài làm
            </button>
          ) : (
            <button
              className="btn-pill btn-secondary"
              style={{
                padding: '0.7rem 1.5rem',
                fontSize: '0.92rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              onClick={handleResetQuiz}
            >
              <RotateCcw size={16} />
              <span>Làm lại trắc nghiệm</span>
            </button>
          )}

          <button
            className="btn-pill btn-primary"
            style={{
              padding: '0.7rem 1.5rem',
              fontSize: '0.92rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#10b981',
              marginLeft: 'auto',
            }}
            onClick={() => onSelectTab && onSelectTab('sentences')}
          >
            <span>Thực hành trong Câu thường gặp</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
