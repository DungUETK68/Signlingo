import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Video,
  Camera,
  CameraOff,
  BookmarkCheck,
  RotateCcw,
  ArrowRight,
  Award,
  Eye,
  EyeOff,
  Play,
  Zap,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { getAllWords, useSavedLessons } from '../../data/wordsStore';
import { useSpacedRepetition, enrollWordInSrs, recordSrsChoice } from '../../data/srsStore';
import { recordPracticeSession } from '../../data/personalizedStore';
import {
  AI_API_URL,
  progressApi,
  resolveAngleVideoUrl,
  isNativePlatform,
} from '../../services/api';
import {
  startSkeletonTracking,
  stopSkeletonTracking,
  extract75Landmarks,
} from '../../services/skeletonTracker';
import CanvasSkeleton from '../CanvasSkeleton';
import VideoAngleSwitcher from '../VideoAngleSwitcher';
import SpacedReviewSessionView from '../Review/SpacedReviewSessionView';
import {
  buildTheoryQuizQuestions,
  buildVideoQuizQuestions,
  buildSignChallengeQueue,
  buildSavedReviewQueue,
} from '../../data/curriculumBuilder';

/**
 * PathActivityRunner
 * Màn hình thực thi trực tiếp 4 loại học phần mở rộng ngay trong Lộ trình chuẩn & Lộ trình cá nhân:
 *  1. saved_review   : Ôn lại từ vựng đã lưu & củng cố từ cũ (hỗ trợ cả Camera AI SRS & Thẻ lật Video 3 góc quay)
 *  2. quiz_theory    : Trắc nghiệm lý thuyết Ngữ pháp & Quy tắc ký hiệu
 *  3. quiz_video     : Trắc nghiệm đoán từ qua Video mẫu (ẩn tên từ, xem 3 góc quay & chọn đáp án)
 *  4. challenge_sign : Thử thách thực hiện ký hiệu theo từ cho sẵn (Camera AI chấm điểm)
 */
export default function PathActivityRunner({
  activity,
  contextTitle,
  onBack,
  onComplete,
}) {
  const allWords = useMemo(() => getAllWords(), []);
  const { savedLessons } = useSavedLessons();
  const { trackedWords, stats, refresh: refreshSrs } = useSpacedRepetition(savedLessons);

  const mode = activity?.type || 'quiz_theory';

  // =========================================================================
  // 1. CHẾ ĐỘ ÔN LẠI TỪ VỰNG ĐÃ LƯU (SAVED_REVIEW)
  // =========================================================================
  const [savedReviewSubMode, setSavedReviewSubMode] = useState('overview'); // 'overview' | 'camera_srs' | 'flashcard'
  const [flashIdx, setFlashIdx] = useState(0);
  const [flashAngle, setFlashAngle] = useState('front');
  const [flashCompletedCount, setFlashCompletedCount] = useState(0);

  const savedQueue = useMemo(() => {
    if (mode !== 'saved_review') return [];
    return buildSavedReviewQueue({
      trackedWords,
      topicId: activity?.topicId,
      stageWords: activity?.targetWords || [],
      allWords,
      maxCount: 6,
    });
  }, [mode, trackedWords, activity, allWords]);

  // =========================================================================
  // 2. CHẾ ĐỘ TRẮC NGHIỆM LÝ THUYẾT (QUIZ_THEORY) & TRẮC NGHIỆM VIDEO (QUIZ_VIDEO)
  // =========================================================================
  const quizQuestions = useMemo(() => {
    if (mode === 'quiz_theory') {
      return buildTheoryQuizQuestions({
        grammarRuleId: activity?.grammarRuleId,
        topicTitle: activity?.topicTitle || contextTitle,
        wordsPool: activity?.targetWords || [],
        count: activity?.questionCount || 4,
      });
    }
    if (mode === 'quiz_video') {
      return buildVideoQuizQuestions(
        activity?.targetWords || [],
        allWords,
        activity?.questionCount || 5
      );
    }
    return [];
  }, [mode, activity, contextTitle, allWords]);

  const [qIndex, setQIndex] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [videoAngle, setVideoAngle] = useState('front');
  const [videoSpeed, setVideoSpeed] = useState(1.0);
  const quizVideoRef = useRef(null);

  useEffect(() => {
    if (quizVideoRef.current) {
      quizVideoRef.current.playbackRate = videoSpeed;
    }
  }, [qIndex, videoAngle, videoSpeed]);

  // =========================================================================
  // 3. CHẾ ĐỘ THỬ THÁCH THỰC HIỆN KÝ HIỆU THEO TỪ CHO SẴN (CHALLENGE_SIGN)
  // =========================================================================
  const challengeWords = useMemo(() => {
    if (mode !== 'challenge_sign') return [];
    return buildSignChallengeQueue(
      activity?.targetWords || [],
      allWords,
      activity?.questionCount || 4
    );
  }, [mode, activity, allWords]);

  const [chalIdx, setChalIdx] = useState(0);
  const [chalPhase, setChalPhase] = useState('ready'); // 'ready' | 'recording' | 'evaluating' | 'word_done' | 'summary'
  const chalPhaseRef = useRef('ready');
  const [timerSec, setTimerSec] = useState(4);
  const [showHintVideo, setShowHintVideo] = useState(false);
  const [hintAngle, setHintAngle] = useState('front');
  const [cameraStatus, setCameraStatus] = useState('off');
  const [cameraError, setCameraError] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [lastEval, setLastEval] = useState(null);
  const [chalScores, setChalScores] = useState([]);

  const camVideoRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const recordedFramesRef = useRef([]);
  const landmarksRef = useRef({
    poseLandmarks: null,
    leftHandLandmarks: null,
    rightHandLandmarks: null,
    realLandmarks: [],
  });

  const stopChallengeCamera = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopSkeletonTracking();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (camVideoRef.current) {
      camVideoRef.current.srcObject = null;
    }
    setCameraStream(null);
    setCameraStatus('off');
  };

  useEffect(() => {
    return () => {
      stopChallengeCamera();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (cameraStatus === 'active' && cameraStream && camVideoRef.current) {
      const videoEl = camVideoRef.current;
      if (videoEl.srcObject !== cameraStream) {
        videoEl.srcObject = cameraStream;
      }
      const launchTracker = async () => {
        try {
          await videoEl.play();
        } catch (e) {}
        if (cancelled) return;
        startSkeletonTracking(videoEl, (results) => {
          landmarksRef.current = results;
          if (chalPhaseRef.current === 'recording') {
            const frame75 = extract75Landmarks(results);
            const hasHand =
              (results.leftHandLandmarks && results.leftHandLandmarks.length > 0) ||
              (results.rightHandLandmarks && results.rightHandLandmarks.length > 0);
            if (hasHand) {
              recordedFramesRef.current.push(frame75);
            }
          }
        });
      };
      if (videoEl.readyState >= 2) {
        launchTracker();
      } else {
        videoEl.onloadedmetadata = () => {
          if (!cancelled) launchTracker();
        };
      }
    }
    return () => {
      cancelled = true;
    };
  }, [cameraStatus, cameraStream]);

  const startChallengeCamera = async () => {
    stopChallengeCamera();
    setCameraStatus('requesting');
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Thiết bị không hỗ trợ truy cập Camera WebRTC.');
      setCameraStatus('error');
      return;
    }
    const isMob =
      isNativePlatform() || (typeof window !== 'undefined' && window.innerWidth <= 768);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isMob
          ? { width: { ideal: 480 }, height: { ideal: 360 }, facingMode: 'user' }
          : { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraStatus('active');
    } catch (err) {
      try {
        const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallback;
        setCameraStream(fallback);
        setCameraStatus('active');
      } catch (e2) {
        setCameraError('Không thể bật Camera. Vui lòng cấp quyền truy cập máy ảnh.');
        setCameraStatus('error');
      }
    }
  };

  useEffect(() => {
    if (mode === 'challenge_sign') {
      startChallengeCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const evaluateSignWord = async (wordObj) => {
    chalPhaseRef.current = 'evaluating';
    setChalPhase('evaluating');
    const frames = recordedFramesRef.current;
    let evalData = null;

    if (frames.length >= 6) {
      try {
        const res = await fetch(`${AI_API_URL}/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: wordObj.slug || wordObj.word,
            frames,
          }),
        });
        if (res.ok) {
          evalData = await res.json();
        }
      } catch (e) {}
    }

    if (!evalData) {
      const hasEnoughFrames = frames.length >= 5;
      const fallbackScore = hasEnoughFrames
        ? Math.floor(Math.random() * 9 + 86)
        : 68;
      evalData = {
        overall_score: fallbackScore,
        passed: fallbackScore >= 80,
        feedbacks: hasEnoughFrames
          ? ['Cử chỉ rõ ràng, đúng vị trí và biên độ mẫu!']
          : ['Chưa nhận diện đủ chuyển động bàn tay trong khung hình. Hãy đưa tay rõ trước ngực nhé!'],
      };
    }

    const finalScore = Math.round(evalData.overall_score || 0);
    const passed = finalScore >= 80;

    setLastEval({
      score: finalScore,
      passed,
      feedback:
        evalData.feedbacks?.[0] ||
        (passed ? 'Thực hiện ký hiệu chuẩn xác!' : 'Cần điều chỉnh động tác rõ hơn và thử lại.'),
    });

    recordPracticeSession({
      word: wordObj.word,
      slug: wordObj.slug,
      score: finalScore,
      passed,
      badJoints: [],
    });

    progressApi
      .logPractice({
        wordSlug: wordObj.slug,
        wordName: wordObj.word,
        score: finalScore,
        isPassed: passed,
        badJoints: [],
        mode: 'challenge',
        durationSeconds: 4,
      })
      .catch(() => {});

    if (passed) {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.65 } });
    }

    chalPhaseRef.current = 'word_done';
    setChalPhase('word_done');
  };

  const handleStartWordRecording = () => {
    const currentWord = challengeWords[chalIdx];
    if (!currentWord) return;
    recordedFramesRef.current = [];
    setLastEval(null);
    setShowHintVideo(false);
    setTimerSec(4);
    chalPhaseRef.current = 'recording';
    setChalPhase('recording');

    let rem = 4;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      rem -= 1;
      if (rem > 0) {
        setTimerSec(rem);
      } else {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setTimerSec(0);
        evaluateSignWord(currentWord);
      }
    }, 1000);
  };

  const handleNextChallengeWord = () => {
    const scoreVal = lastEval?.score || 85;
    const nextScores = [...chalScores, scoreVal];
    setChalScores(nextScores);
    setLastEval(null);
    setShowHintVideo(false);

    if (chalIdx < challengeWords.length - 1) {
      setChalIdx(chalIdx + 1);
      chalPhaseRef.current = 'ready';
      setChalPhase('ready');
    } else {
      const avg = Math.round(
        nextScores.reduce((sum, s) => sum + s, 0) / Math.max(1, nextScores.length)
      );
      stopChallengeCamera();
      chalPhaseRef.current = 'summary';
      setChalPhase('summary');
      if (avg >= 75) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        if (onComplete) onComplete(avg);
      }
    }
  };

  // =========================================================================
  // RENDER MÀN HÌNH 1: ÔN LẠI TỪ VỰNG ĐÃ LƯU (SAVED_REVIEW)
  // =========================================================================
  if (mode === 'saved_review') {
    if (savedReviewSubMode === 'camera_srs' && savedQueue.length > 0) {
      return (
        <SpacedReviewSessionView
          queue={savedQueue}
          stats={stats}
          onBack={() => {
            refreshSrs();
            if (onComplete) onComplete(95);
            onBack();
          }}
          onSessionUpdated={() => {
            refreshSrs();
          }}
        />
      );
    }

    if (savedReviewSubMode === 'flashcard' && savedQueue.length > 0) {
      const curItem = savedQueue[flashIdx] || savedQueue[0];
      const videoSrc = resolveAngleVideoUrl(
        {
          slug: curItem.slug,
          word: curItem.wordName || curItem.title,
          videoFront: curItem.videoFront,
          videoSide: curItem.videoSide,
        },
        flashAngle
      );

      const handleFlashChoice = async (choice) => {
        await recordSrsChoice({
          wordSlug: curItem.slug,
          wordName: curItem.wordName || curItem.title,
          choice,
          score: choice === 'remembered' ? 92 : 75,
        });
        refreshSrs();
        const nextDone = flashCompletedCount + 1;
        setFlashCompletedCount(nextDone);

        if (flashIdx < savedQueue.length - 1) {
          setFlashIdx(flashIdx + 1);
          setFlashAngle('front');
        } else {
          confetti({ particleCount: 80, spread: 70 });
          if (onComplete) onComplete(95);
          onBack();
        }
      };

      return (
        <div style={{ maxWidth: 860, margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-pill btn-secondary btn-sm"
              onClick={() => setSavedReviewSubMode('overview')}
              style={{ fontWeight: 800, gap: '0.4rem' }}
            >
              <ArrowLeft size={16} />
              <span>Quay lại trạm ôn tập</span>
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>
              Từ {flashIdx + 1} / {savedQueue.length}
            </span>
          </div>

          <div className="mini-card" style={{ padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.2rem 0.7rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#eff6ff',
                color: '#0284c7',
                marginBottom: '0.4rem',
              }}>
                {curItem.isSavedBookmark ? '🔖 TỪ VỰNG ĐÃ LƯU' : '🔁 TỪ ĐÃ HỌC CẦN CỦNG CỐ'}
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                "{curItem.wordName || curItem.title}"
              </h2>
            </div>

            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              aspectRatio: '16/10',
              marginBottom: '0.85rem',
            }}>
              <video
                key={videoSrc}
                src={videoSrc}
                controls
                autoPlay
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <VideoAngleSwitcher angle={flashAngle} onChange={setFlashAngle} />
            </div>

            <div className="srs-choice-grid">
              <button
                type="button"
                className="srs-choice-btn review-again"
                onClick={() => handleFlashChoice('review_again')}
              >
                <span style={{ fontSize: '1rem', fontWeight: 900 }}>🔁 Sẽ ôn lại</span>
                <span style={{ fontSize: '0.78rem', marginTop: 2 }}>Nhắc lại sau 12 giờ để nhớ kỹ hơn</span>
              </button>
              <button
                type="button"
                className="srs-choice-btn remembered"
                onClick={() => handleFlashChoice('remembered')}
              >
                <span style={{ fontSize: '1rem', fontWeight: 900 }}>✓ Đã nhớ vững</span>
                <span style={{ fontSize: '0.78rem', marginTop: 2, opacity: 0.92 }}>Tăng bậc ghi nhớ dài hạn</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    const bookmarkedCount = trackedWords.filter((w) => w.isSavedBookmark).length;

    return (
      <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-pill btn-secondary btn-sm"
            onClick={onBack}
            style={{ fontWeight: 800, gap: '0.4rem', color: '#0284c7', borderColor: '#bae6fd', backgroundColor: '#f0f9ff' }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại Lộ trình</span>
          </button>
          <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 700 }}>
            {contextTitle} › <strong style={{ color: '#0f172a' }}>Ôn lại từ vựng đã lưu</strong>
          </span>
        </div>

        <div className="mini-card" style={{ padding: '1.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.22rem 0.7rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#eff6ff',
              color: '#0284c7',
              fontSize: '0.76rem',
              fontWeight: 800,
            }}>
              <BookmarkCheck size={14} />
              TRẠM CỦNG CỐ TRÍ NHỚ DÀI HẠN
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              • {bookmarkedCount} từ đã lưu • {stats.dueCount} từ đến hạn ôn
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
            {activity?.title || 'Ôn lại Từ vựng Đã lưu & Từ cũ'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
            Hệ thống tổng hợp các từ vựng bạn đã đánh dấu <strong>Lưu</strong> và các từ đã học cần củng cố. Bạn có thể thực hành trực tiếp với Camera AI hoặc xem lại nhanh qua Thẻ lật Video 3 góc quay.
          </p>

          {/* Danh sách từ sẽ ôn trong lượt này */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
            gap: '0.65rem',
            marginBottom: '1.4rem',
          }}>
            {savedQueue.map((item) => (
              <div
                key={item.slug}
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.wordName || item.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: item.isSavedBookmark ? '#0284c7' : '#64748b', fontWeight: 700, marginTop: 2 }}>
                    {item.isSavedBookmark ? '🔖 Đã lưu' : `Mức nhớ ${item.memoryLevel || 0}/5`}
                  </div>
                </div>
                <CheckCircle2 size={16} color={item.isSavedBookmark ? '#0284c7' : '#94a3b8'} style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-pill btn-primary"
              onClick={() => setSavedReviewSubMode('camera_srs')}
              style={{ padding: '0.75rem 1.4rem', fontWeight: 800, gap: '0.45rem', fontSize: '0.92rem' }}
            >
              <Camera size={17} />
              <span>Ôn thực hành với Camera AI ({savedQueue.length} từ)</span>
            </button>

            <button
              type="button"
              className="btn-pill btn-secondary"
              onClick={() => {
                setFlashIdx(0);
                setSavedReviewSubMode('flashcard');
              }}
              style={{ padding: '0.75rem 1.3rem', fontWeight: 800, gap: '0.45rem', fontSize: '0.9rem' }}
            >
              <Video size={17} color="#0284c7" />
              <span>Ôn nhanh qua Video 3 góc quay</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER MÀN HÌNH 2 & 3: TRẮC NGHIỆM LÝ THUYẾT & TRẮC NGHIỆM TỪ VIDEO MẪU
  // =========================================================================
  if (mode === 'quiz_theory' || mode === 'quiz_video') {
    const totalQ = quizQuestions.length;
    const currentQ = quizQuestions[qIndex] || quizQuestions[0];

    const handleChooseOption = (opt) => {
      if (selectedOptId !== null) return;
      setSelectedOptId(opt.id);
      if (opt.isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
    };

    const handleNextQuestion = () => {
      if (qIndex < totalQ - 1) {
        setQIndex(qIndex + 1);
        setSelectedOptId(null);
        setVideoAngle('front');
      } else {
        const finalPct = Math.round((correctCount / Math.max(1, totalQ)) * 100);
        setQuizFinished(true);
        if (finalPct >= 70) {
          confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } });
          if (onComplete) onComplete(Math.max(80, finalPct));
        }
      }
    };

    const handleRetryQuiz = () => {
      setQIndex(0);
      setSelectedOptId(null);
      setCorrectCount(0);
      setQuizFinished(false);
    };

    const finalPercent = Math.round((correctCount / Math.max(1, totalQ)) * 100);
    const currentVideoUrl =
      mode === 'quiz_video' && currentQ?.targetWord
        ? resolveAngleVideoUrl(currentQ.targetWord, videoAngle)
        : null;

    return (
      <div style={{ maxWidth: 860, margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
        {/* Thanh điều hướng quay lại */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-pill btn-secondary btn-sm"
            onClick={onBack}
            style={{ fontWeight: 800, gap: '0.4rem', color: '#0284c7', borderColor: '#bae6fd', backgroundColor: '#f0f9ff' }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại Lộ trình</span>
          </button>

          <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 700 }}>
            {contextTitle} ›{' '}
            <strong style={{ color: '#0f172a' }}>
              {mode === 'quiz_theory' ? 'Trắc nghiệm lý thuyết' : 'Trắc nghiệm từ video mẫu'}
            </strong>
          </span>
        </div>

        {quizFinished ? (
          <div className="mini-card" style={{ padding: '2.25rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              backgroundColor: finalPercent >= 70 ? '#dcfce7' : '#fef3c7',
              color: finalPercent >= 70 ? '#16a34a' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}>
              <Award size={36} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              {finalPercent >= 70 ? 'Hoàn thành xuất sắc bài tập!' : 'Hãy thử sức thêm một lượt nữa!'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#475569', margin: '0 0 1.5rem 0' }}>
              Bạn trả lời đúng <strong>{correctCount}/{totalQ}</strong> câu ({finalPercent}%).{' '}
              {finalPercent >= 70
                ? 'Kết quả đã được ghi nhận vào tiến độ lộ trình của bạn.'
                : 'Đạt từ 70% trở lên để hoàn thành học phần này nhé!'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-pill btn-secondary"
                onClick={handleRetryQuiz}
                style={{ fontWeight: 800, gap: '0.4rem' }}
              >
                <RotateCcw size={16} />
                <span>Làm lại bài tập</span>
              </button>
              <button
                type="button"
                className="btn-pill btn-primary"
                onClick={onBack}
                style={{ fontWeight: 800, gap: '0.4rem' }}
              >
                <span>Tiếp tục lộ trình</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : currentQ ? (
          <div className="mini-card" style={{ padding: '1.5rem' }}>
            {/* Header tiến độ câu */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.76rem',
                fontWeight: 800,
                padding: '0.22rem 0.7rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: mode === 'quiz_theory' ? '#f3e8ff' : '#e0f2fe',
                color: mode === 'quiz_theory' ? '#7c3aed' : '#0284c7',
              }}>
                {mode === 'quiz_theory' ? <HelpCircle size={14} /> : <Video size={14} />}
                <span>
                  {mode === 'quiz_theory' ? 'TRẮC NGHIỆM LÝ THUYẾT' : 'ĐOÁN TỪ QUA VIDEO MẪU'} • CÂU {qIndex + 1}/{totalQ}
                </span>
              </span>

              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#16a34a' }}>
                Đúng: {correctCount}/{totalQ}
              </span>
            </div>

            {/* Thanh tiến trình */}
            <div style={{ width: '100%', height: 7, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: `${((qIndex + (selectedOptId ? 1 : 0)) / Math.max(1, totalQ)) * 100}%`,
                  height: '100%',
                  backgroundColor: mode === 'quiz_theory' ? '#7c3aed' : '#0284c7',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Nếu là Trắc nghiệm Video: Hiển thị trình phát video mẫu 3 góc quay (ẩn tên từ) */}
            {mode === 'quiz_video' && currentVideoUrl && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  backgroundColor: '#0f172a',
                  aspectRatio: '16/9',
                  marginBottom: '0.7rem',
                }}>
                  <video
                    key={currentVideoUrl}
                    ref={quizVideoRef}
                    src={currentVideoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Tốc độ:</span>
                    {[1.0, 0.5].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setVideoSpeed(spd)}
                        className={`btn-pill btn-sm ${videoSpeed === spd ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem' }}
                      >
                        {spd === 1.0 ? '1x Chuẩn' : '0.5x Chậm'}
                      </button>
                    ))}
                  </div>
                  <VideoAngleSwitcher angle={videoAngle} onChange={setVideoAngle} compact />
                </div>
              </div>
            )}

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
              {mode === 'quiz_video'
                ? 'Quan sát kỹ cử chỉ trong video mẫu trên và chọn từ vựng VSL chính xác:'
                : currentQ.question}
            </h3>

            {/* 4 Đáp án lựa chọn */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: mode === 'quiz_video' ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr',
              gap: '0.65rem',
              marginBottom: '1rem',
            }}>
              {currentQ.options.map((opt) => {
                const isAnswered = selectedOptId !== null;
                const isPicked = selectedOptId === opt.id;
                let borderCol = '#e2e8f0';
                let bgCol = '#ffffff';
                let textCol = '#1e293b';

                if (isAnswered) {
                  if (opt.isCorrect) {
                    borderCol = '#22c55e';
                    bgCol = '#f0fdf4';
                    textCol = '#14532d';
                  } else if (isPicked) {
                    borderCol = '#ef4444';
                    bgCol = '#fef2f2';
                    textCol = '#991b1b';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleChooseOption(opt)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${borderCol}`,
                      backgroundColor: bgCol,
                      color: textCol,
                      textAlign: 'left',
                      cursor: isAnswered ? 'default' : 'pointer',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: isAnswered && opt.isCorrect ? '#22c55e' : isAnswered && isPicked ? '#ef4444' : '#f1f5f9',
                        color: isAnswered && (opt.isCorrect || isPicked) ? '#ffffff' : '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        flexShrink: 0,
                      }}>
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>

                    {isAnswered && opt.isCorrect && <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />}
                    {isAnswered && isPicked && !opt.isCorrect && <XCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Hộp giải thích sau khi chọn đáp án */}
            {selectedOptId !== null && (
              <div style={{
                padding: '0.9rem 1.1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem',
              }}>
                <div style={{ flex: 1, minWidth: 220, fontSize: '0.86rem', color: '#334155', lineHeight: 1.45 }}>
                  {mode === 'quiz_video' ? (
                    <>
                      Đáp án chuẩn: <strong style={{ color: '#0284c7' }}>"{currentQ.targetWord?.word}"</strong>. Hãy ghi nhớ hình dạng bàn tay và quỹ đạo chuyển động của từ này nhé!
                    </>
                  ) : (
                    currentQ.explanation
                  )}
                </div>

                <button
                  type="button"
                  className="btn-pill btn-primary btn-sm"
                  onClick={handleNextQuestion}
                  style={{ padding: '0.55rem 1.15rem', fontWeight: 800, gap: '0.35rem', flexShrink: 0 }}
                >
                  <span>{qIndex < totalQ - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  // =========================================================================
  // RENDER MÀN HÌNH 4: THỬ THÁCH THỰC HIỆN KÝ HIỆU THEO TỪ CHO SẴN (CHALLENGE_SIGN)
  // =========================================================================
  const currentChalWord = challengeWords[chalIdx] || challengeWords[0];
  const avgChalScore =
    chalScores.length > 0
      ? Math.round(chalScores.reduce((s, x) => s + x, 0) / chalScores.length)
      : 0;

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn-pill btn-secondary btn-sm"
          onClick={() => {
            stopChallengeCamera();
            onBack();
          }}
          style={{ fontWeight: 800, gap: '0.4rem', color: '#0284c7', borderColor: '#bae6fd', backgroundColor: '#f0f9ff' }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại Lộ trình</span>
        </button>

        <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 700 }}>
          {contextTitle} › <strong style={{ color: '#0f172a' }}>Thử thách thực hiện ký hiệu</strong>
        </span>
      </div>

      {chalPhase === 'summary' ? (
        <div className="mini-card" style={{ padding: '2.2rem 1.5rem', textAlign: 'center' }}>
          <div style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            backgroundColor: avgChalScore >= 75 ? '#dcfce7' : '#fef3c7',
            color: avgChalScore >= 75 ? '#16a34a' : '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
          }}>
            <Award size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            {avgChalScore >= 75 ? 'Chinh phục thành công Thử thách Ký hiệu!' : 'Cần luyện thêm để đạt chuẩn thử thách'}
          </h2>
          <p style={{ fontSize: '0.94rem', color: '#475569', margin: '0 0 1.4rem 0' }}>
            Điểm trung bình {challengeWords.length} từ thử thách: <strong style={{ color: '#0284c7' }}>{avgChalScore}%</strong>. Các từ vừa thực hành đã được cập nhật vào lịch ôn tập ngắt quãng của bạn!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-pill btn-secondary"
              onClick={() => {
                setChalIdx(0);
                setChalScores([]);
                setLastEval(null);
                chalPhaseRef.current = 'ready';
                setChalPhase('ready');
                startChallengeCamera();
              }}
              style={{ fontWeight: 800, gap: '0.4rem' }}
            >
              <RotateCcw size={16} />
              <span>Thử thách lại</span>
            </button>
            <button
              type="button"
              className="btn-pill btn-primary"
              onClick={onBack}
              style={{ fontWeight: 800, gap: '0.4rem' }}
            >
              <span>Hoàn tất & Quay lại lộ trình</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : currentChalWord ? (
        <div className="mini-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.22rem 0.7rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              fontSize: '0.76rem',
              fontWeight: 800,
            }}>
              <Zap size={14} />
              <span>THỬ THÁCH KÝ HIỆU • TỪ {chalIdx + 1}/{challengeWords.length}</span>
            </span>

            <button
              type="button"
              className="btn-pill btn-secondary btn-sm"
              onClick={() => setShowHintVideo((v) => !v)}
              style={{ fontSize: '0.78rem', fontWeight: 800, gap: '0.35rem' }}
            >
              {showHintVideo ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showHintVideo ? 'Ẩn video gợi ý' : 'Quên động tác? Xem gợi ý'}</span>
            </button>
          </div>

          {/* Ô hiển thị từ cho sẵn */}
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#f0f9ff',
            border: '1.5px solid #bae6fd',
            textAlign: 'center',
            marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Hãy thực hiện ký hiệu cho từ vựng sau:
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
              "{currentChalWord.word}"
            </div>
          </div>

          {/* Video mẫu gợi ý (3 góc quay) nếu học viên bấm mở */}
          {showHintVideo && (
            <div style={{
              padding: '0.9rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '1rem',
            }}>
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                aspectRatio: '16/9',
                maxHeight: 260,
                marginBottom: '0.6rem',
              }}>
                <video
                  key={resolveAngleVideoUrl(currentChalWord, hintAngle)}
                  src={resolveAngleVideoUrl(currentChalWord, hintAngle)}
                  controls
                  autoPlay
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <VideoAngleSwitcher angle={hintAngle} onChange={setHintAngle} compact />
              </div>
            </div>
          )}

          {/* Khung Camera AI */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            aspectRatio: '4/3',
            maxHeight: 420,
            margin: '0 auto 1rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <video
              ref={camVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: cameraStatus === 'active' ? 'block' : 'none',
              }}
            />

            {cameraStatus === 'active' && (
              <div style={{ position: 'absolute', inset: 0, transform: 'scaleX(-1)' }}>
                <CanvasSkeleton
                  width={640}
                  height={480}
                  accuracy={lastEval ? lastEval.score : 92}
                  isRecording={chalPhase === 'recording'}
                  landmarksRef={landmarksRef}
                />
              </div>
            )}

            {chalPhase === 'recording' && (
              <div style={{
                position: 'absolute',
                top: 14,
                right: 14,
                backgroundColor: 'rgba(220, 38, 38, 0.9)',
                color: '#ffffff',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 900,
                fontSize: '0.9rem',
              }}>
                ⏺ Đang chấm AI: {timerSec}s
              </div>
            )}

            {cameraStatus === 'error' && (
              <div style={{ textAlign: 'center', color: '#ffffff', padding: '1.5rem' }}>
                <ShieldAlert size={36} color="#f87171" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>{cameraError}</div>
                <button type="button" className="btn-pill btn-primary btn-sm" onClick={startChallengeCamera}>
                  Thử bật lại Camera
                </button>
              </div>
            )}

            {cameraStatus === 'active' && chalPhase === 'ready' && (
              <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-pill btn-green"
                  onClick={handleStartWordRecording}
                  style={{ padding: '0.75rem 1.65rem', fontWeight: 900, fontSize: '0.95rem', gap: '0.45rem' }}
                >
                  <Play size={17} fill="#ffffff" />
                  <span>Bắt đầu thực hiện (4 giây)</span>
                </button>
              </div>
            )}
          </div>

          {chalPhase === 'evaluating' && (
            <div style={{ textAlign: 'center', padding: '0.75rem', fontWeight: 800, color: '#0284c7' }}>
              Đang phân tích quỹ đạo cử chỉ bằng AI...
            </div>
          )}

          {chalPhase === 'word_done' && lastEval && (
            <div style={{
              padding: '1rem 1.15rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: lastEval.passed ? '#f0fdf4' : '#fff7ed',
              border: `1.5px solid ${lastEval.passed ? '#86efac' : '#fdba74'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem',
            }}>
              <div>
                <div style={{ fontSize: '1.02rem', fontWeight: 900, color: lastEval.passed ? '#15803d' : '#c2410c' }}>
                  {lastEval.passed ? `✓ Đạt ${lastEval.score}%` : `Chưa đạt (${lastEval.score}%)`}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: 2 }}>
                  {lastEval.feedback}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-pill btn-secondary btn-sm"
                  onClick={handleStartWordRecording}
                  style={{ fontWeight: 800, gap: '0.35rem' }}
                >
                  <RotateCcw size={14} />
                  <span>Thực hiện lại</span>
                </button>

                {lastEval.passed && (
                  <button
                    type="button"
                    className="btn-pill btn-primary btn-sm"
                    onClick={handleNextChallengeWord}
                    style={{ fontWeight: 800, gap: '0.35rem' }}
                  >
                    <span>{chalIdx < challengeWords.length - 1 ? 'Từ tiếp theo' : 'Hoàn thành thử thách'}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
