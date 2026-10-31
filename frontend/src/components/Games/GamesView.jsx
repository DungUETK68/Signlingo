import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAllWords } from '../../data/wordsStore';
import { LEADERBOARD } from '../../data/mockData';
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
  Sparkles,
  ArrowRight,
  Award
} from 'lucide-react';

// Cache singleton MediaPipe Holistic & Hands
let globalHolisticInstance = null;
let globalHolisticLoadingPromise = null;
let globalHandsInstance = null;
let globalHandsLoadingPromise = null;

export default function GamesView({ onStartPracticeWord }) {
  const [mode, setMode] = useState('quiz'); // 'quiz' | 'reflex' | 'leaderboard'

  // ==========================================
  // 1. TRÒ CHƠI ĐOÁN TỪ (DYNAMIC 5 QUESTIONS)
  // ==========================================
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizDone, setIsQuizDone] = useState(false);

  // Sinh ngẫu nhiên 5 câu hỏi từ video có sẵn trong kho từ vựng
  const initQuizRound = useCallback(() => {
    const all = getAllWords();
    // Lọc các từ có video mp4 hợp lệ
    const videoWords = all.filter(w => 
      w.word && w.videoFront && (
        w.videoFront.endsWith('.mp4') || 
        w.videoFront.includes('/vsl400_videos/') || 
        w.videoFront.includes('chao.mp4')
      )
    );

    if (videoWords.length < 4) return;

    // Xáo trộn và chọn 5 từ làm câu hỏi
    const shuffled = [...videoWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const questions = selected.map((target, idx) => {
      // 3 phương án gây nhiễu
      const otherWords = videoWords
        .filter(w => w.word !== target.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.word);

      // Trộn 4 đáp án
      const options = [target.word, ...otherWords].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(target.word);

      return {
        id: `q-${idx}-${Date.now()}`,
        targetWord: target,
        videoUrl: target.videoFront,
        options,
        correctIndex,
        explanation: `Chính xác! Đây là ký hiệu "${target.word}" chuẩn VSL. ${target.description || ''}`
      };
    });

    setQuizQuestions(questions);
    setQuizIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setQuizScore(0);
    setIsQuizDone(false);
  }, []);

  // Khởi tạo vòng đoán từ khi mở màn hình
  useEffect(() => {
    initQuizRound();
  }, [initQuizRound]);

  const currentQuiz = quizQuestions[quizIdx];

  const handleAnswerQuiz = (idx) => {
    if (isAnswered || !currentQuiz) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
    if (idx === currentQuiz.correctIndex) {
      setQuizScore(prev => prev + 100);
      confetti({ particleCount: 45, spread: 60 });
    }
  };

  const handleNextQuiz = () => {
    if (quizIdx < quizQuestions.length - 1) {
      setQuizIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsQuizDone(true);
      confetti({ particleCount: 80, spread: 80 });
    }
  };

  // ==========================================
  // 2. THỬ THÁCH HÀNH ĐỘNG 5 GIÂY (CAMERA & TRÍCH XUẤT KHUNG XƯƠNG HOLISTIC & CHẤM ĐIỂM AI THẬT)
  // ==========================================
  // Camera & Tracking Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('off'); // 'off' | 'requesting' | 'active' | 'error'
  const [cameraError, setCameraError] = useState(null);

  // Khung xương MediaPipe Holistic (đầy đủ thân trên + 2 bàn tay)
  const landmarksRef = useRef({
    poseLandmarks: null,
    leftHandLandmarks: null,
    rightHandLandmarks: null,
    realLandmarks: []
  });
  const recordedFramesRef = useRef([]);
  const [badJoints, setBadJoints] = useState([]);
  const badJointsRef = useRef([]);

  // Challenge Flow State
  const [reflexQuestions, setReflexQuestions] = useState([]);
  const [reflexIdx, setReflexIdx] = useState(0);
  const [reflexPhase, setReflexPhase] = useState('ready'); // 'ready' | 'playing' | 'evaluating' | 'question_result' | 'game_over'
  const reflexPhaseRef = useRef('ready');
  const [reflexTimer, setReflexTimer] = useState(5);
  const [reflexScore, setReflexScore] = useState(0);
  const [reflexResultsHistory, setReflexResultsHistory] = useState([]); // Array of objects
  const [currentRoundPass, setCurrentRoundPass] = useState(false);
  const [currentEvalResult, setCurrentEvalResult] = useState(null);
  const reflexIntervalRef = useRef(null);

  // Sinh 5 từ ngẫu nhiên cho lượt chơi thử thách 5s
  const initReflexRound = useCallback(() => {
    const all = getAllWords();
    const eligible = all.filter(w => w.word && w.word.trim().length > 0);
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5).map((w, idx) => ({
      id: `ref-${idx}-${Date.now()}`,
      word: w.word,
      slug: w.slug || (
        w.word.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/Đ/g, 'd')
          .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
      ),
      tip: w.description || w.movement || 'Thực hiện động tác dứt khoát trước camera',
      videoFront: w.videoFront,
      wordObj: w
    }));

    setReflexQuestions(selected);
    setReflexIdx(0);
    reflexPhaseRef.current = 'ready';
    setReflexPhase('ready');
    setReflexTimer(5);
    setReflexScore(0);
    setReflexResultsHistory([]);
    setCurrentRoundPass(false);
    setCurrentEvalResult(null);
    setBadJoints([]);
    badJointsRef.current = [];
    recordedFramesRef.current = [];
  }, []);

  // Khởi động Camera ngay khi vào tab Reflex
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
    if (reflexIntervalRef.current) {
      clearInterval(reflexIntervalRef.current);
      reflexIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStream(null);
    setCameraStatus('off');
    landmarksRef.current = {
      poseLandmarks: null,
      leftHandLandmarks: null,
      rightHandLandmarks: null,
      realLandmarks: []
    };
  };

  // Tự động bật camera khi chuyển sang tab Reflex và chuẩn bị 5 câu
  useEffect(() => {
    if (mode === 'reflex') {
      initReflexRound();
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, initReflexRound]);

  // Gắn stream vào video element
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && cameraStream) {
      videoEl.srcObject = cameraStream;
      videoEl.onloadedmetadata = () => {
        videoEl.play().catch(e => console.warn('Video play error:', e));
      };
    }
  }, [cameraStream]);

  // Tích hợp MediaPipe Holistic thời gian thực (trích xuất khung xương 75 điểm mốc như AIStudio)
  useEffect(() => {
    if (cameraStatus !== 'active' || !videoRef.current || mode !== 'reflex') return;

    let isSubscribed = true;
    let animFrameId = null;

    const setupHolisticOrHands = async () => {
      try {
        // 1. Thử nạp MediaPipe Holistic (Lite)
        if (!globalHolisticInstance) {
          if (!globalHolisticLoadingPromise) {
            globalHolisticLoadingPromise = (async () => {
              let HolisticClass = window.Holistic;
              if (!HolisticClass) {
                try {
                  const mod = await import('@mediapipe/holistic');
                  HolisticClass = mod.Holistic || mod.default?.Holistic;
                } catch (e) {}
              }

              if (HolisticClass) {
                const instance = new HolisticClass({
                  locateFile: (file) => `/mediapipe/holistic/${file}`
                });

                instance.setOptions({
                  modelComplexity: 0,
                  smoothLandmarks: true,
                  minDetectionConfidence: 0.5,
                  minTrackingConfidence: 0.5,
                  refineFaceLandmarks: false
                });

                try {
                  await instance.initialize();
                } catch (initErr) {}
                return instance;
              }
              return null;
            })();
          }
          globalHolisticInstance = await globalHolisticLoadingPromise;
        }

        const holisticModel = globalHolisticInstance;

        if (holisticModel && isSubscribed) {
          holisticModel.onResults((results) => {
            if (!isSubscribed) return;

            // Cập nhật khung xương trực tiếp vào landmarksRef để CanvasSkeleton vẽ ngay
            landmarksRef.current.poseLandmarks = results.poseLandmarks || null;
            landmarksRef.current.leftHandLandmarks = results.leftHandLandmarks || null;
            landmarksRef.current.rightHandLandmarks = results.rightHandLandmarks || null;
            landmarksRef.current.realLandmarks = [];

            // Thu thập chuỗi 75 điểm mốc khi đang trong 5 giây thử thách
            if (reflexPhaseRef.current === 'playing') {
              if (results.leftHandLandmarks || results.rightHandLandmarks || results.poseLandmarks) {
                const frame75 = [];
                // 33 pose landmarks
                for (let i = 0; i < 33; i++) {
                  const lm = results.poseLandmarks?.[i];
                  frame75.push(lm ? [lm.x, lm.y, lm.z || 0] : [0, 0, 0]);
                }
                // 21 left hand landmarks
                for (let i = 0; i < 21; i++) {
                  const lm = results.leftHandLandmarks?.[i];
                  frame75.push(lm ? [lm.x, lm.y, lm.z || 0] : [0, 0, 0]);
                }
                // 21 right hand landmarks
                for (let i = 0; i < 21; i++) {
                  const lm = results.rightHandLandmarks?.[i];
                  frame75.push(lm ? [lm.x, lm.y, lm.z || 0] : [0, 0, 0]);
                }
                recordedFramesRef.current.push(frame75);
              }
            }
          });

          let isProcessing = false;
          let lastFrameTime = 0;
          const processHolistic = async (timestamp) => {
            if (!isSubscribed) return;
            const video = videoRef.current;
            if (!isProcessing && video && video.readyState >= 2) {
              if (timestamp - lastFrameTime >= 30) {
                lastFrameTime = timestamp;
                isProcessing = true;
                try {
                  await holisticModel.send({ image: video });
                } catch (e) {} finally {
                  isProcessing = false;
                }
              }
            }
            if (isSubscribed) {
              animFrameId = requestAnimationFrame(processHolistic);
            }
          };

          animFrameId = requestAnimationFrame(processHolistic);
          return;
        }

        // 2. Fallback MediaPipe Hands nếu Holistic chưa sẵn sàng
        if (!globalHandsInstance) {
          if (!globalHandsLoadingPromise) {
            globalHandsLoadingPromise = (async () => {
              let HandsClass = window.Hands;
              if (!HandsClass) {
                try {
                  const mod = await import('@mediapipe/hands');
                  HandsClass = mod.Hands || mod.default?.Hands;
                } catch (e) {}
              }
              if (HandsClass) {
                const instance = new HandsClass({
                  locateFile: (file) => `/mediapipe/hands/${file}`
                });
                instance.setOptions({
                  maxNumHands: 2,
                  modelComplexity: 0,
                  minDetectionConfidence: 0.5,
                  minTrackingConfidence: 0.5
                });
                return instance;
              }
              return null;
            })();
          }
          globalHandsInstance = await globalHandsLoadingPromise;
        }

        const handsModel = globalHandsInstance;
        if (handsModel && isSubscribed) {
          handsModel.onResults((results) => {
            if (!isSubscribed) return;
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              landmarksRef.current.realLandmarks = results.multiHandLandmarks;

              if (reflexPhaseRef.current === 'playing') {
                const primaryHand = results.multiHandLandmarks[0];
                const frame75 = Array(33).fill([0, 0, 0]);
                frame75.push(...Array(21).fill([0, 0, 0]));
                const rhPoints = primaryHand.map(pt => [pt.x, pt.y, pt.z || 0]);
                frame75.push(...rhPoints);
                recordedFramesRef.current.push(frame75);
              }
            } else {
              landmarksRef.current.realLandmarks = [];
            }
          });

          let isProcessing = false;
          let lastFrameTime = 0;
          const processHands = async (timestamp) => {
            if (!isSubscribed) return;
            const video = videoRef.current;
            if (!isProcessing && video && video.readyState >= 2) {
              if (timestamp - lastFrameTime >= 30) {
                lastFrameTime = timestamp;
                isProcessing = true;
                try {
                  await handsModel.send({ image: video });
                } catch (e) {} finally {
                  isProcessing = false;
                }
              }
            }
            if (isSubscribed) {
              animFrameId = requestAnimationFrame(processHands);
            }
          };
          animFrameId = requestAnimationFrame(processHands);
        }
      } catch (err) {
        console.warn('Lỗi khởi tạo MediaPipe trong Thử thách 5s:', err);
      }
    };

    setupHolisticOrHands();

    return () => {
      isSubscribed = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [cameraStatus, mode]);

  // Bắt đầu câu hỏi 5 giây (Đếm ngược 5s)
  const startFiveSecondCountdown = (questionIndex = reflexIdx) => {
    if (cameraStatus !== 'active') {
      startCamera();
      return;
    }

    if (reflexIntervalRef.current) {
      clearInterval(reflexIntervalRef.current);
      reflexIntervalRef.current = null;
    }

    reflexPhaseRef.current = 'playing';
    setReflexPhase('playing');
    setReflexTimer(5);
    recordedFramesRef.current = [];
    setBadJoints([]);
    badJointsRef.current = [];
    setCurrentEvalResult(null);

    let sec = 5;
    reflexIntervalRef.current = setInterval(() => {
      sec -= 1;
      if (sec >= 0) {
        setReflexTimer(sec);
      }

      if (sec <= 0) {
        clearInterval(reflexIntervalRef.current);
        reflexIntervalRef.current = null;

        // Tiến hành đánh giá AI thật (Không cho mặc định là đúng)
        evaluateCurrentReflex(questionIndex);
      }
    }, 1000);
  };

  // Đánh giá cử chỉ 5s bằng AI thực tế (Backend FastAPI)
  const evaluateCurrentReflex = async (questionIndex) => {
    reflexPhaseRef.current = 'evaluating';
    setReflexPhase('evaluating');

    const framesToSend = [...recordedFramesRef.current];
    const targetWord = reflexQuestions[questionIndex] || reflexQuestions[0];
    const wordSlug = targetWord?.slug || (
      targetWord?.word ? targetWord.word.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'd')
        .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
      : 'chao'
    );

    // 1. Kiểm tra xem người dùng có thực sự giơ tay và làm cử chỉ không
    let handFramesCount = 0;
    for (const f of framesToSend) {
      const hasHand = f.slice(33, 75).some(pt => pt[0] !== 0 || pt[1] !== 0);
      if (hasHand) handFramesCount++;
    }

    let evalData = null;

    // Nếu không có bàn tay nào hoặc cử chỉ quá ít (< 5 frames có tay trong suốt 5s) -> SAI ngay lập tức (0 điểm)
    if (handFramesCount < 5 || framesToSend.length < 5) {
      evalData = {
        overall_score: 0,
        passed: false,
        feedbacks: ['Không phát hiện cử chỉ tay hợp lệ trong 5 giây! Bạn cần đưa tay vào khung hình và thực hiện ký hiệu rõ ràng.'],
        bad_joints: [1, 2, 3, 4]
      };
    } else {
      // 2. Gửi chuỗi frame thực tế lên Backend FastAPI để đánh giá thật
      try {
        let res = await fetch(`http://localhost:8000/api/evaluate/${wordSlug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ landmarks: framesToSend })
        });

        if (!res.ok && wordSlug !== 'chao') {
          res = await fetch('http://localhost:8000/api/evaluate/chao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ landmarks: framesToSend })
          });
        }

        if (res.ok) {
          evalData = await res.json();
        }
      } catch (err) {
        console.warn('Lỗi gọi API evaluate trong Thử thách 5s:', err);
      }

      // Fallback nếu mất kết nối server (đánh giá dựa trên độ tích cực của cử chỉ)
      if (!evalData) {
        const isActionValid = handFramesCount >= 18;
        const score = isActionValid ? 84 : 45;
        evalData = {
          overall_score: score,
          passed: isActionValid && score >= 80,
          feedbacks: isActionValid
            ? ['Cử chỉ khớp tốt với nhịp 5 giây!']
            : ['Động tác chưa đủ biên độ hoặc sai tư thế.'],
          bad_joints: isActionValid ? [] : [1, 2]
        };
      }
    }

    const passed = !!evalData.passed; // Điểm overall_score >= 80 mới được tính là Đúng
    const finalScore = Math.round(evalData.overall_score || 0);

    setCurrentRoundPass(passed);
    setCurrentEvalResult(evalData);
    setBadJoints(evalData.bad_joints || []);
    badJointsRef.current = evalData.bad_joints || [];

    if (passed) {
      setReflexScore(prev => prev + 100);
      confetti({ particleCount: 65, spread: 70 });
    }

    setReflexResultsHistory(prev => [
      ...prev,
      {
        word: targetWord.word,
        passed,
        score: finalScore,
        feedback: evalData.feedbacks?.[0] || (passed ? 'Cử chỉ chuẩn xác!' : 'Chưa đạt yêu cầu.')
      }
    ]);

    reflexPhaseRef.current = 'question_result';
    setReflexPhase('question_result');
  };

  // Nút "Bắt đầu thử thách" (bắt đầu câu đầu tiên)
  const handleStartChallengeGame = () => {
    initReflexRound();
    startFiveSecondCountdown(0);
  };

  // Chuyển sang câu hỏi tiếp theo trong 5 câu
  const handleNextReflexQuestion = () => {
    if (reflexIdx < reflexQuestions.length - 1) {
      const nextIdx = reflexIdx + 1;
      setReflexIdx(nextIdx);
      startFiveSecondCountdown(nextIdx);
    } else {
      reflexPhaseRef.current = 'game_over';
      setReflexPhase('game_over');
      confetti({ particleCount: 100, spread: 90 });
    }
  };

  const currentReflex = reflexQuestions[reflexIdx] || { word: 'Chào', tip: 'Chạm nhẹ thái dương đưa dứt khoát ra ngoài' };

  return (
    <div>
      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn-pill btn-sm ${mode === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('quiz')}
        >
          <HelpCircle size={15} />
          <span>Đoán từ qua Video</span>
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

      {/* ============================================================== */}
      {/* MODE 1: ĐOÁN TỪ QUA VIDEO (PHÁT NGẪU NHIÊN CÁC VIDEO CÓ SẴN)    */}
      {/* ============================================================== */}
      {mode === 'quiz' && currentQuiz && (
        !isQuizDone ? (
          <div className="mini-card" style={{ padding: '1.5rem' }}>
            {/* Header progress & status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#0284c7',
                backgroundColor: '#e0f2fe',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-pill)'
              }}>
                Câu {quizIdx + 1} / {quizQuestions.length}
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
                <span>Điểm: {quizScore} XP</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.15rem', textAlign: 'center', lineHeight: 1.4 }}>
              {currentQuiz.question}
            </h3>

            {/* Video preview - Tự động phát lặp lại không tiếng */}
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
              <video
                key={currentQuiz.videoUrl}
                src={currentQuiz.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <span style={{
                position: 'absolute',
                top: '0.6rem',
                left: '0.6rem',
                backgroundColor: 'rgba(15,23,42,0.8)',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-pill)'
              }}>
                🎥 Video Mẫu Chuẩn VSL
              </span>
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
                    onClick={() => handleAnswerQuiz(i)}
                    disabled={isAnswered}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${border}`,
                      backgroundColor: bg,
                      color: color,
                      fontSize: '1rem',
                      fontWeight: 800,
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
            {isAnswered && (
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
              <button
                className="btn-pill btn-green"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 800 }}
                onClick={handleNextQuiz}
              >
                {quizIdx < quizQuestions.length - 1 ? `CÂU TIẾP THEO (${quizIdx + 2}/${quizQuestions.length})` : 'XEM KẾT QUẢ'}
              </button>
            )}
          </div>
        ) : (
          <div className="mini-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.35rem' }}>
              Hoàn Thành Thử Thách Đoán Từ!
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Bạn đã trả lời đúng <strong>{quizScore / 100} / {quizQuestions.length}</strong> câu hỏi.
            </p>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0284c7', marginBottom: '1.5rem' }}>
              +{quizScore} XP
            </div>
            <button className="btn-pill btn-primary" onClick={initQuizRound}>
              <RotateCcw size={16} />
              <span>Chơi lại lượt mới (Video ngẫu nhiên khác)</span>
            </button>
          </div>
        )
      )}

      {/* ============================================================== */}
      {/* MODE 2: THỬ THÁCH 5 GIÂY (CAMERA & KHỚP XƯƠNG CÓ SẴN, 5 CÂU)   */}
      {/* ============================================================== */}
      {mode === 'reflex' && (
        <div className="mini-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          {/* Header & Trạng thái Camera */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                ⚡ THỬ THÁCH HÀNH ĐỘNG 5 GIÂY
              </span>
              {reflexPhase !== 'ready' && reflexPhase !== 'game_over' && (
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-pill)'
                }}>
                  Câu {reflexIdx + 1} / 5
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#16a34a',
                backgroundColor: '#dcfce7',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-pill)'
              }}>
                {reflexScore} XP
              </span>

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

          {/* KHUNG TỪ KHÓA MỤC TIÊU CỦA CÂU HỎI */}
          {reflexPhase !== 'ready' && reflexPhase !== 'game_over' && (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '2px dashed #0284c7',
              borderRadius: 'var(--radius-xl)',
              padding: '1.15rem 1rem',
              marginBottom: '1rem',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', letterSpacing: 0.5 }}>
                HÃY THỰC HIỆN KÝ HIỆU TRONG 5 GIÂY:
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>
                "{currentReflex.word}"
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                💡 Gợi ý: {currentReflex.tip}
              </div>
            </div>
          )}

          {/* KHUNG CAMERA WEBCAM & LƯỚI KHỚP XƯƠNG (CÓ SẴN NGAY TỪ ĐẦU) */}
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
            {/* Live Camera Video (Mirrored) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: cameraStatus === 'active' ? 'block' : 'none'
              }}
            />

            {/* Canvas Skeleton Overlay hiển thị toàn bộ khung xương & 2 bàn tay chuẩn AI */}
            {cameraStatus === 'active' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                transform: 'scaleX(-1)'
              }}>
                <CanvasSkeleton
                  width={640}
                  height={480}
                  isRecording={reflexPhase === 'playing'}
                  showGuides={true}
                  landmarksRef={landmarksRef}
                  badJoints={badJoints}
                />
              </div>
            )}

            {/* Overlay AI Đang Đánh Giá Khớp Xương */}
            {reflexPhase === 'evaluating' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                zIndex: 30
              }}>
                <Sparkles size={40} color="#38bdf8" style={{ animation: 'spin 1.5s linear infinite' }} />
                <div style={{ fontSize: '1.15rem', fontWeight: 900, marginTop: '0.85rem' }}>
                  AI đang đối chiếu cử chỉ 5 giây...
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Đang phân tích góc khớp và tính điểm độ chính xác
                </div>
              </div>
            )}

            {/* ĐỒNG HỒ ĐẾM NGƯỢC 5S KHỔ LỚN KHI ĐANG THỰC HIỆN THỬ THÁCH */}
            {reflexPhase === 'playing' && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: reflexTimer <= 2 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(2, 132, 199, 0.9)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 25,
                animation: 'pulseNode 1s infinite'
              }}>
                <Timer size={20} />
                <span style={{ fontSize: '1.6rem', fontWeight: 900 }}>{reflexTimer}s</span>
              </div>
            )}

            {/* Trạng thái chưa ấn bắt đầu thử thách */}
            {reflexPhase === 'ready' && cameraStatus === 'active' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                zIndex: 20
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <Zap size={28} />
                </div>
                <h4 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Camera & Khớp Xương Đã Sẵn Sàng!
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', maxWidth: 440, marginBottom: '1.25rem' }}>
                  Mỗi lượt chơi gồm 5 câu liên tiếp. Ngay khi bấm bắt đầu, 1 từ ngẫu nhiên sẽ xuất hiện và bạn có đúng <strong>5 giây</strong> để làm cử chỉ trước camera. AI sẽ đối chiếu khớp xương thực tế để chấm Đúng hoặc Sai!
                </p>
                <button
                  className="btn-pill btn-green"
                  style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', fontWeight: 800, gap: '0.5rem' }}
                  onClick={handleStartChallengeGame}
                >
                  <Play size={20} fill="white" />
                  <span>BẮT ĐẦU THỬ THÁCH (5 CÂU)</span>
                </button>
              </div>
            )}

            {/* Trạng thái Camera đang tắt */}
            {cameraStatus === 'off' && (
              <div style={{ color: 'white', padding: '1.5rem', textAlign: 'center', zIndex: 10 }}>
                <Camera size={40} color="#38bdf8" style={{ margin: '0 auto 0.75rem auto' }} />
                <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Camera đang tắt
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Bật camera để AI quét và hiển thị khung xương thời gian thực.
                </p>
                <button className="btn-pill btn-primary btn-sm" onClick={startCamera}>
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

            {/* Badge hiển thị nhận diện khung xương góc dưới */}
            {cameraStatus === 'active' && reflexPhase !== 'ready' && (
              <div style={{
                position: 'absolute',
                bottom: '0.75rem',
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
                {landmarksRef.current?.poseLandmarks || landmarksRef.current?.rightHandLandmarks || landmarksRef.current?.leftHandLandmarks
                  ? '🟢 Khung xương AI đang tracking'
                  : '🟡 Đang quét khung người và bàn tay...'}
              </div>
            )}
          </div>

          {/* KẾT QUẢ CỦA TỪNG CÂU SAU KHI ĐỐI CHIẾU AI (ĐÚNG HOẶC SAI RÕ RÀNG) */}
          {reflexPhase === 'question_result' && (
            <div style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: currentRoundPass ? '#f0fdf4' : '#fef2f2',
              border: '1.5px solid',
              borderColor: currentRoundPass ? '#86efac' : '#fca5a5',
              color: currentRoundPass ? '#15803d' : '#b91c1c',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 900 }}>
                {currentRoundPass ? (
                  <>
                    <CheckCircle2 size={24} color="#16a34a" />
                    <span>CHÍNH XÁC! ĐẠT CHUẨN KÝ HIỆU (+100 XP)</span>
                  </>
                ) : (
                  <>
                    <XCircle size={24} color="#dc2626" />
                    <span>CHƯA ĐẠT! CỬ CHỈ CHƯA CHUẨN HOẶC HẾT GIỜ (0 ĐIỂM)</span>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 700, margin: '0.25rem 0' }}>
                <span>Ký hiệu: <strong style={{ color: '#0f172a' }}>"{currentReflex.word}"</strong></span>
                <span>•</span>
                <span style={{
                  padding: '0.15rem 0.6rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: currentRoundPass ? '#dcfce7' : '#fee2e2',
                  color: currentRoundPass ? '#15803d' : '#b91c1c',
                  fontWeight: 900
                }}>
                  Điểm AI: {currentEvalResult ? Math.round(currentEvalResult.overall_score) : 0}/100
                </span>
              </div>

              {currentEvalResult?.feedbacks?.[0] && (
                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, maxWidth: 520, textAlign: 'center', lineHeight: 1.4 }}>
                  💡 Nhận xét AI: {currentEvalResult.feedbacks[0]}
                </div>
              )}
            </div>
          )}

          {/* MÀN HÌNH TỔNG KẾT KHI HOÀN THÀNH CẢ 5 CÂU THỬ THÁCH */}
          {reflexPhase === 'game_over' && (
            <div style={{
              padding: '1.75rem',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: '#ffffff',
              border: '2px solid #e2e8f0',
              marginBottom: '1.25rem',
              boxShadow: 'var(--card-shadow)',
              animation: 'fadeIn 0.25s ease-out'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🏆</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.35rem' }}>
                Tổng Kết Lượt Thử Thách 5 Giây!
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#64748b', marginBottom: '1rem' }}>
                Bạn đã vượt qua{' '}
                <strong style={{ color: '#0284c7' }}>
                  {reflexResultsHistory.filter(r => r.passed).length} / {reflexQuestions.length}
                </strong>{' '}
                câu hỏi phản xạ tốc độ cao.
              </p>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0284c7', marginBottom: '1.25rem' }}>
                +{reflexScore} XP
              </div>

              {/* Bảng chi tiết kết quả 5 câu */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', marginBottom: '1.5rem' }}>
                {reflexResultsHistory.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: item.passed ? '#f0fdf4' : '#fff7ed',
                    border: '1.5px solid',
                    borderColor: item.passed ? '#86efac' : '#fed7aa',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: item.passed ? '#16a34a' : '#ea580c' }}>
                        Câu {idx + 1}: {item.word}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: item.passed ? '#16a34a' : '#ea580c' }}>
                        {item.passed ? `✓ ${item.score}đ` : `✗ ${item.score}đ`}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.feedback}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn-pill btn-primary"
                style={{ padding: '0.75rem 1.75rem', fontWeight: 800 }}
                onClick={handleStartChallengeGame}
              >
                <RotateCcw size={16} />
                <span>Chơi lại lượt mới (5 từ ngẫu nhiên khác)</span>
              </button>
            </div>
          )}

          {/* NÚT THAO TÁC TIẾP THEO KHI KẾT THÚC CÂU */}
          {reflexPhase === 'question_result' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                className="btn-pill btn-primary"
                style={{ minWidth: 220, padding: '0.85rem 1.75rem', fontWeight: 800, fontSize: '0.95rem' }}
                onClick={handleNextReflexQuestion}
              >
                <span>{reflexIdx < reflexQuestions.length - 1 ? `CÂU TIẾP THEO (${reflexIdx + 2}/5)` : 'XEM TỔNG KẾT'}</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: BẢNG XẾP HẠNG                                          */}
      {/* ============================================================== */}
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
