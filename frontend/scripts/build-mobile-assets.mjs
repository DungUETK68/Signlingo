import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const publicDir = path.join(frontendRoot, 'public');
const outDir = path.join(frontendRoot, 'dist-mobile');

function copyFileSafe(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️ Không tìm thấy file tĩnh: ${src}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

console.log('📱 [Signlingo Mobile] Đang biên dịch bundle Frontend tối ưu cho Android (dist-mobile)...');

execSync('npx vite build', {
  cwd: frontendRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_MOBILE_BUILD: 'true',
  },
});

// 1. Copy các ảnh/icon nhẹ từ thư mục public/ (loại trừ vsl400_videos 392MB & uploads)
const rootAssets = [
  'favicon.svg',
  'icons.svg',
  'pho.jpg',
  'sign_cam_on.jpg',
  'sign_letter_a.jpg',
  'sign_number_five.jpg',
  'sign_pho.jpg',
  'sign_xin_loi.jpg',
];

for (const file of rootAssets) {
  copyFileSafe(path.join(publicDir, file), path.join(outDir, file));
}

// 2. Copy các file MediaPipe Holistic Lite thiết yếu vào APK
// Giúp AI Tracking chạy 100% same-origin (0 lỗi CORS, 0 giây chờ mạng, không cần pose_landmark_heavy 26MB hay hands 23MB)
const mediapipeFiles = [
  'mediapipe/camera_utils/camera_utils.js',
  'mediapipe/hands/hands.js',
  'mediapipe/holistic/holistic.js',
  'mediapipe/holistic/holistic.binarypb',
  'mediapipe/holistic/holistic_solution_packed_assets.data',
  'mediapipe/holistic/holistic_solution_packed_assets_loader.js',
  'mediapipe/holistic/holistic_solution_simd_wasm_bin.data',
  'mediapipe/holistic/holistic_solution_simd_wasm_bin.js',
  'mediapipe/holistic/holistic_solution_simd_wasm_bin.wasm',
  'mediapipe/holistic/holistic_solution_wasm_bin.js',
  'mediapipe/holistic/holistic_solution_wasm_bin.wasm',
  'mediapipe/holistic/pose_landmark_lite.tflite',
];

for (const rel of mediapipeFiles) {
  copyFileSafe(path.join(publicDir, rel), path.join(outDir, rel));
}

// Tính tổng dung lượng dist-mobile
let totalBytes = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else totalBytes += fs.statSync(full).size;
  }
}
walk(outDir);

console.log(`✅ [Signlingo Mobile] Hoàn tất build dist-mobile (${(totalBytes / (1024 * 1024)).toFixed(2)} MB — đã loại trừ 392 MB video VSL400 để stream trực tiếp từ server).`);
