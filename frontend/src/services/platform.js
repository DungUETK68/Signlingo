import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const DEFAULT_PRODUCTION_SERVER = 'https://signlingo.id.vn';
const CUSTOM_SERVER_STORAGE_KEY = 'signlingo_mobile_server_url';

/**
 * Kiểm tra xem ứng dụng có đang chạy dưới dạng ứng dụng di động Native (Android/iOS) hay không
 */
export function isNativePlatform() {
  try {
    return Capacitor.isNativePlatform();
  } catch (e) {
    return false;
  }
}

/**
 * Lấy tên nền tảng hiện tại: 'android' | 'ios' | 'web'
 */
export function getPlatform() {
  try {
    return Capacitor.getPlatform();
  } catch (e) {
    return 'web';
  }
}

/**
 * Chuẩn hóa URL origin (bỏ dấu gạch chéo ở cuối)
 */
function normalizeOrigin(url) {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/\/+$/, '');
}

/**
 * Lấy địa chỉ máy chủ Backend gốc:
 * - Trên Web: trả về '' để giữ nguyên đường dẫn tương đối (/api, /ai, /vsl400_videos/...)
 * - Trên Mobile Native (Android/iOS): ưu tiên cấu hình custom -> biến môi trường -> https://signlingo.id.vn
 */
export function getServerOrigin() {
  if (!isNativePlatform()) {
    return '';
  }

  try {
    const custom = localStorage.getItem(CUSTOM_SERVER_STORAGE_KEY);
    if (custom && /^https?:\/\//i.test(custom.trim())) {
      return normalizeOrigin(custom);
    }
  } catch (e) {
    // Bỏ qua lỗi đọc localStorage
  }

  const envOrigin = import.meta.env.VITE_SERVER_ORIGIN;
  if (envOrigin && /^https?:\/\//i.test(envOrigin.trim())) {
    return normalizeOrigin(envOrigin);
  }

  return DEFAULT_PRODUCTION_SERVER;
}

/**
 * Cho phép ghi đè máy chủ kiểm thử cục bộ trên thiết bị Android (VD: http://192.168.1.10)
 * Truyền chuỗi rỗng hoặc null để quay về Production mặc định (https://signlingo.id.vn)
 */
export function setCustomServerOrigin(url) {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(CUSTOM_SERVER_STORAGE_KEY);
    } else {
      localStorage.setItem(CUSTOM_SERVER_STORAGE_KEY, normalizeOrigin(url));
    }
  } catch (e) {
    console.warn('Không thể lưu cấu hình máy chủ di động:', e);
  }
}

/**
 * Tự động chuyển đổi đường dẫn video/ảnh tĩnh (/vsl400_videos/..., /uploads/...)
 * sang URL đầy đủ của máy chủ khi chạy trên ứng dụng Android Native.
 * Trên Web: giữ nguyên 100% đường dẫn gốc.
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Giữ nguyên các URL tuyệt đối, blob preview cục bộ hoặc data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  if (isNativePlatform()) {
    const origin = getServerOrigin();
    if (
      origin &&
      (trimmed.startsWith('/vsl400_videos/') ||
        trimmed.startsWith('/uploads/') ||
        trimmed.startsWith('vsl400_videos/') ||
        trimmed.startsWith('uploads/'))
    ) {
      const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      return `${origin}${normalizedPath}`;
    }
  }

  return trimmed;
}

/**
 * Lấy đường dẫn video chuẩn theo 3 góc quay (Chính diện, Nghiêng trái, Nghiêng phải)
 * Dùng chung cho tất cả các màn hình có phát video mẫu VSL
 */
export function resolveAngleVideoUrl(
  wordObj,
  angle = 'front',
  fallbackUrl = '/vsl400_videos/cam_on_front.mp4'
) {
  const frontRaw =
    wordObj?.videoFront ||
    wordObj?.videoUrl ||
    wordObj?.video ||
    (wordObj?.slug ? `/vsl400_videos/${wordObj.slug}_front.mp4` : '') ||
    fallbackUrl;

  if (angle === 'left') {
    const leftRaw =
      wordObj?.videoLeft ||
      (wordObj?.videoSide && wordObj.videoSide.includes('_left') ? wordObj.videoSide : '') ||
      (frontRaw && frontRaw.includes('_front.mp4')
        ? frontRaw.replace('_front.mp4', '_left.mp4')
        : '') ||
      (wordObj?.slug ? `/vsl400_videos/${wordObj.slug}_left.mp4` : '') ||
      wordObj?.videoSide ||
      frontRaw;
    return resolveMediaUrl(leftRaw);
  }

  if (angle === 'right') {
    const rightRaw =
      wordObj?.videoRight ||
      (frontRaw && frontRaw.includes('_front.mp4')
        ? frontRaw.replace('_front.mp4', '_right.mp4')
        : '') ||
      (wordObj?.slug ? `/vsl400_videos/${wordObj.slug}_right.mp4` : '') ||
      frontRaw;
    return resolveMediaUrl(rightRaw);
  }

  return resolveMediaUrl(frontRaw);
}

/**
 * Khởi tạo giao diện Native Android (StatusBar, SplashScreen, class CSS safe-area)
 */
export async function initNativeMobileUI() {
  if (!isNativePlatform()) return;

  try {
    const platform = getPlatform();
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('native-mobile-app', `platform-${platform}`);
      document.body.classList.add('native-mobile-app', `platform-${platform}`);
    }

    // Đồng bộ thanh trạng thái (Status Bar) nền sáng, chữ/biểu tượng tối
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      await StatusBar.setStyle({ style: Style.Light });
    } catch (sbErr) {
      console.warn('StatusBar setup notice:', sbErr);
    }

    // Ẩn màn hình chờ (Splash Screen) mượt mà sau khi React mount
    try {
      setTimeout(() => {
        SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {});
      }, 250);
    } catch (spErr) {
      console.warn('SplashScreen hide notice:', spErr);
    }
  } catch (err) {
    console.warn('initNativeMobileUI notice:', err);
  }
}

/**
 * Đăng ký xử lý nút Back vật lý / cử chỉ vuốt quay lại trên Android
 * @param {Function} callback Hàm xử lý khi người dùng bấm nút Back
 * @returns {Function} Hàm hủy đăng ký listener
 */
export function registerAndroidBackButton(callback) {
  if (!isNativePlatform()) {
    return () => {};
  }

  let listenerHandle = null;
  let isDisposed = false;

  CapacitorApp.addListener('backButton', (event) => {
    if (!isDisposed && typeof callback === 'function') {
      callback(event);
    }
  })
    .then((handle) => {
      if (isDisposed) {
        handle.remove().catch(() => {});
      } else {
        listenerHandle = handle;
      }
    })
    .catch((err) => {
      console.warn('Không thể đăng ký sự kiện Back Android:', err);
    });

  return () => {
    isDisposed = true;
    if (listenerHandle) {
      listenerHandle.remove().catch(() => {});
    }
  };
}

/**
 * Thoát ứng dụng Android an toàn
 */
export function exitNativeApp() {
  if (!isNativePlatform()) return;
  try {
    CapacitorApp.exitApp();
  } catch (e) {
    console.warn('Không thể thoát ứng dụng:', e);
  }
}
