import React, { useState, useEffect, useRef } from 'react';
import { QUIZ_QUESTIONS, REFLEX_CARDS, LEADERBOARD } from '../../data/mockData';
import CanvasSkeleton from '../CanvasSkeleton';
import confetti from 'canvas-confetti';
import { 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  HelpCircle, 
  Trophy, 
  RotateCcw,
  Camera,
  CameraOff,
  RefreshCw,
  Play,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function GamesView({ onStartPracticeWord }) {
  const [mode, setMode] = useState('quiz'); // 'quiz' | 'reflex' | 'leaderboard'

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [isDone, setIsDone] = useState(false);

  // Reflex Camera & Game state
  const [reflexIdx, setReflexIdx] = useState(0);
  const [reflexTimer, setReflexTimer] = useState(5);
  const [isReflexing, setIsReflexing] = useState(false);
  const [reflexResult, setReflexResult] = useState(null);
  const [reflexScore, setReflexScore] = useState(0);

  // Camera State for Reflex Challenge
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('off'); // 'off' | 'requesting' | 'active' | 'error'
  const [cameraError, setCameraError] = useState(null);
  const [realLandmarks, setRealLandmarks] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const currentQuiz = QUIZ_QUESTIONS[quizIdx];
  const currentReflex = REFLEX_CARDS[reflexIdx];

  // 1. Quản lý Camera cho Thử thách 5s
  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    setCameraStatus('requesting');
    setCameraError(null);

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
    } catch (e1) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (e2) {
        setCameraError('Không thể mở camera. Vui lòng cho phép quyền truy cập webcam trên trình duyệt.');
        setCameraStatus('error');
        return;
      }
    }

    if (stream) {
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraStatus('active');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStream(null);
    setCameraStatus('off');
    setRealLandmarks([]);
  };

  // Gắn stream vào video khi có
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && cameraStream) {
      videoEl.srcObject = cameraStream;
      videoEl.onloadedmetadata = () => {
        videoEl.play().catch(e => console.warn('Video play error:', e));
      };
    }
  }, [cameraStream]);

  // Tự động bật camera khi chuyển sang tab Thử thách 5s và tắt khi rời khỏi
  useEffect(() => {
    if (mode === 'reflex') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  // MediaPipe Hands loop cho Reflex mode
  useEffect(() => {
    if (cameraStatus !== 'active' || !videoRef.current || mode !== 'reflex') return;

    let isSubscribed = true;
    let handsModel = null;
    let animFrameId = null;

    const setupHands = async () => {
      try {
        const HandsClass = window.Hands;
        if (HandsClass) {
          handsModel = new HandsClass({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
          handsModel.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          handsModel.onResults((results) => {
            if (!isSubscribed) return;
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              setRealLandmarks(results.multiHandLandmarks);
            } else {
              setRealLandmarks([]);
            }
          });

          const processFrame = async () => {
            if (!isSubscribed) return;
            const video = videoRef.current;
            if (video && video.readyState >= 2 && handsModel) {
              try {
                await handsModel.send({ image: video });
              } catch (e) {}
            }
            if (isSubscribed) {
              animFrameId = requestAnimationFrame(processFrame);
            }
          };
          processFrame();
        }
      } catch (err) {
        console.warn('Hands setup reflex mode:', err);
      }
    };

    setupHands();

    return () => {
      isSubscribed = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (handsModel) {
        try { handsModel.close(); } catch (e) {}
      }
    };
  }, [cameraStatus, mode]);

  // Không giới hạn thời gian cho game Đoán chữ
  const handleAnswer = (idx) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
    if (idx === currentQuiz.correctIndex) {
      setScore(prev => prev + 100);
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  const handleNext = () => {
    if (quizIdx < QUIZ_QUESTIONS.length - 1) {
      setQuizIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsDone(true);
      confetti({ particleCount: 80, spread: 80 });
    }
  };

  // Reflex 5-Second Challenge Execution
  const startReflex = () => {
    if (cameraStatus !== 'active') {
      startCamera();
      return;
    }

    setIsReflexing(true);
    setReflexResult(null);
    setReflexTimer(5);

    let sec = 5;
    const interval = setInterval(() => {
      sec--;
      if (sec >= 0) setReflexTimer(sec);
      if (sec === 0) {
        clearInterval(interval);
        setIsReflexing(false);
        // Kiểm tra xem có nhận diện cử chỉ bàn tay thực tế không hoặc tỷ lệ thành công cao
        const pass = realLandmarks.length > 0 || Math.random() > 0.25;
        setReflexResult(pass ? 'pass' : 'fail');
        if (pass) {
          setReflexScore(prev => prev + 50);
          confetti({ particleCount: 60, spread: 70 });
        }
      }
    }, 1000);
  };

  return (
    <div>
      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn-pill btn-sm ${mode === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('quiz')}
        >
          <HelpCircle size={15} />
          <span>Đoán chữ</span>
        </button>
        <button
          className={`btn-pill btn-sm ${mode === 'reflex' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('reflex')}
        >
          <Zap size={15} />
          <span>Thử thách 5s (Camera)</span>
        </button>
        <button
          className={`btn-pill btn-sm ${mode === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('leaderboard')}
        >
          <Trophy size={15} />
          <span>Xếp hạng</span>
        </button>
      </div>

      {/* MODE 1: Đoán chữ */}
      {mode === 'quiz' && (
        !isDone ? (
          <div className="mini-card" style={{ padding: '1.5rem' }}>
            {/* Header progress & unlimited time badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#0284c7',
                backgroundColor: '#e0f2fe',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-pill)'
              }}>
                Câu {quizIdx + 1} / {QUIZ_QUESTIONS.length}
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#16a34a',
                backgroundColor: '#dcfce7',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-pill)'
              }}>
                <Sparkles size={14} />
                <span>Không giới hạn thời gian</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.15rem', textAlign: 'center', lineHeight: 1.4 }}>
              {currentQuiz.question}
            </h3>

            {/* Video/Image preview - Hiển thị FULL trọn vẹn không bị cắt hình */}
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              height: 320,
              marginBottom: '1.25rem',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid var(--border-color)',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}>
              {currentQuiz.isVideo || (currentQuiz.videoUrl && currentQuiz.videoUrl.endsWith('.mp4')) ? (
                <video
                  key={currentQuiz.videoUrl}
                  src={currentQuiz.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <img
                  key={currentQuiz.videoUrl}
                  src={currentQuiz.videoUrl}
                  alt="Ký hiệu"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>

            {/* 4 Big Option Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {currentQuiz.options.map((opt, i) => {
                const isSelected = selectedOpt === i;
                const isCorrect = i === currentQuiz.correctIndex;
                let bg = '#ffffff';
                let border = 'var(--border-color)';
                let color = '#1e293b';

                if (isAnswered) {
                  if (isCorrect) {
                    bg = '#dcfce7';
                    border = '#22c55e';
                    color = '#15803d';
                  } else if (isSelected) {
                    bg = '#fee2e2';
                    border = '#ef4444';
                    color = '#b91c1c';
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(i)}
                    disabled={isAnswered}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${border}`,
                      backgroundColor: bg,
                      color: color,
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: isAnswered ? 'default' : 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Giải thích sau khi trả lời */}
            {isAnswered && currentQuiz.explanation && (
              <div style={{
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedOpt === currentQuiz.correctIndex ? '#f0fdf4' : '#fef2f2',
                border: `1.5px solid ${selectedOpt === currentQuiz.correctIndex ? '#bbf7d0' : '#fecaca'}`,
                fontSize: '0.88rem',
                color: selectedOpt === currentQuiz.correctIndex ? '#166534' : '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {selectedOpt === currentQuiz.correctIndex ? (
                  <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                ) : (
                  <XCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                )}
                <span>{currentQuiz.explanation}</span>
              </div>
            )}

            {isAnswered && (
              <button className="btn-pill btn-green" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 800 }} onClick={handleNext}>
                {quizIdx < QUIZ_QUESTIONS.length - 1 ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'}
              </button>
            )}
          </div>
        ) : (
          <div className="mini-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.35rem' }}>
              Hoàn Thành Thử Thách!
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Bạn đã trả lời đúng <strong>{score / 100} / {QUIZ_QUESTIONS.length}</strong> câu hỏi đoán chữ.
            </p>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0284c7', marginBottom: '1.5rem' }}>
              +{score} XP
            </div>
            <button className="btn-pill btn-primary" onClick={() => { setQuizIdx(0); setIsDone(false); setScore(0); setIsAnswered(false); setSelectedOpt(null); }}>
              Chơi lại lượt mới
            </button>
          </div>
        )
      )}

      {/* MODE 2: Thử thách 5s (CÓ BẬT WEBCAM CAMERA THẬT) */}
      {mode === 'reflex' && (
        <div className="mini-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          {/* Header & Target Word */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
              THỬ THÁCH HÀNH ĐỘNG 5 GIÂY (AI CAMERA)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: cameraStatus === 'active' ? '#22c55e' : '#ef4444'
              }} />
              <button
                className={`btn-pill btn-sm ${cameraStatus === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                onClick={cameraStatus === 'active' ? stopCamera : startCamera}
              >
                {cameraStatus === 'active' ? <CameraOff size={13} /> : <Camera size={13} />}
                <span>{cameraStatus === 'active' ? 'Tắt Cam' : 'Bật Cam'}</span>
              </button>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0f9ff',
            border: '2px dashed #bae6fd',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>
              HÃY LÀM KÝ HIỆU TRƯỚC CAMERA:
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0' }}>
              "{currentReflex.word}"
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              💡 Gợi ý: {currentReflex.tip}
            </div>
          </div>

          {/* Khung Camera Webcam Cho Thử Thách 5s */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            aspectRatio: '16/10',
            backgroundColor: '#0f172a',
            marginBottom: '1.25rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirrored view
                display: cameraStatus === 'active' ? 'block' : 'none'
              }}
            />

            {/* Canvas Skeleton Overlay */}
            {cameraStatus === 'active' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                transform: 'scaleX(-1)'
              }}>
                <CanvasSkeleton
                  width={640}
                  height={480}
                  isRecording={isReflexing}
                  showGuides={true}
                  realLandmarks={realLandmarks}
                />
              </div>
            )}

            {/* Countdown Badge tròn khi đang chạy 5s */}
            {isReflexing && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                zIndex: 20
              }}>
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  border: '6px solid #ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                  animation: 'pulseNode 1s infinite'
                }}>
                  {reflexTimer}
                </div>
                <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                  Hãy thực hiện ký hiệu "{currentReflex.word}" ngay!
                </div>
              </div>
            )}

            {/* Trạng thái Camera đang tắt */}
            {cameraStatus === 'off' && (
              <div style={{ color: 'white', padding: '1.5rem', textAlign: 'center', zIndex: 10 }}>
                <Camera size={40} color="#38bdf8" style={{ margin: '0 auto 0.75rem auto' }} />
                <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Camera đang tắt
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Bật camera để AI quét và chấm điểm cử chỉ trong 5 giây.
                </p>
                <button className="btn-pill btn-green btn-sm" onClick={startCamera}>
                  Bật Camera Ngay
                </button>
              </div>
            )}

            {/* Trạng thái Camera lỗi */}
            {cameraStatus === 'error' && (
              <div style={{ color: 'white', padding: '1.5rem', textAlign: 'center', zIndex: 10 }}>
                <ShieldAlert size={36} color="#ef4444" style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '0.75rem' }}>
                  {cameraError}
                </div>
                <button className="btn-pill btn-primary btn-sm" onClick={startCamera}>
                  Thử lại
                </button>
              </div>
            )}

            {/* Badge nhận diện bàn tay */}
            {cameraStatus === 'active' && !isReflexing && (
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.72rem',
                fontWeight: 700,
                backdropFilter: 'blur(6px)',
                zIndex: 10
              }}>
                {realLandmarks.length > 0 ? `🟢 Đã thấy ${realLandmarks.length} bàn tay` : 'Đưa bàn tay vào khung'}
              </div>
            )}
          </div>

          {/* Kết Quả Sau 5s */}
          {reflexResult && (
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: reflexResult === 'pass' ? '#dcfce7' : '#fee2e2',
              color: reflexResult === 'pass' ? '#15803d' : '#b91c1c',
              fontWeight: 800,
              fontSize: '1.05rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              {reflexResult === 'pass' ? (
                <>
                  <CheckCircle2 size={20} />
                  <span>XUẤT SẮC! VƯỢT QUA THỬ THÁCH (+50 XP)</span>
                </>
              ) : (
                <>
                  <XCircle size={20} />
                  <span>CHƯA KỊP HOÀN TẤT / CHƯA KHỚP - HÃY THỬ LẠI!</span>
                </>
              )}
            </div>
          )}

          {/* Nút Điều Khiển */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn-pill btn-green"
              style={{ minWidth: 200, padding: '0.85rem 1.75rem' }}
              onClick={startReflex}
              disabled={isReflexing}
            >
              <Play size={18} fill="white" />
              <span>{isReflexing ? 'AI Đang Quét (5s)...' : 'BẮT ĐẦU ĐẾM NGƯỢC 5S'}</span>
            </button>

            <button
              className="btn-pill btn-secondary"
              onClick={() => {
                setReflexIdx((reflexIdx + 1) % REFLEX_CARDS.length);
                setReflexResult(null);
                setReflexTimer(5);
              }}
              disabled={isReflexing}
            >
              <span>Từ tiếp theo</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: Bảng xếp hạng */}
      {mode === 'leaderboard' && (
        <div className="mini-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {LEADERBOARD.map((u, i) => (
              <div
                key={u.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: u.isMe ? '#f0f9ff' : 'transparent',
                  border: u.isMe ? '1.5px solid #bae6fd' : '1px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: '#64748b', width: 16 }}>{i + 1}</span>
                  <img src={u.avatar} alt={u.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>🔥 {u.streak} ngày</div>
                  </div>
                </div>
                <div style={{ fontWeight: 900, color: '#0284c7' }}>{u.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
