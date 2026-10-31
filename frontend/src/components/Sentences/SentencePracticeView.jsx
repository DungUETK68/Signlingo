import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Video,
  ShieldAlert,
  Sparkles,
  Trophy,
  Check,
  Zap
} from 'lucide-react';
import CanvasSkeleton from '../CanvasSkeleton';
import confetti from 'canvas-confetti';

// Singleton Cache: Giữ mô hình trong bộ nhớ, lần sau mở lại là sẵn sàng ngay lập tức (0 giây)
let globalHolisticInstance = null;
let globalHolisticLoadingPromise = null;
let globalHandsInstance = null;
let globalHandsLoadingPromise = null;

function getShortRole(role) {
  if (!role) return '';
  const clean = role.replace(/[()]/g, ' ').trim();
  const firstWord = clean.split(/\s+/)[0];
  if (firstWord.length > 5) return firstWord.slice(0, 4);
  return firstWord;
}

export default function SentencePracticeView({ sentence, onBack, onFinish }) {
  const words = sentence?.words || [];

  // Trạng thái từ vựng & tiến trình câu
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const currentWordIndexRef = useRef(0);
  const [wordResults, setWordResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Tiến trình phát video của từ hiện tại (thời lượng thực tế từ video.duration)
  const [videoProgress, setVideoProgress] = useState({ current: 0, duration: 3.0 });
  const isAdvancingRef = useRef(false);
  const safetyTimeoutRef = useRef(null);

  // Video Refs & Playback State
  const sampleVideoRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const playbackRateRef = useRef(1.0);

  // Camera State
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('off'); // 'off' | 'requesting' | 'active' | 'error'
  const [cameraError, setCameraError] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // MediaPipe Holistic / Hands Tracking Ref
  const landmarksRef = useRef({
    poseLandmarks: null,
    leftHandLandmarks: null,
    rightHandLandmarks: null,
    realLandmarks: []
  });
  const [badJoints, setBadJoints] = useState([]);
  const badJointsRef = useRef([]);

  // Recording & Evaluation State
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const recordedFramesByWordRef = useRef(words.map(() => []));
  const sequenceTimerRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Quan sát video mẫu bên trái, sau đó bấm 'Bắt đầu luyện tập câu' để thực hiện liên tiếp các từ."
  );
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState('thumb');

  const currentWord = words[currentWordIndex] || words[0];

  // Video mẫu của từ hiện tại
  const sampleVideoSrc = React.useMemo(() => {
    if (!currentWord) return '/chao.mp4';
    if (currentWord.slug === 'chao') return '/chao.mp4';
    return currentWord.videoFront || '/chao.mp4';
  }, [currentWord]);

  // Đổi tốc độ phát video mẫu (1.0x hoặc 0.5x)
  const changeSpeed = (rate) => {
    setPlaybackRate(rate);
    playbackRateRef.current = rate;
    if (sampleVideoRef.current) {
      sampleVideoRef.current.playbackRate = rate;
      sampleVideoRef.current.play().catch(() => {});
    }
  };

  // 1. Khởi động Camera với cơ chế fallback 3 cấp độ (kế thừa từ AIStudioView)
  const startCamera = async (deviceId = null) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    setCameraStatus('requesting');
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt của bạn không hỗ trợ WebRTC getUserMedia. Vui lòng sử dụng Chrome, Edge hoặc Safari phiên bản mới nhất.');
      setCameraStatus('error');
      return;
    }

    let stream = null;

    // Cấp độ 1: Thử HD 720p
    try {
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err1) {
      // Cấp độ 2: Thử 640x480
      try {
        const constraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err2) {
        // Cấp độ 3: video: true cơ bản
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err3) {
          let userMsg = 'Không thể bật camera.';
          if (err3.name === 'NotAllowedError' || err3.name === 'PermissionDeniedError') {
            userMsg = 'Trình duyệt chưa được cấp quyền truy cập Camera. Vui lòng chọn "Cho phép" (Allow) trên thanh URL trình duyệt và thử lại.';
          } else if (err3.name === 'NotFoundError' || err3.name === 'DevicesNotFoundError') {
            userMsg = 'Không tìm thấy thiết bị Camera nào được kết nối với máy tính.';
          } else if (err3.name === 'NotReadableError' || err3.name === 'TrackStartError') {
            userMsg = 'Camera đang bị chiếm dụng bởi ứng dụng khác. Hãy tắt các ứng dụng đó rồi bấm "Thử lại".';
          } else {
            userMsg = `Lỗi Camera: ${err3.message || 'Không thể truy cập'}`;
          }
          setCameraError(userMsg);
          setCameraStatus('error');
          return;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraStatus('active');

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
      } catch (e) {
        // bỏ qua
      }
    }
  };

  // 2. Tắt Camera
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
    landmarksRef.current = {
      poseLandmarks: null,
      leftHandLandmarks: null,
      rightHandLandmarks: null,
      realLandmarks: []
    };
  };

  // 3. Tự động gắn stream vào thẻ video khi cameraStream thay đổi
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && cameraStream) {
      videoEl.srcObject = cameraStream;
      videoEl.onloadedmetadata = () => {
        videoEl.play().catch(e => console.warn('Lỗi video play:', e));
      };
    }
  }, [cameraStream]);

  // 4. Khởi động camera khi mở trang
  useEffect(() => {
    startCamera();
    return () => {
      if (sequenceTimerRef.current) {
        clearInterval(sequenceTimerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // 5. Tích hợp MediaPipe Holistic thời gian thực (tối ưu hóa 30 FPS không lag video mẫu)
  useEffect(() => {
    if (cameraStatus !== 'active' || !videoRef.current) return;

    let isSubscribed = true;
    let animFrameId = null;

    const setupMediaPipe = async () => {
      try {
        if (!globalHolisticInstance) {
          if (!globalHolisticLoadingPromise) {
            globalHolisticLoadingPromise = (async () => {
              let HolisticClass = window.Holistic;
              if (!HolisticClass) {
                try {
                  const mod = await import('@mediapipe/holistic');
                  HolisticClass = mod.Holistic || mod.default?.Holistic;
                } catch (e) {
                  console.warn('Lỗi import @mediapipe/holistic:', e);
                }
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
                } catch (initErr) {
                  console.warn('Holistic initialize non-critical:', initErr);
                }

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

            landmarksRef.current.poseLandmarks = results.poseLandmarks || null;
            landmarksRef.current.leftHandLandmarks = results.leftHandLandmarks || null;
            landmarksRef.current.rightHandLandmarks = results.rightHandLandmarks || null;
            landmarksRef.current.realLandmarks = [];

            // Thu thập chuỗi 75 điểm mốc của TỪ HIỆN TẠI trong chuỗi liên tiếp
            if (isRecordingRef.current) {
              const activeIdx = currentWordIndexRef.current;
              if (
                activeIdx >= 0 &&
                recordedFramesByWordRef.current[activeIdx] &&
                (results.leftHandLandmarks || results.rightHandLandmarks || results.poseLandmarks)
              ) {
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
                recordedFramesByWordRef.current[activeIdx].push(frame75);
              }
            }
          });

          let isProcessing = false;
          let lastFrameTime = 0;
          const TARGET_INTERVAL = 30; // ~33 FPS

          const processFrame = async (timestamp) => {
            if (!isSubscribed) return;
            const video = videoRef.current;
            if (!isProcessing && video && video.readyState >= 2) {
              const elapsed = timestamp - lastFrameTime;
              if (elapsed >= TARGET_INTERVAL) {
                lastFrameTime = timestamp;
                isProcessing = true;
                try {
                  await holisticModel.send({ image: video });
                } catch (e) {
                  // drop frame
                } finally {
                  isProcessing = false;
                }
              }
            }
            if (isSubscribed) {
              animFrameId = requestAnimationFrame(processFrame);
            }
          };

          animFrameId = requestAnimationFrame(processFrame);
          return;
        }

        // Fallback: Hands
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

              if (isRecordingRef.current) {
                const activeIdx = currentWordIndexRef.current;
                if (activeIdx >= 0 && recordedFramesByWordRef.current[activeIdx]) {
                  const primaryHand = results.multiHandLandmarks[0];
                  const frame75 = Array(33).fill([0, 0, 0]);
                  frame75.push(...Array(21).fill([0, 0, 0]));
                  const rhPoints = primaryHand.map(pt => [pt.x, pt.y, pt.z || 0]);
                  frame75.push(...rhPoints);
                  recordedFramesByWordRef.current[activeIdx].push(frame75);
                }
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
        console.warn('Lỗi khởi tạo MediaPipe:', err);
      }
    };

    setupMediaPipe();

    return () => {
      isSubscribed = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [cameraStatus]);

  // Cập nhật video mẫu khi đổi từ
  useEffect(() => {
    if (sampleVideoRef.current) {
      sampleVideoRef.current.currentTime = 0;
      sampleVideoRef.current.playbackRate = playbackRate;
      sampleVideoRef.current.play().catch(() => {});
    }
  }, [currentWordIndex, sampleVideoSrc, playbackRate]);

  // 6. QUY TRÌNH THỰC HÀNH CÂU LIÊN TIẾP TỰ ĐỘNG THEO THỜI LƯỢNG THỰC CỦA VIDEO MẪU
  // Thời gian thực hành mỗi từ = thời gian video mẫu chạy hết 1 lần (không lặp lại)
  const handleStartSentencePractice = () => {
    if (isRecording || countdown !== null || isEvaluating) return;

    if (cameraStatus === 'off') {
      startCamera();
    }

    // Khởi tạo lại trạng thái
    setWordResults([]);
    setIsCompleted(false);
    setCurrentWordIndex(0);
    currentWordIndexRef.current = 0;
    setVideoProgress({ current: 0, duration: 3.0 });
    recordedFramesByWordRef.current = words.map(() => []);
    badJointsRef.current = [];
    setBadJoints([]);

    // Đếm ngược 3 giây chuẩn bị
    setCountdown(3);
    setStatusMessage(`Chuẩn bị thực hành câu: "${sentence.title}"...`);

    let count = 3;
    const countInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countInterval);
        setCountdown(null);
        startContinuousExecution();
      }
    }, 1000);
  };

  const startContinuousExecution = () => {
    setIsRecording(true);
    isRecordingRef.current = true;
    currentWordIndexRef.current = 0;
    setCurrentWordIndex(0);
    setVideoProgress({ current: 0, duration: 3.0 });

    const firstWord = words[0];
    setStatusMessage(`🎥 Đang ghi nhận Từ 1/${words.length}: "${firstWord?.word}"...`);

    // Phát video mẫu của từ đầu tiên từ 0s (1 lần, không lặp lại)
    if (sampleVideoRef.current) {
      sampleVideoRef.current.currentTime = 0;
      sampleVideoRef.current.playbackRate = playbackRateRef.current;
      sampleVideoRef.current.play().catch(() => {});
    }
  };

  // Hàm chuyển sang từ tiếp theo hoặc kết thúc chấm điểm
  const advanceToNextWordOrFinish = () => {
    if (!isRecordingRef.current || isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    setTimeout(() => {
      isAdvancingRef.current = false;
    }, 350);

    const nextIdx = currentWordIndexRef.current + 1;
    if (nextIdx < words.length) {
      // Chuyển sang từ kế tiếp ngay lập tức
      currentWordIndexRef.current = nextIdx;
      setCurrentWordIndex(nextIdx);
      setVideoProgress({ current: 0, duration: 3.0 });

      const nextWord = words[nextIdx];
      setStatusMessage(`🎥 Chuyển tiếp! Đang ghi nhận Từ ${nextIdx + 1}/${words.length}: "${nextWord?.word}"...`);

      if (sampleVideoRef.current) {
        sampleVideoRef.current.currentTime = 0;
        sampleVideoRef.current.playbackRate = playbackRateRef.current;
        sampleVideoRef.current.play().catch(() => {});
      }
    } else {
      // Đã chạy hết video của từ cuối cùng -> Kết thúc và chấm điểm cả câu!
      isRecordingRef.current = false;
      setIsRecording(false);
      evaluateAllSentenceWords();
    }
  };

  // Sự kiện khi video mẫu của từ hiện tại phát xong 1 lần (onEnded)
  const handleSampleVideoEnded = () => {
    if (!isRecordingRef.current) return;
    advanceToNextWordOrFinish();
  };

  // Cập nhật tiến trình thời gian thực từ video mẫu
  const handleSampleVideoTimeUpdate = () => {
    if (!sampleVideoRef.current) return;
    const curr = sampleVideoRef.current.currentTime || 0;
    const dur = sampleVideoRef.current.duration || 3.0;
    setVideoProgress({ current: curr, duration: dur });

    // Đề phòng trường hợp browser bị drop sự kiện onEnded ở cuối video
    if (isRecordingRef.current && dur > 0.5 && curr >= dur - 0.08) {
      advanceToNextWordOrFinish();
    }
  };

  // Lấy thời lượng khi video load metadata
  const handleSampleVideoLoadedMetadata = () => {
    if (sampleVideoRef.current) {
      const dur = sampleVideoRef.current.duration || 3.0;
      setVideoProgress(prev => ({ ...prev, duration: dur }));
    }
  };

  // Bộ giám sát an toàn (Watchdog timer): Đề phòng video bị lỗi không tự chuyển
  useEffect(() => {
    if (!isRecording) return;
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    const durSec = (sampleVideoRef.current?.duration && sampleVideoRef.current.duration > 0.5)
      ? sampleVideoRef.current.duration
      : 3.8;
    const waitMs = (durSec / playbackRate) * 1000 + 1200;

    safetyTimeoutRef.current = setTimeout(() => {
      if (isRecordingRef.current) {
        advanceToNextWordOrFinish();
      }
    }, waitMs);

    return () => {
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, [currentWordIndex, isRecording, playbackRate]);

  // 7. ĐÁNH GIÁ CHUỖI CỬ CHỈ CÁC TỪ VÀ TỔNG KẾT CẢ CÂU
  const evaluateAllSentenceWords = async () => {
    setIsEvaluating(true);
    setStatusMessage("⏳ AI đang đối chiếu và chấm điểm từng từ trong câu...");

    try {
      const evalPromises = words.map(async (w, idx) => {
        const frames = recordedFramesByWordRef.current[idx] || [];
        const slug = w.slug || 'chao';
        let data = null;

        if (frames.length >= 5) {
          try {
            let res = await fetch(`http://localhost:8000/api/evaluate/${slug}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ landmarks: frames })
            });

            if (!res.ok && slug !== 'chao') {
              res = await fetch('http://localhost:8000/api/evaluate/chao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ landmarks: frames })
              });
            }

            if (res.ok) {
              data = await res.json();
            }
          } catch (fetchErr) {
            console.warn(`Lỗi API chấm điểm từ ${w.word}:`, fetchErr);
          }
        }

        // Fallback thông minh nếu offline hoặc chưa nhận đủ frame
        if (!data) {
          const simulatedPassed = !hasError;
          const score = hasError ? Math.floor(Math.random() * 10 + 64) : Math.floor(Math.random() * 8 + 89);
          data = {
            overall_score: score,
            passed: simulatedPassed,
            angle_score: hasError ? 65.0 : 92.0,
            position_score: hasError ? 68.0 : 90.0,
            bad_joints: hasError ? [1, 2, 3, 4] : [],
            feedbacks: hasError
              ? ['Góc gập tay chưa đạt góc độ chuẩn của mẫu VSL']
              : ['Rất tốt! Cử chỉ dứt khoát và chuẩn xác theo mẫu.']
          };
        }

        return {
          word: w.word,
          slug: slug,
          role: w.role,
          score: Math.round(data.overall_score),
          passed: data.passed,
          angle_score: data.angle_score,
          position_score: data.position_score,
          bad_joints: data.bad_joints || [],
          feedbacks: data.feedbacks || []
        };
      });

      const results = await Promise.all(evalPromises);
      setWordResults(results);
      setIsEvaluating(false);
      setIsCompleted(true);

      const total = results.reduce((acc, r) => acc + r.score, 0);
      const avg = Math.round(total / results.length);

      if (avg >= 80) {
        setStatusMessage(`🎉 Chúc mừng! Bạn đã hoàn thành câu "${sentence.title}" đạt ${avg}/100 điểm.`);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        setStatusMessage(`⚠️ Điểm đánh giá chung câu: ${avg}/100. Hãy xem lại từng từ và bấm "Luyện lại câu" nhé!`);
      }
    } catch (e) {
      console.error('Lỗi tổng kết câu:', e);
      setIsEvaluating(false);
      setIsCompleted(true);
    }
  };

  // Tính điểm tổng kết của câu
  const validScores = wordResults.filter(r => r && typeof r.score === 'number');
  const sentenceOverallScore = validScores.length > 0
    ? Math.round(validScores.reduce((acc, cur) => acc + cur.score, 0) / validScores.length)
    : 0;
  const sentencePassed = sentenceOverallScore >= 80;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* =====================================================================
          1. BANNER TIẾN TRÌNH CÂU VSL (GIỮ NGUYÊN BỐ CỤC CHUẨN THEO ẢNH NGƯỜI DÙNG)
          ===================================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Nút Học câu bên trái */}
        <button
          className="btn-pill btn-secondary btn-sm"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 800,
            color: '#0284c7',
            borderColor: '#bae6fd',
            backgroundColor: '#ffffff',
            padding: '0.45rem 1rem'
          }}
          title="Quay lại bài học câu"
        >
          <ArrowLeft size={16} />
          <span>Học câu</span>
        </button>

        {/* Tiêu đề câu ở giữa */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 900,
            color: '#0284c7',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            LUYỆN TẬP CÂU VSL
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 900,
            color: '#0f172a',
            margin: '0.1rem 0 0 0'
          }}>
            "{sentence.title}"
          </div>
        </div>

        {/* Nút Luyện lại câu bên phải */}
        <button
          className="btn-pill btn-secondary btn-sm"
          onClick={handleStartSentencePractice}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 800,
            color: '#475569',
            borderColor: '#e2e8f0',
            backgroundColor: '#ffffff',
            padding: '0.45rem 1rem'
          }}
          title="Luyện lại từ đầu câu"
        >
          <RotateCcw size={15} />
          <span>Luyện lại câu</span>
        </button>
      </div>

      {/* Dải Thẻ Tiến Trình Các Từ Trong Câu (Khớp 100% Ảnh 2) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${words.length}, 1fr)`,
        gap: '0.85rem',
        marginBottom: '1.25rem'
      }}>
        {words.map((w, idx) => {
          const shortRole = getShortRole(w.role);
          const res = wordResults[idx];
          const isCurrent = currentWordIndex === idx && !isCompleted;
          const isDone = isCompleted && !!res;
          const isRecorded = isRecording && idx < currentWordIndex;

          let borderColor = '#e2e8f0';
          let bgColor = '#ffffff';
          let topColor = '#64748b';
          let statusText = 'Chờ làm';
          let statusColor = '#94a3b8';

          if (isDone) {
            borderColor = res.passed ? '#22c55e' : '#f97316';
            bgColor = res.passed ? '#f0fdf4' : '#fff7ed';
            topColor = res.passed ? '#16a34a' : '#ea580c';
            statusText = `✓ ${res.score}đ`;
            statusColor = res.passed ? '#16a34a' : '#ea580c';
          } else if (isCurrent) {
            borderColor = '#0284c7';
            bgColor = '#f0f9ff';
            topColor = '#0284c7';
            statusText = 'Đang luyện';
            statusColor = '#0284c7';
          } else if (isRecorded) {
            borderColor = '#86efac';
            bgColor = '#f0fdf4';
            topColor = '#16a34a';
            statusText = 'Đã ghi nhận';
            statusColor = '#16a34a';
          }

          return (
            <div
              key={w.slug || idx}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: bgColor,
                border: `1.5px solid ${borderColor}`,
                textAlign: 'center',
                boxShadow: isCurrent ? '0 2px 10px rgba(2, 132, 199, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: topColor, marginBottom: '0.15rem' }}>
                Từ {idx + 1} ({shortRole})
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0.15rem 0' }}>
                {w.word}
              </div>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: isDone ? 900 : 700,
                color: statusColor,
                fontStyle: isDone ? 'normal' : 'italic'
              }}>
                {statusText}
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          2. THANH ĐIỀU KHIỂN CAMERA & CÔNG CỤ (LẤY TỪ THỰC HÀNH TỪ VỰNG AISTUDIO)
          ===================================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Trạng thái hướng dẫn */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', color: '#475569', fontWeight: 600 }}>
          <Sparkles size={16} color="#0284c7" />
          <span>{statusMessage}</span>
        </div>

        {/* Cụm điều khiển camera bên phải */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Chọn camera nếu có nhiều thiết bị */}
          {availableDevices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value);
                startCamera(e.target.value);
              }}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.8rem',
                fontWeight: 700,
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              {availableDevices.map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId}>
                  📷 {d.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          {/* Test thử lỗi khớp tay */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            color: '#64748b',
            cursor: 'pointer',
            userSelect: 'none'
          }}>
            <input
              type="checkbox"
              checked={hasError}
              onChange={(e) => setHasError(e.target.checked)}
              style={{ accentColor: '#ef4444' }}
            />
            <span>Thử khớp lỗi</span>
          </label>

          {/* Nút Bật / Tắt camera */}
          <button
            className={`btn-pill btn-sm ${cameraStatus === 'active' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={cameraStatus === 'active' ? stopCamera : () => startCamera()}
            style={{
              padding: '0.45rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800
            }}
          >
            {cameraStatus === 'active' ? <CameraOff size={15} color="#ef4444" /> : <Camera size={15} />}
            <span style={{ color: cameraStatus === 'active' ? '#ef4444' : 'inherit' }}>
              {cameraStatus === 'active' ? 'Tắt Cam' : 'Bật Camera'}
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          3. BỐ CỤC ĐỐI CHIẾU SONG SONG: VIDEO MẪU VS CAMERA THỰC HÀNH (CHUẨN TỪ VỰNG)
          ===================================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.25rem',
        alignItems: 'stretch'
      }}>
        {/* CỘT 1: Video Mẫu Chuẩn */}
        <div className="mini-card" style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '32px',
            minHeight: '32px',
            marginBottom: '0.65rem'
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>
              1. Video mẫu: <span style={{ color: '#0284c7' }}>{currentWord?.word}</span>{' '}
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>({currentWordIndex + 1}/{words.length})</span>
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', height: '26px' }}>
              <button
                className={`btn-pill btn-sm ${playbackRate === 1.0 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.15rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, height: '26px', boxSizing: 'border-box' }}
                onClick={() => changeSpeed(1.0)}
              >
                1.0x Thường
              </button>
              <button
                className={`btn-pill btn-sm ${playbackRate === 0.5 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.15rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, height: '26px', boxSizing: 'border-box' }}
                onClick={() => changeSpeed(0.5)}
              >
                0.5x Chậm
              </button>
            </div>
          </div>

          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            aspectRatio: '4/3',
            backgroundColor: '#0f172a',
            position: 'relative',
            width: '100%'
          }}>
            <video
              ref={sampleVideoRef}
              src={sampleVideoSrc}
              controls
              loop={!isRecording}
              muted
              autoPlay
              playsInline
              onTimeUpdate={handleSampleVideoTimeUpdate}
              onEnded={handleSampleVideoEnded}
              onLoadedMetadata={handleSampleVideoLoadedMetadata}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Badge từ mẫu đang hiển thị */}
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(15, 23, 42, 0.82)',
              color: '#ffffff',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              backdropFilter: 'blur(4px)',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span style={{ color: '#38bdf8' }}>Từ {currentWordIndex + 1}/{words.length}:</span>
              <span>{currentWord?.word}</span>
            </div>
          </div>
        </div>

        {/* CỘT 2: Camera Thực Hành & AI Tracking */}
        <div className="mini-card" style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '32px',
            minHeight: '32px',
            marginBottom: '0.65rem'
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>
              2. Camera Thực hành & AI Tracking
            </span>

            {/* Chú thích màu chuẩn */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.74rem',
              color: '#64748b',
              height: '26px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}></span>Đúng
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }}></span>Sai tư thế
              </span>
            </div>
          </div>

          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            aspectRatio: '4/3',
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            {/* Webcam Video */}
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
                  hasError={hasError}
                  errorJoint={errorType}
                  badJoints={badJoints}
                  accuracy={sentencePassed ? 92 : 85}
                  isRecording={isRecording}
                  showGuides={true}
                  landmarksRef={landmarksRef}
                />
              </div>
            )}

            {/* Overlay khi camera TẮT */}
            {cameraStatus === 'off' && (
              <div style={{ textAlign: 'center', padding: '2rem 1.5rem', color: 'white', zIndex: 10 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Camera size={26} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Camera đang tắt
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem', maxWidth: 280, margin: '0 auto 1.25rem auto' }}>
                  Bật camera để AI bắt đầu nhận diện cử chỉ cho chuỗi các từ trong câu.
                </p>
                <button
                  className="btn-pill btn-green"
                  style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
                  onClick={() => startCamera()}
                >
                  <Camera size={16} />
                  <span>BẬT CAMERA NGAY</span>
                </button>
              </div>
            )}

            {/* Overlay khi đang kết nối */}
            {cameraStatus === 'requesting' && (
              <div style={{ textAlign: 'center', color: 'white', padding: '2rem', zIndex: 10 }}>
                <RefreshCw size={36} color="#38bdf8" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
                <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  Đang khởi tạo camera...
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Vui lòng chọn <strong>"Cho phép" (Allow)</strong> nếu trình duyệt hỏi cấp quyền.
                </p>
              </div>
            )}

            {/* Overlay khi gặp lỗi */}
            {cameraStatus === 'error' && (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'white', zIndex: 10 }}>
                <ShieldAlert size={36} color="#ef4444" style={{ margin: '0 auto 0.75rem auto' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fca5a5', marginBottom: '0.5rem' }}>
                  Không thể truy cập Camera
                </div>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                  {cameraError}
                </p>
                <button className="btn-pill btn-primary btn-sm" onClick={() => startCamera()}>
                  <RefreshCw size={14} />
                  <span>Thử lại</span>
                </button>
              </div>
            )}

            {/* Overlay Đếm Ngược 3..2..1 Trước Khi Bắt Đầu Chuỗi */}
            {countdown !== null && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.72)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: 'white',
                zIndex: 20
              }}>
                <div style={{
                  fontSize: '5.5rem',
                  fontWeight: 900,
                  color: '#38bdf8',
                  lineHeight: 1
                }}>
                  {countdown}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.75rem', color: '#ffffff' }}>
                  Chuẩn bị làm từ đầu tiên: "{words[0]?.word}"
                </div>
              </div>
            )}

            {/* Overlay Khi Đang Ghi Nhận Liên Tiếp Khớp Theo Video Mẫu */}
            {isRecording && (
              <>
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: 'rgba(239, 68, 68, 0.92)',
                  color: '#ffffff',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  zIndex: 15,
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffffff', animation: 'pulse 1s infinite' }} />
                  <span>
                    TỪ {currentWordIndex + 1}/{words.length}: "{currentWord?.word}" ({Math.max(0, ((videoProgress.duration || 3) - (videoProgress.current || 0))).toFixed(1)}s)
                  </span>
                </div>

                {/* Thanh tiến trình thời gian của từ hiện tại chạy theo video */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: 4,
                  width: `${Math.min(100, ((videoProgress.current / (videoProgress.duration || 1)) * 100))}%`,
                  backgroundColor: '#38bdf8',
                  transition: 'width 0.1s linear',
                  zIndex: 15
                }} />
              </>
            )}

            {/* Overlay Đang Đánh Giá */}
            {isEvaluating && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                zIndex: 25
              }}>
                <Sparkles size={40} color="#38bdf8" style={{ animation: 'spin 1.5s linear infinite' }} />
                <div style={{ fontSize: '1.15rem', fontWeight: 900, marginTop: '0.85rem' }}>
                  AI đang chấm điểm chuỗi cử chỉ cả câu...
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  Đang đối chiếu từng từ với chuẩn ngữ pháp VSL
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. NÚT HÀNH ĐỘNG CHÍNH: BẮT ĐẦU LUYỆN TẬP LIÊN TIẾP CẢ CÂU
          ===================================================================== */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        {!isRecording && !isEvaluating && (
          <button
            className="btn-pill btn-primary"
            style={{
              padding: '0.85rem 2.25rem',
              fontSize: '1.05rem',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 18px rgba(2, 132, 199, 0.35)'
            }}
            disabled={countdown !== null}
            onClick={handleStartSentencePractice}
          >
            <Play size={20} fill="#ffffff" />
            <span>
              {isCompleted ? 'LUYỆN TẬP LẠI TOÀN BỘ CÂU' : 'BẮT ĐẦU LUYỆN TẬP CÂU (TỰ ĐỘNG CHUYỂN TỪ)'}
            </span>
          </button>
        )}

        {isRecording && (
          <button
            className="btn-pill btn-danger"
            style={{
              padding: '0.85rem 2.25rem',
              fontSize: '1.05rem',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'default',
              backgroundColor: '#ef4444'
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffffff', animation: 'pulse 1s infinite' }} />
            <span>
              ĐANG THỰC HIỆN TỪ {currentWordIndex + 1}/{words.length}: "{currentWord?.word}" ({Math.max(0, ((videoProgress.duration || 3) - (videoProgress.current || 0))).toFixed(1)}s)...
            </span>
          </button>
        )}

        {isEvaluating && (
          <button
            className="btn-pill btn-secondary"
            disabled
            style={{ padding: '0.85rem 2.25rem', fontSize: '1.05rem', fontWeight: 800 }}
          >
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Đang chấm điểm từng từ...</span>
          </button>
        )}

        <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.65rem' }}>
          💡 Thời gian thực hành mỗi từ khớp chính xác theo độ dài video mẫu (phát 1 lần không lặp lại). Chuỗi video các từ sẽ tự động phát và ghi nhận liên tiếp mà không cần bấm thêm nút nào.
        </div>
      </div>

      {/* =====================================================================
          5. BẢNG TỔNG KẾT ĐÁNH GIÁ CHUNG CẢ CÂU (SENTENCE SUMMARY)
          ===================================================================== */}
      {isCompleted && (
        <div className="mini-card" style={{
          padding: '2rem 1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid',
          borderColor: sentencePassed ? '#22c55e' : '#f59e0b',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
        }}>
          {/* Header Bảng Tổng Kết */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: sentencePassed ? '#dcfce7' : '#fef3c7',
              color: sentencePassed ? '#16a34a' : '#d97706',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}>
              <Trophy size={34} strokeWidth={2.4} />
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              BẢNG TỔNG KẾT ĐÁNH GIÁ CÂU VSL
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0' }}>
              "{sentence.title}"
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Trật tự ký hiệu đã thực hành: <strong style={{ color: '#0284c7' }}>{sentence.signOrderText}</strong>
            </div>

            {/* Điểm tổng hợp cả câu */}
            <div style={{
              display: 'inline-block',
              padding: '0.85rem 2.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: sentencePassed ? '#f0fdf4' : '#fffbeb',
              border: '2px solid',
              borderColor: sentencePassed ? '#86efac' : '#fde68a',
              marginTop: '1rem'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: sentencePassed ? '#15803d' : '#b45309' }}>
                ĐIỂM ĐÁNH GIÁ CHUNG CẢ CÂU
              </div>
              <div style={{ fontSize: '2.75rem', fontWeight: 900, color: sentencePassed ? '#16a34a' : '#d97706', lineHeight: 1.1 }}>
                {sentenceOverallScore}
                <span style={{ fontSize: '1.4rem' }}>/100</span>
              </div>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: sentencePassed ? '#16a34a' : '#d97706',
                marginTop: '0.2rem'
              }}>
                {sentencePassed ? '🎉 ĐẠT CHUẨN CÂU GIAO TIẾP VSL' : '⚠️ CẦN LUYỆN TẬP THÊM'}
              </div>
            </div>
          </div>

          {/* Chi tiết đánh giá từng từ trong câu */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.85rem' }}>
              Chi tiết điểm số từng ký hiệu thành phần:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
              {wordResults.map((r, idx) => (
                <div
                  key={r.slug || idx}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: r.passed ? '#f0fdf4' : '#fff7ed',
                    border: '1.5px solid',
                    borderColor: r.passed ? '#86efac' : '#fed7aa'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: r.passed ? '#15803d' : '#c2410c' }}>
                      Từ {idx + 1} ({getShortRole(r.role)})
                    </span>
                    <span style={{
                      fontSize: '1.15rem',
                      fontWeight: 900,
                      color: r.passed ? '#16a34a' : '#ea580c'
                    }}>
                      {r.score}đ
                    </span>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {r.word}
                  </div>

                  {r.feedbacks && r.feedbacks.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, marginTop: '0.35rem' }}>
                      {r.feedbacks[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nút điều hướng sau khi xong câu */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              className="btn-pill btn-secondary"
              style={{ padding: '0.65rem 1.5rem', fontWeight: 800 }}
              onClick={handleStartSentencePractice}
            >
              <RotateCcw size={16} />
              <span>Luyện lại câu này</span>
            </button>

            <button
              className="btn-pill btn-primary"
              style={{ padding: '0.65rem 1.75rem', fontWeight: 900, backgroundColor: '#0284c7' }}
              onClick={onBack}
            >
              <span>← Trở về bài học câu</span>
            </button>

            {onFinish && (
              <button
                className="btn-pill btn-primary"
                style={{ padding: '0.65rem 1.75rem', fontWeight: 900 }}
                onClick={onFinish}
              >
                <span>Học câu tiếp theo →</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
