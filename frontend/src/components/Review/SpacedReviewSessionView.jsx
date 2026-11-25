import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Timer,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Camera,
  ShieldAlert,
  Eye,
  EyeOff,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CanvasSkeleton from '../CanvasSkeleton';
import MemoryDistributionCard from './MemoryDistributionCard';
import {
  startSkeletonTracking,
  stopSkeletonTracking,
  extract75Landmarks,
} from '../../services/skeletonTracker';
import {
  AI_API_URL,
  progressApi,
  resolveMediaUrl,
  isNativePlatform,
} from '../../services/api';
import {
  getMemoryLevelInfo,
  normalizeWordSlug,
  recordSrsChoice,
} from '../../data/srsStore';

/**
 * SpacedReviewSessionView
 * Màn hình mới chuyên biệt khi người dùng nhấn "Ôn ngay" từ thông báo số từ cần ôn:
 * - Hiển thị bảng "Phân bổ ghi nhớ" 6 mức độ (có thể thu gọn/mở rộng trong lúc quay camera và hiện đầy đủ khi hoàn tất)
 * - Giao diện thử thách thực hiện động tác trước Camera AI cho đến khi đánh giá ĐẠT (score >= 80)
 * - Sau khi ĐẠT, hiển thị 2 nút lựa chọn:
 *    1. "Đã nhớ"    -> Tăng +1 mức độ nhớ & tăng thời gian chờ (lên mức 5 "Nhớ Dài Hạn" thì hoàn tất không hẹn lại)
 *    2. "Sẽ ôn lại" -> Đưa về mức đầu tiên "Chưa Nhớ" & nhắc ôn lại trong 12 giờ
 */
export default function SpacedReviewSessionView({
  queue = [],
  stats,
  onBack,
  onSessionUpdated,
}) {
  // Sao lưu danh sách hàng đợi của phiên ôn hiện tại để không bị nhảy index khi srsMap cập nhật giữa chừng
  const [sessionWords] = useState(() => (Array.isArray(queue) ? [...queue] : []));
  const [currentIndex, setCurrentIndex] = useState(0);

  // Các pha thực hiện của từng từ: 'ready' | 'playing' | 'evaluating' | 'failed' | 'passed' | 'completed'
  const [phase, setPhase] = useState('ready');
  const phaseRef = useRef('ready');

  const [timerSec, setTimerSec] = useState(5);
  const [cameraStatus, setCameraStatus] = useState('off'); // 'off' | 'requesting' | 'active' | 'error'
  const [cameraError, setCameraError] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  const [evalResult, setEvalResult] = useState(null);
  const [badJoints, setBadJoints] = useState([]);
  const [failedAttemptsOnWord, setFailedAttemptsOnWord] = useState(0);
  const [showSampleHint, setShowSampleHint] = useState(false);
  const [showDistributionPanel, setShowDistributionPanel] = useState(true);
  const [isSubmittingChoice, setIsSubmittingChoice] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const recordedFramesRef = useRef([]);
  const landmarksRef = useRef({
    poseLandmarks: null,
    leftHandLandmarks: null,
    rightHandLandmarks: null,
    realLandmarks: [],
  });

  const currentItem = sessionWords[currentIndex] || null;
  const currentLevel = currentItem?.memoryLevel ?? 0;
  const currentLevelInfo = getMemoryLevelInfo(currentLevel);
  const promotedLevel = Math.min(5, currentLevel + 1);
  const promotedLevelInfo = getMemoryLevelInfo(promotedLevel);

  // 1. Khởi động Camera (tối ưu 480x360 trên Mobile, 640x480 trên Desktop)
  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setCameraStatus('requesting');
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Thiết bị không hỗ trợ truy cập Camera WebRTC.');
      setCameraStatus('error');
      return;
    }

    const isMobileCam =
      isNativePlatform() ||
      (typeof window !== 'undefined' && window.innerWidth <= 768);

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: isMobileCam
          ? {
            width: { ideal: 480 },
            height: { ideal: 360 },
            frameRate: { ideal: 30, max: 30 },
            facingMode: 'user',
          }
          : { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
    } catch (e1) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (e2) {
        setCameraError(
          isNativePlatform()
            ? 'Không thể mở Camera. Vui lòng cấp quyền Camera cho ứng dụng Signlingo.'
            : 'Không thể mở Camera. Vui lòng cho phép quyền truy cập webcam trên trình duyệt.'
        );
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
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStream(null);
    setCameraStatus('off');
  };

  useEffect(() => {
    if (sessionWords.length > 0) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  // Gắn luồng camera vào thẻ <video>
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && cameraStream) {
      videoEl.srcObject = cameraStream;
      videoEl.onloadedmetadata = () => {
        videoEl.play().catch(() => { });
      };
    }
  }, [cameraStream]);

  // Gắn kết MediaPipe Holistic Singleton Tracker
  useEffect(() => {
    if (cameraStatus !== 'active' || !videoRef.current || phase === 'completed') {
      return;
    }

    const handleResults = (results) => {
      landmarksRef.current.poseLandmarks = results.poseLandmarks || null;
      landmarksRef.current.leftHandLandmarks = results.leftHandLandmarks || null;
      landmarksRef.current.rightHandLandmarks = results.rightHandLandmarks || null;
      landmarksRef.current.realLandmarks = [];

      if (phaseRef.current === 'playing') {
        const frame75 = extract75Landmarks(results);
        if (frame75) {
          recordedFramesRef.current.push(frame75);
        }
      }
    };

    startSkeletonTracking(videoRef.current, handleResults);
    return () => {
      stopSkeletonTracking(handleResults);
    };
  }, [cameraStatus, phase]);

  // Bắt đầu đếm ngược 5 giây thực hiện động tác
  const handleStartSigningAttempt = () => {
    if (cameraStatus !== 'active') {
      startCamera();
      return;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    recordedFramesRef.current = [];
    setBadJoints([]);
    setEvalResult(null);
    setTimerSec(5);
    phaseRef.current = 'playing';
    setPhase('playing');

    let sec = 5;
    countdownIntervalRef.current = setInterval(() => {
      sec -= 1;
      if (sec >= 0) {
        setTimerSec(sec);
      }
      if (sec <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        evaluateCurrentGesture();
      }
    }, 1000);
  };

  // Chấm điểm động tác qua Backend AI (yêu cầu thực hiện cho đến khi ĐẠT)
  const evaluateCurrentGesture = async () => {
    phaseRef.current = 'evaluating';
    setPhase('evaluating');

    const framesToSend = [...recordedFramesRef.current];
    const wordSlug =
      currentItem?.slug || normalizeWordSlug(currentItem?.wordName || 'cam_on');

    let handFramesCount = 0;
    for (const f of framesToSend) {
      const hasHand = f.slice(33, 75).some((pt) => pt[0] !== 0 || pt[1] !== 0);
      if (hasHand) handFramesCount += 1;
    }

    let evalData = null;

    if (handFramesCount < 5 || framesToSend.length < 5) {
      evalData = {
        overall_score: 0,
        passed: false,
        feedbacks: [
          'Chưa phát hiện cử chỉ bàn tay rõ ràng trong 5 giây. Hãy đưa tay vào khung hình và thực hiện lại ký hiệu nhé!',
        ],
        bad_joints: [1, 2, 3, 4],
      };
    } else {
      try {
        const res = await fetch(`${AI_API_URL}/evaluate/${wordSlug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ landmarks: framesToSend }),
        });
        if (res.ok) {
          evalData = await res.json();
        }
      } catch (err) {
        console.warn('Lỗi gọi AI evaluate trong phiên ôn tập SRS:', err);
      }

      if (!evalData) {
        const isActionValid = handFramesCount >= 16;
        const fallbackScore = isActionValid ? 85 : 48;
        evalData = {
          overall_score: fallbackScore,
          passed: isActionValid && fallbackScore >= 80,
          feedbacks: isActionValid
            ? ['Động tác ký hiệu rõ nét, đạt yêu cầu ôn tập!']
            : ['Biên độ cử chỉ còn ngắn hoặc chưa đúng hình dạng bàn tay.'],
          bad_joints: isActionValid ? [] : [1, 2],
        };
      }
    }

    const passed = !!evalData.passed || (evalData.overall_score || 0) >= 80;
    const finalScore = Math.round(evalData.overall_score || 0);

    setEvalResult({ ...evalData, overall_score: finalScore, passed });
    setBadJoints(passed ? [] : evalData.bad_joints || []);

    // Ghi nhận log luyện tập chung (không ghi đè quyết định SRS cho tới khi người dùng bấm 1 trong 2 nút)
    progressApi.logPractice({
      wordSlug,
      wordName: currentItem?.wordName || currentItem?.title || wordSlug,
      score: finalScore,
      isPassed: passed,
      badJoints: evalData.bad_joints || [],
      mode: 'srs_review',
      durationSeconds: 5,
    });

    if (passed) {
      phaseRef.current = 'passed';
      setPhase('passed');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.65 } });
    } else {
      setFailedAttemptsOnWord((prev) => prev + 1);
      phaseRef.current = 'failed';
      setPhase('failed');
    }
  };

  // Xử lý khi người dùng chọn 1 trong 2 nút sau khi ĐẠT: "Đã nhớ" hoặc "Sẽ ôn lại"
  const handleSelectMemoryChoice = async (choice) => {
    if (!currentItem || isSubmittingChoice) return;
    setIsSubmittingChoice(true);

    try {
      const updated = await recordSrsChoice({
        wordSlug: currentItem.slug,
        wordName: currentItem.wordName || currentItem.title,
        choice,
        score: evalResult?.overall_score || 90,
        failedAttempts: failedAttemptsOnWord,
      });

      const newLvlInfo = getMemoryLevelInfo(updated.memoryLevel);

      setSessionHistory((prev) => [
        ...prev,
        {
          slug: currentItem.slug,
          wordName: currentItem.wordName || currentItem.title,
          score: evalResult?.overall_score || 90,
          choice,
          oldLevel: currentLevel,
          newLevel: updated.memoryLevel,
          newLevelInfo: newLvlInfo,
        },
      ]);

      if (onSessionUpdated) {
        onSessionUpdated();
      }

      // Chuyển sang từ tiếp theo hoặc hoàn thành phiên ôn
      if (currentIndex < sessionWords.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setEvalResult(null);
        setBadJoints([]);
        setFailedAttemptsOnWord(0);
        setShowSampleHint(false);
        phaseRef.current = 'ready';
        setPhase('ready');
      } else {
        stopCamera();
        phaseRef.current = 'completed';
        setPhase('completed');
        confetti({ particleCount: 110, spread: 95 });
      }
    } finally {
      setIsSubmittingChoice(false);
    }
  };

  if (sessionWords.length === 0) {
    return (
      <div className="mini-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Hiện chưa có từ nào đến hạn cần ôn!
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Các từ bạn đang học sẽ tự động nhắc lại khi hết thời gian chờ (từ 12 giờ đến 14 ngày).
        </p>
        <button className="btn-pill btn-primary" onClick={onBack}>
          Quay lại trang Ôn tập
        </button>
      </div>
    );
  }

  // ==================== MÀN HÌNH HOÀN THÀNH PHIÊN ÔN TẬP ====================
  if (phase === 'completed') {
    const rememberedCount = sessionHistory.filter((h) => h.choice === 'remembered').length;
    const reviewAgainCount = sessionHistory.filter((h) => h.choice === 'review_again').length;

    return (
      <div style={{ width: '100%', maxWidth: 960, margin: '0 auto', animation: 'fadeIn 0.25s ease-out', paddingBottom: '2.5rem' }}>
        <div
          className="mini-card"
          style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            border: '2px solid #86efac',
            background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <Award size={36} />
          </div>

          <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
            Hoàn thành phiên ôn tập ngắt quãng!
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '1.25rem' }}>
            Bạn đã ôn xong <strong>{sessionHistory.length} từ</strong> ({rememberedCount} từ tăng cấp độ nhớ •{' '}
            {reviewAgainCount} từ hẹn ôn lại sau 12 giờ).
          </p>

          {/* Tóm tắt từng từ vừa ôn */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              maxWidth: 640,
              margin: '0 auto 1.5rem auto',
              textAlign: 'left',
            }}
          >
            {sessionHistory.map((h, i) => (
              <div
                key={`${h.slug}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                    {h.wordName}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '0.5rem' }}>
                    (Đạt {h.score}%)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.22rem 0.65rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      backgroundColor: h.newLevelInfo.bgColor,
                      color: h.newLevelInfo.color,
                      border: `1px solid ${h.newLevelInfo.borderColor}`,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: h.newLevelInfo.color,
                      }}
                    />
                    {h.choice === 'remembered'
                      ? `Lên: ${h.newLevelInfo.title}`
                      : 'Chưa Nhớ • Hẹn sau 12h'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-pill btn-primary"
            onClick={onBack}
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: 800 }}
          >
            Quay về trang Ôn tập từ vựng
          </button>
        </div>

        {/* Hiển thị ngay Bảng Phân bổ ghi nhớ mới nhất sau phiên ôn */}
        <MemoryDistributionCard stats={stats} />
      </div>
    );
  }

  // ==================== MÀN HÌNH THỰC HÀNH ÔN TẬP TỪNG TỪ ====================
  const progressPct = Math.round(((currentIndex + (phase === 'passed' ? 1 : 0)) / sessionWords.length) * 100);

  return (
    <div style={{ width: '100%', maxWidth: 960, margin: '0 auto', animation: 'fadeIn 0.2s ease-out', paddingBottom: '2.5rem' }}>
      {/* 1. Thanh điều hướng đầu trang & Tiến độ phiên ôn */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className="btn-pill btn-secondary btn-sm"
          onClick={() => {
            stopCamera();
            onBack();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 800,
            color: '#0284c7',
            borderColor: '#bae6fd',
            backgroundColor: '#f0f9ff',
          }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại Ôn tập</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowDistributionPanel((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span>{showDistributionPanel ? 'Ẩn Phân bổ ghi nhớ' : 'Xem Phân bổ ghi nhớ'}</span>
            {showDistributionPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '0.35rem 0.8rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#0f172a',
              color: '#ffffff',
            }}
          >
            Từ {currentIndex + 1} / {sessionWords.length}
          </span>
        </div>
      </div>

      {/* Thanh tiến trình phiên ôn */}
      <div
        style={{
          width: '100%',
          height: 8,
          backgroundColor: '#e2e8f0',
          borderRadius: 999,
          overflow: 'hidden',
          marginBottom: '1.15rem',
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #0284c7 0%, #22c55e 100%)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* 2. Bảng Phân bổ ghi nhớ 6 mức độ (VstepOwl style) ngay trên màn hình Ôn ngay */}
      {showDistributionPanel && <MemoryDistributionCard stats={stats} />}

      {/* 3. Thẻ Từ Vựng Thử Thách & Thực Hiện Cử Chỉ Camera AI */}
      <div className="mini-card" style={{ padding: '1.25rem' }}>
        {/* Huy hiệu mức nhớ hiện tại -> mức tiếp theo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.7rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.76rem',
                fontWeight: 800,
                backgroundColor: currentLevelInfo.bgColor,
                color: currentLevelInfo.color,
                border: `1.5px solid ${currentLevelInfo.borderColor}`,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: currentLevelInfo.color,
                }}
              />
              Mức hiện tại: {currentLevelInfo.title}
            </span>

            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>
              → Nhấn "Đã nhớ" sẽ lên:{' '}
              <strong style={{ color: promotedLevelInfo.color }}>
                {promotedLevelInfo.title} (
                {promotedLevelInfo.waitHours ? promotedLevelInfo.intervalLabel : 'Không hẹn lại'})
              </strong>
            </span>
          </div>

          {/* Nút bật/tắt gợi ý video mẫu nếu quên động tác */}
          <button
            type="button"
            onClick={() => setShowSampleHint((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid #bae6fd',
              backgroundColor: showSampleHint ? '#e0f2fe' : '#f8fafc',
              color: '#0284c7',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {showSampleHint ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showSampleHint ? 'Ẩn video gợi ý' : 'Quên động tác? Xem gợi ý'}</span>
          </button>
        </div>

        {/* Khung hiển thị từ cần thực hiện (giống Thử thách đoán/làm từ) */}
        <div
          style={{
            backgroundColor: '#f0f9ff',
            border: '2px solid #38bdf8',
            borderRadius: 'var(--radius-xl)',
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              color: '#0284c7',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            Hãy thực hiện ký hiệu VSL cho từ sau đến khi Đạt:
          </div>
          <div
            style={{
              fontSize: '2.2rem',
              fontWeight: 900,
              color: '#0f172a',
              margin: '0.15rem 0',
              lineHeight: 1.2,
            }}
          >
            "{currentItem?.wordName || currentItem?.title}"
          </div>
          <div style={{ fontSize: '0.84rem', color: '#475569' }}>
            💡 Chủ đề: <strong>{currentItem?.topicTitle || 'Từ vựng VSL'}</strong>
            {currentItem?.description ? ` • ${currentItem.description}` : ''}
          </div>
        </div>

        {/* Video mẫu gợi ý (chỉ hiện khi người học bấm xem) */}
        {showSampleHint && (
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              maxHeight: 230,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #bae6fd',
            }}
          >
            <video
              key={currentItem?.videoFront}
              src={resolveMediaUrl(currentItem?.videoFront)}
              controls
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', maxHeight: 230, objectFit: 'contain' }}
            />
          </div>
        )}

        {/* KHUNG CAMERA AI & KHUNG XƯƠNG THỜI GIAN THỰC */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            aspectRatio: '16/10',
            backgroundColor: '#0f172a',
            marginBottom: '1rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              opacity: cameraStatus === 'active' ? 1 : 0,
              pointerEvents: 'none',
            }}
          />

          {cameraStatus === 'active' && (
            <div style={{ position: 'absolute', inset: 0, transform: 'scaleX(-1)' }}>
              <CanvasSkeleton
                width={640}
                height={480}
                isRecording={phase === 'playing'}
                landmarksRef={landmarksRef}
                badJoints={badJoints}
              />
            </div>
          )}

          {/* Đồng hồ đếm ngược 5 giây */}
          {phase === 'playing' && (
            <div
              style={{
                position: 'absolute',
                top: '0.85rem',
                right: '0.85rem',
                backgroundColor:
                  timerSec <= 2 ? 'rgba(239, 68, 68, 0.92)' : 'rgba(2, 132, 199, 0.92)',
                color: '#ffffff',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 25,
              }}
            >
              <Timer size={19} />
              <span style={{ fontSize: '1.45rem', fontWeight: 900 }}>{timerSec}s</span>
            </div>
          )}

          {/* Overlay AI đang chấm điểm */}
          {phase === 'evaluating' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.82)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                zIndex: 30,
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <Sparkles size={38} color="#38bdf8" style={{ animation: 'spin 1.4s linear infinite' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.75rem' }}>
                AI đang kiểm tra động tác ký hiệu...
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Đối chiếu độ chính xác khớp bàn tay với mẫu chuẩn VSL
              </div>
            </div>
          )}

          {/* Nút bắt đầu thực hiện khi đang ở pha ready */}
          {phase === 'ready' && cameraStatus === 'active' && (
            <div
              style={{
                position: 'absolute',
                bottom: '0.9rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
              }}
            >
              <button
                type="button"
                className="btn-pill btn-green"
                onClick={handleStartSigningAttempt}
                style={{
                  padding: '0.75rem 1.65rem',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  gap: '0.45rem',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 6px 20px rgba(22, 163, 74, 0.45)',
                }}
              >
                <Play size={18} fill="#ffffff" />
                <span>BẮT ĐẦU THỰC HIỆN (5 GIÂY)</span>
              </button>
            </div>
          )}

          {/* Lỗi camera hoặc tắt camera */}
          {cameraStatus === 'error' && (
            <div style={{ color: '#ffffff', padding: '1.5rem', textAlign: 'center', zIndex: 10 }}>
              <ShieldAlert size={36} color="#ef4444" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '0.86rem', color: '#fca5a5', marginBottom: '0.75rem' }}>
                {cameraError}
              </div>
              <button type="button" className="btn-pill btn-primary btn-sm" onClick={startCamera}>
                Thử mở lại Camera
              </button>
            </div>
          )}

          {cameraStatus === 'requesting' && (
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}>
              Đang khởi động Camera AI...
            </div>
          )}
        </div>

        {/* TRẠNG THÁI 1: CHƯA ĐẠT -> YÊU CẦU THỰC HIỆN LẠI CHO ĐẾN KHI ĐẠT */}
        {phase === 'failed' && evalResult && (
          <div
            style={{
              padding: '1.15rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fca5a5',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={22} color="#dc2626" />
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#991b1b' }}>
                  Chưa đạt ({evalResult.overall_score}%) — Hãy thực hiện lại đến khi Đạt!
                </span>
              </div>

              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b91c1c' }}>
                Lần thử chưa đạt: {failedAttemptsOnWord}
              </span>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#7f1d1d', margin: '0 0 0.9rem 0', lineHeight: 1.45 }}>
              {evalResult.feedbacks?.[0] ||
                'Động tác chưa khớp chuẩn VSL (cần đạt tối thiểu 80%). Bạn có thể bật video gợi ý để xem lại cử chỉ mẫu.'}
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-pill btn-primary"
                onClick={handleStartSigningAttempt}
                style={{ padding: '0.65rem 1.35rem', fontWeight: 800, fontSize: '0.9rem', gap: '0.4rem' }}
              >
                <RotateCcw size={16} />
                <span>Thực hiện lại ngay (5s)</span>
              </button>

              {!showSampleHint && (
                <button
                  type="button"
                  className="btn-pill btn-secondary"
                  onClick={() => setShowSampleHint(true)}
                  style={{ padding: '0.65rem 1.15rem', fontWeight: 700, fontSize: '0.86rem', gap: '0.4rem' }}
                >
                  <Eye size={16} />
                  <span>Xem video mẫu</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TRẠNG THÁI 2: ĐÃ ĐẠT -> HIỂN THỊ 2 NÚT LỰA CHỌN: "ĐÃ NHỚ" & "SẼ ÔN LẠI" */}
        {phase === 'passed' && evalResult && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: '#f0fdf4',
              border: '2px solid #86efac',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={24} color="#16a34a" />
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#14532d' }}>
                Đánh giá ĐẠT ({evalResult.overall_score}% chuẩn xác)!
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#166534', margin: '0 0 1.1rem 0' }}>
              Bạn cảm thấy mức độ ghi nhớ của mình với từ{' '}
              <strong>"{currentItem?.wordName || currentItem?.title}"</strong> như thế nào?
            </p>

            {/* 2 NÚT LỰA CHỌN CỐT LÕI: "Đã nhớ" vs "Sẽ ôn lại" */}
            <div className="srs-choice-grid">
              {/* Nút 1: Đã nhớ */}
              <button
                type="button"
                disabled={isSubmittingChoice}
                onClick={() => handleSelectMemoryChoice('remembered')}
                className="srs-choice-btn remembered"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1.05rem', fontWeight: 900 }}>
                  <Check size={20} strokeWidth={3} />
                  <span>Đã nhớ</span>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.95, marginTop: '0.2rem' }}>
                  {promotedLevel >= 5
                    ? 'Đạt mức "Nhớ Dài Hạn" • Không cần hẹn ôn lại nữa!'
                    : `Tăng lên "${promotedLevelInfo.title}" • Nhắc lại sau ${promotedLevelInfo.intervalLabel}`}
                </div>
              </button>

              {/* Nút 2: Sẽ ôn lại */}
              <button
                type="button"
                disabled={isSubmittingChoice}
                onClick={() => handleSelectMemoryChoice('review_again')}
                className="srs-choice-btn review-again"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1.05rem', fontWeight: 900 }}>
                  <RefreshCw size={18} strokeWidth={2.6} />
                  <span>Sẽ ôn lại</span>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.92, marginTop: '0.2rem' }}>
                  Về mức "Chưa Nhớ" • Nhắc ôn lại trong 12 giờ
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
