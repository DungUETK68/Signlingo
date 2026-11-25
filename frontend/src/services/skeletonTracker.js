/**
 * skeletonTracker.js
 * Quản lý Singleton Model nhận diện khung xương MediaPipe Holistic toàn cục
 * - Khởi động và làm ấm (Preload & Warm-up) ngay khi người dùng vừa truy cập
 * - Tái sử dụng 1 mô hình duy nhất trong RAM cho: Luyện tập từ vựng, Luyện tập câu, Thử thách 5 giây
 * - Tối ưu hóa chuyên sâu cho thiết bị di động Android/Mobile:
 *   1. Downscale khung hình camera xuống offscreen canvas 256x192 trước khi đưa vào MediaPipe (nhanh gấp 3-4 lần, không mất độ chính xác vì Holistic Lite cũng xử lý ở 256x256)
 *   2. Chống xử lý trùng lặp frame (kiểm tra video.currentTime)
 *   3. Tinh chỉnh ngưỡng tracking tối ưu để giữ chế độ tracking mượt thay vì rơi về re-detection nặng khi tay di chuyển nhanh
 */

import { isNativePlatform } from './platform';

let holisticInstance = null;
let holisticPromise = null;
let isWarmedUp = false;

// Trạng thái vòng lặp xử lý khung hình camera dùng chung
let activeVideo = null;
let animFrameId = null;
let isProcessingFrame = false;
let lastFrameTimestamp = 0;
let lastVideoTime = -1;
let inferenceCanvas = null;
let inferenceCtx = null;
const subscribers = new Set();

function isMobileOptimizedMode() {
  if (isNativePlatform()) return true;
  if (typeof window !== 'undefined' && window.innerWidth <= 768) return true;
  if (typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')) {
    return true;
  }
  return false;
}

/**
 * Chuẩn bị nguồn ảnh đầu vào tối ưu cho MediaPipe:
 * Trên Mobile/Android: vẽ thu nhỏ video camera sang canvas 256x192 để giảm 8x-10x khối lượng pixel truyền vào WebGL/WASM
 */
function getInferenceInput(videoEl, useMobileDownscale) {
  if (!useMobileDownscale || typeof document === 'undefined') {
    return videoEl;
  }

  const vw = videoEl.videoWidth || 480;
  const vh = videoEl.videoHeight || 360;
  // Giới hạn cạnh dài nhất ở 256px (cả camera dọc 192x256 lẫn ngang 256x192) -> chỉ ~49k pixel/frame
  const maxDim = 256;
  const scale = maxDim / Math.max(vw, vh, 1);
  const targetW = Math.max(128, Math.round(vw * scale));
  const targetH = Math.max(128, Math.round(vh * scale));

  if (!inferenceCanvas) {
    inferenceCanvas = document.createElement('canvas');
    inferenceCtx = inferenceCanvas.getContext('2d', { alpha: false });
  }
  if (inferenceCanvas.width !== targetW || inferenceCanvas.height !== targetH) {
    inferenceCanvas.width = targetW;
    inferenceCanvas.height = targetH;
  }

  if (inferenceCtx) {
    inferenceCtx.imageSmoothingEnabled = true;
    inferenceCtx.imageSmoothingQuality = 'low';
    inferenceCtx.drawImage(videoEl, 0, 0, targetW, targetH);
    return inferenceCanvas;
  }

  return videoEl;
}

/**
 * Tải class Holistic từ window hoặc dynamic import
 */
async function loadHolisticClass() {
  if (typeof window !== 'undefined' && window.Holistic) {
    return window.Holistic;
  }
  try {
    const mod = await import('@mediapipe/holistic');
    return mod.Holistic || mod.default?.Holistic || window.Holistic;
  } catch (err) {
    console.warn('Không thể dynamic import @mediapipe/holistic:', err);
    return window.Holistic || null;
  }
}

/**
 * Khởi động và làm ấm (warm-up) mô hình nhận diện khung xương
 * Gọi hàm này ngay khi website/app vừa load (trong App.jsx)
 */
export function preloadSkeletonTracker() {
  if (holisticInstance) {
    return Promise.resolve(holisticInstance);
  }
  if (holisticPromise) {
    return holisticPromise;
  }

  holisticPromise = (async () => {
    try {
      const mobileMode = isMobileOptimizedMode();
      console.log(`⏳ [Signlingo AI] Đang khởi động MediaPipe Holistic (mode: ${mobileMode ? 'Mobile Turbo' : 'Desktop'})...`);
      const HolisticClass = await loadHolisticClass();
      if (!HolisticClass) {
        console.warn('⚠️ [Signlingo AI] Chưa tải được thư viện Holistic.');
        return null;
      }

      const instance = new HolisticClass({
        locateFile: (file) => {
          // Ưu tiên nạp từ tài nguyên nội bộ (same-origin, 0 lỗi CORS)
          return `/mediapipe/holistic/${file}`;
        }
      });

      instance.setOptions({
        modelComplexity: 0, // Lite: Nhẹ hơn 3 lần, nạp siêu tốc, chạy mượt trên điện thoại
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        refineFaceLandmarks: false,
        // Trên mobile hạ nhẹ ngưỡng tracking để tránh rớt sang re-detection nặng khi vung tay nhanh
        minDetectionConfidence: mobileMode ? 0.45 : 0.5,
        minTrackingConfidence: mobileMode ? 0.4 : 0.5,
      });

      // Gắn lắng nghe kết quả nhận diện cho các subscriber
      instance.onResults((results) => {
        subscribers.forEach((cb) => {
          try {
            cb(results);
          } catch (e) {
            console.error('Lỗi khi gọi subscriber callback:', e);
          }
        });
      });

      try {
        await instance.initialize();
      } catch (initErr) {
        console.warn('Initialize non-critical:', initErr);
      }

      // ⚡ SILENT WARM-UP: Gửi 1 frame giả lập trong bộ nhớ để WebAssembly & WebGL biên dịch trước shaders
      try {
        if (typeof document !== 'undefined') {
          const warmupCanvas = document.createElement('canvas');
          warmupCanvas.width = 128;
          warmupCanvas.height = 128;
          const ctx = warmupCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 128, 128);
            await instance.send({ image: warmupCanvas });
          }
        }
      } catch (warmupErr) {
        console.warn('Warmup non-critical:', warmupErr);
      }

      holisticInstance = instance;
      isWarmedUp = true;
      console.log('✅ [Signlingo AI] Nhận diện khung xương đã sẵn sàng 100% trong RAM!');
      return instance;
    } catch (err) {
      console.error('❌ [Signlingo AI] Lỗi khởi động MediaPipe Holistic:', err);
      holisticPromise = null;
      return null;
    }
  })();

  return holisticPromise;
}

/**
 * Kiểm tra trạng thái mô hình
 */
export function isSkeletonReady() {
  return isWarmedUp && !!holisticInstance;
}

/**
 * Gắn kết Camera đang hoạt động vào bộ nhận diện khung xương chung
 * @param {HTMLVideoElement} videoElement Thẻ video của camera
 * @param {Function} callback Hàm nhận kết quả results
 * @returns {Function} Hàm hủy đăng ký camera khi rời component
 */
export async function startSkeletonTracking(videoElement, callback) {
  if (callback) {
    subscribers.add(callback);
  }
  activeVideo = videoElement;
  lastVideoTime = -1;

  // Lấy hoặc chờ instance hoàn tất nạp
  const model = await preloadSkeletonTracker();
  if (!model) return () => stopSkeletonTracking(callback);

  const mobileMode = isMobileOptimizedMode();
  const minIntervalMs = mobileMode ? 16 : 30;

  // Khởi động vòng lặp xử lý requestAnimationFrame dùng chung nếu chưa chạy
  if (!animFrameId) {
    const processFrame = async (timestamp) => {
      if (subscribers.size === 0 || !activeVideo) {
        animFrameId = null;
        return;
      }

      if (!isProcessingFrame && activeVideo && activeVideo.readyState >= 2) {
        const curVideoTime = activeVideo.currentTime;
        const isNewFrame = curVideoTime !== lastVideoTime;

        if (isNewFrame && timestamp - lastFrameTimestamp >= minIntervalMs) {
          lastFrameTimestamp = timestamp;
          lastVideoTime = curVideoTime;
          isProcessingFrame = true;
          try {
            const inputFrame = getInferenceInput(activeVideo, mobileMode);
            await model.send({ image: inputFrame });
          } catch (e) {
            // Bỏ qua lỗi drop frame lẻ tẻ
          } finally {
            isProcessingFrame = false;
          }
        }
      }

      if (subscribers.size > 0 && activeVideo) {
        animFrameId = requestAnimationFrame(processFrame);
      } else {
        animFrameId = null;
      }
    };

    animFrameId = requestAnimationFrame(processFrame);
  }

  return () => stopSkeletonTracking(callback);
}

/**
 * Hủy đăng ký callback camera từ component
 */
export function stopSkeletonTracking(callback) {
  if (callback) {
    subscribers.delete(callback);
  }
  if (subscribers.size === 0) {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    isProcessingFrame = false;
    activeVideo = null;
    lastVideoTime = -1;
  }
}

/**
 * Trích xuất chuẩn 75 điểm mốc (33 Pose + 21 Trái + 21 Phải) cho Backend AI chấm điểm
 * @param {Object} results Kết quả từ MediaPipe Holistic
 * @returns {Array<[x, y, z]>|null} Mảng 75 tọa độ
 */
export function extract75Landmarks(results) {
  if (!results) return null;
  const { poseLandmarks, leftHandLandmarks, rightHandLandmarks } = results;
  if (!poseLandmarks && !leftHandLandmarks && !rightHandLandmarks) return null;

  const frame75 = [];
  // 33 pose landmarks
  for (let i = 0; i < 33; i++) {
    const lm = poseLandmarks ? poseLandmarks[i] : null;
    frame75.push(lm ? [lm.x, lm.y, lm.z] : [0, 0, 0]);
  }
  // 21 left hand landmarks
  for (let i = 0; i < 21; i++) {
    const lm = leftHandLandmarks ? leftHandLandmarks[i] : null;
    frame75.push(lm ? [lm.x, lm.y, lm.z] : [0, 0, 0]);
  }
  // 21 right hand landmarks
  for (let i = 0; i < 21; i++) {
    const lm = rightHandLandmarks ? rightHandLandmarks[i] : null;
    frame75.push(lm ? [lm.x, lm.y, lm.z] : [0, 0, 0]);
  }
  return frame75;
}
