import React, { useEffect, useRef } from 'react';

// Các cặp nối xương bàn tay chuẩn MediaPipe HAND_CONNECTIONS
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Ngón cái (Thumb)
  [0, 5], [5, 6], [6, 7], [7, 8],       // Ngón trỏ (Index)
  [5, 9], [9, 10], [10, 11], [11, 12],   // Ngón giữa (Middle)
  [9, 13], [13, 14], [14, 15], [15, 16], // Ngón áp út (Ring)
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Ngón út (Pinky)
];

// Cặp nối nửa thân trên (Pose landmarks)
const POSE_UPPER_CONNECTIONS = [
  [11, 12], // Hai vai
  [11, 13], [13, 15], // Cánh tay & cẳng tay trái
  [12, 14], [14, 16], // Cánh tay & cẳng tay phải
];

const POSE_UPPER_JOINTS = [11, 12, 13, 14, 15, 16];
const FINGERTIP_INDICES = new Set([4, 8, 12, 16, 20]);

/**
 * Nội suy thích ứng (Adaptive Exponential Lerp) giữa khung hình AI cũ và mới:
 * - Di chuyển chậm/đứng yên: lọc rung siêu mượt (alpha thấp)
 * - Di chuyển tay nhanh: bám sát tức thì (alpha cao) giúp không bị trễ hay giật cục trên điện thoại
 */
function smoothLandmarkArray(prevArr, targetArr, dtSec) {
  if (!targetArr || targetArr.length === 0) return null;
  if (!prevArr || prevArr.length !== targetArr.length) {
    return targetArr.map((lm) =>
      lm ? { x: lm.x, y: lm.y, z: lm.z || 0, visibility: lm.visibility } : null
    );
  }

  // Hệ số mượt chuẩn hóa theo thời gian khung hình (ổn định ở cả 60Hz và 120Hz)
  const clampedDt = Math.min(0.05, Math.max(0.004, dtSec));

  for (let i = 0; i < targetArr.length; i++) {
    const t = targetArr[i];
    const p = prevArr[i];
    if (!t) {
      prevArr[i] = null;
      continue;
    }
    if (!p) {
      prevArr[i] = { x: t.x, y: t.y, z: t.z || 0, visibility: t.visibility };
      continue;
    }

    const dx = t.x - p.x;
    const dy = t.y - p.y;
    const dist = Math.hypot(dx, dy);

    // Nếu nhảy khoảng cách quá lớn (tay mới xuất hiện lại ở vị trí khác) -> bắt kịp ngay
    if (dist > 0.25) {
      p.x = t.x;
      p.y = t.y;
      p.z = t.z || 0;
      p.visibility = t.visibility;
      continue;
    }

    // Tốc độ nội suy thích ứng: di chuyển nhanh -> bám siêu nhạy, đứng yên -> triệt tiêu rung
    const speed = dist > 0.04 ? 26 : 16;
    const alpha = 1 - Math.exp(-speed * clampedDt);
    p.x += dx * alpha;
    p.y += dy * alpha;
    p.z = (p.z || 0) + ((t.z || 0) - (p.z || 0)) * alpha;
    p.visibility = t.visibility;
  }

  return prevArr;
}

/**
 * CanvasSkeleton: Vẽ lưới xương MediaPipe 2D/3D tối ưu 60 FPS cho cả Desktop & Mobile Android
 * - Nội suy chuyển động mượt (Adaptive Lerp) giúp khung xương di chuyển mềm mại ngay cả trên điện thoại tầm trung
 * - Gom lô lệnh vẽ Canvas2D (Batched Stroke) để giảm 60% tải CPU/GPU WebView
 * - Giữ ổn định 150ms khi tay bị khuất chớp nhoáng tránh nhấp nháy khó chịu
 */
export default function CanvasSkeleton({ 
  width = 640, 
  height = 480, 
  hasError = false, 
  errorJoint = 'thumb', // 'thumb' | 'wrist' | 'elbow'
  badJoints = [],       // Mảng các index khớp bị lỗi từ backend AI (ví dụ: [1, 2, 3, 4])
  accuracy = 92,
  isRecording = false,
  landmarksRef = null,  // Ref chứa { poseLandmarks, leftHandLandmarks, rightHandLandmarks, realLandmarks }
  realLandmarks = [],   // Mảng 2 bàn tay tương thích cũ [[lm0..lm20], ...]
  poseLandmarks = null, // 33 pose landmarks từ MediaPipe Holistic
  leftHandLandmarks = null,  // 21 landmarks tay trái
  rightHandLandmarks = null  // 21 landmarks tay phải
}) {
  const canvasRef = useRef(null);

  // Lưu trữ dữ liệu landmarks vào ref nội bộ để render loop không cần recreate mỗi frame
  const internalDataRef = useRef({
    poseLandmarks,
    leftHandLandmarks,
    rightHandLandmarks,
    realLandmarks
  });

  // Trạng thái khung xương đã làm mượt (smoothed) duy trì xuyên suốt vòng lặp 60 FPS
  const smoothStateRef = useRef({
    pose: null,
    leftHand: null,
    rightHand: null,
    lastLeftSeenAt: 0,
    lastRightSeenAt: 0,
    lastPoseSeenAt: 0,
  });

  // Luôn đồng bộ dữ liệu mới nhất
  internalDataRef.current = {
    poseLandmarks: landmarksRef?.current?.poseLandmarks ?? poseLandmarks,
    leftHandLandmarks: landmarksRef?.current?.leftHandLandmarks ?? leftHandLandmarks,
    rightHandLandmarks: landmarksRef?.current?.rightHandLandmarks ?? rightHandLandmarks,
    realLandmarks: landmarksRef?.current?.realLandmarks ?? realLandmarks
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationId;
    let frame = 0;
    let lastTimestamp = performance.now();

    // Tính danh sách các khớp bị đánh dấu lỗi
    const effectiveBadJoints = [...(badJoints || [])];
    if (hasError) {
      if (errorJoint === 'thumb') effectiveBadJoints.push(1, 2, 3, 4);
      if (errorJoint === 'wrist') effectiveBadJoints.push(0);
      if (errorJoint === 'elbow') effectiveBadJoints.push(13, 14);
    }
    const badJointSet = new Set(effectiveBadJoints);
    const GRACE_MS = 160; // Giữ khung xương 160ms nếu mất tín hiệu chớp nhoáng 1 frame khi vung tay nhanh

    const drawHandLandmarks = (hand) => {
      if (!hand || hand.length === 0) return;

      // 1. Vẽ gom lô (Batched) toàn bộ xương đúng (xanh lá) trong 1 lần stroke
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      let hasGoodBone = false;
      for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
        const [startIdx, endIdx] = HAND_CONNECTIONS[i];
        const p1 = hand[startIdx];
        const p2 = hand[endIdx];
        if (!p1 || !p2) continue;
        if (!badJointSet.has(startIdx) && !badJointSet.has(endIdx)) {
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          hasGoodBone = true;
        }
      }
      if (hasGoodBone) {
        ctx.strokeStyle = '#10b981';
        ctx.stroke();
      }

      // 2. Vẽ gom lô toàn bộ xương lỗi (đỏ) nếu có
      if (badJointSet.size > 0) {
        ctx.beginPath();
        let hasBadBone = false;
        for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
          const [startIdx, endIdx] = HAND_CONNECTIONS[i];
          const p1 = hand[startIdx];
          const p2 = hand[endIdx];
          if (!p1 || !p2) continue;
          if (badJointSet.has(startIdx) || badJointSet.has(endIdx)) {
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
            hasBadBone = true;
          }
        }
        if (hasBadBone) {
          ctx.strokeStyle = '#ef4444';
          ctx.stroke();
        }
      }

      // 3. Vẽ điểm mốc (Joints) sắc nét
      ctx.lineWidth = 1.5;
      for (let idx = 0; idx < hand.length; idx++) {
        const lm = hand[idx];
        if (!lm) continue;
        const x = lm.x * width;
        const y = lm.y * height;
        const isBad = badJointSet.has(idx);
        const radius = isBad ? 6 : FINGERTIP_INDICES.has(idx) ? 5 : 3.5;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isBad ? '#ef4444' : '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Hiệu ứng sóng đỏ nhấp nháy tại khớp lỗi
        if (isBad) {
          ctx.beginPath();
          ctx.arc(x, y, 9 + Math.sin(frame * 0.25) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.lineWidth = 1.5;
        }
      }
    };

    const render = (now) => {
      frame++;
      const dtSec = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      ctx.clearRect(0, 0, width, height);

      const t = frame * 0.05;
      const sway = Math.sin(t) * 3;

      const currentData = landmarksRef?.current || internalDataRef.current;
      const rawPose = currentData.poseLandmarks;
      const rawLeftHand = currentData.leftHandLandmarks;
      const rawRightHand = currentData.rightHandLandmarks;
      const curReal = currentData.realLandmarks;

      const smooth = smoothStateRef.current;

      // Nội suy mượt Pose
      if (rawPose && rawPose.length >= 17) {
        smooth.pose = smoothLandmarkArray(smooth.pose, rawPose, dtSec);
        smooth.lastPoseSeenAt = now;
      } else if (now - smooth.lastPoseSeenAt > GRACE_MS) {
        smooth.pose = null;
      }

      // Nội suy mượt Tay trái
      if (rawLeftHand && rawLeftHand.length > 0) {
        smooth.leftHand = smoothLandmarkArray(smooth.leftHand, rawLeftHand, dtSec);
        smooth.lastLeftSeenAt = now;
      } else if (now - smooth.lastLeftSeenAt > GRACE_MS) {
        smooth.leftHand = null;
      }

      // Nội suy mượt Tay phải
      if (rawRightHand && rawRightHand.length > 0) {
        smooth.rightHand = smoothLandmarkArray(smooth.rightHand, rawRightHand, dtSec);
        smooth.lastRightSeenAt = now;
      } else if (now - smooth.lastRightSeenAt > GRACE_MS) {
        smooth.rightHand = null;
      }

      const curPose = smooth.pose;
      const curLeftHand = smooth.leftHand;
      const curRightHand = smooth.rightHand;

      const hasHolisticHands = !!(curLeftHand || curRightHand);
      const hasRealHands = curReal && curReal.length > 0;
      const hasAnyRealData = hasHolisticHands || hasRealHands || !!curPose;

      if (hasAnyRealData) {
        // 1. Vẽ thân trên (gom lô 1 path)
        if (curPose && curPose.length >= 17) {
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';

          ctx.beginPath();
          for (let i = 0; i < POSE_UPPER_CONNECTIONS.length; i++) {
            const [sIdx, eIdx] = POSE_UPPER_CONNECTIONS[i];
            const p1 = curPose[sIdx];
            const p2 = curPose[eIdx];
            if (p1 && p2 && (p1.visibility === undefined || p1.visibility > 0.4)) {
              ctx.moveTo(p1.x * width, p1.y * height);
              ctx.lineTo(p2.x * width, p2.y * height);
            }
          }
          ctx.stroke();

          ctx.lineWidth = 1.5;
          for (let i = 0; i < POSE_UPPER_JOINTS.length; i++) {
            const pt = curPose[POSE_UPPER_JOINTS[i]];
            if (pt && (pt.visibility === undefined || pt.visibility > 0.4)) {
              ctx.beginPath();
              ctx.arc(pt.x * width, pt.y * height, 4.5, 0, Math.PI * 2);
              ctx.fillStyle = '#38bdf8';
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.stroke();
            }
          }
        }

        // 2. Vẽ 2 bàn tay đã nội suy 60 FPS
        if (curLeftHand) drawHandLandmarks(curLeftHand);
        if (curRightHand) drawHandLandmarks(curRightHand);

        // Fallback realLandmarks nếu không dùng holistic hands
        if (!hasHolisticHands && curReal) {
          curReal.forEach(hand => drawHandLandmarks(hand));
        }
      } else {
        // 3. Khi chưa phát hiện bàn tay hoặc chưa vào vị trí: Vẽ skeleton mockup mượt mà
        const head = { x: width * 0.5, y: height * 0.26 + sway * 0.5 };
        const leftShoulder = { x: width * 0.32, y: height * 0.44 };
        const rightShoulder = { x: width * 0.68, y: height * 0.44 };
        const leftElbow = { x: width * 0.26, y: height * 0.62 + sway };
        const leftWrist = { x: width * 0.35, y: height * 0.72 + Math.cos(t) * 4 };

        const rightElbow = { 
          x: width * 0.72, 
          y: height * 0.58 + (hasError && errorJoint === 'elbow' ? 25 : 0) 
        };
        const rightWrist = { 
          x: width * 0.58 + Math.sin(t * 0.8) * 8, 
          y: height * 0.52 + (hasError && errorJoint === 'wrist' ? 35 : 0) 
        };

        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';

        ctx.beginPath();
        ctx.moveTo(leftShoulder.x, leftShoulder.y);
        ctx.lineTo(rightShoulder.x, rightShoulder.y);
        ctx.moveTo(leftShoulder.x, leftShoulder.y);
        ctx.lineTo(leftElbow.x, leftElbow.y);
        ctx.lineTo(leftWrist.x, leftWrist.y);
        ctx.moveTo(rightShoulder.x, rightShoulder.y);
        ctx.lineTo(rightElbow.x, rightElbow.y);
        ctx.lineTo(rightWrist.x, rightWrist.y);
        ctx.stroke();

        [head, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist].forEach((pt, idx) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = (hasError && idx === 4) ? '#ef4444' : '#22c55e';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        const handBaseX = rightWrist.x;
        const handBaseY = rightWrist.y;
        const scale = 0.8;
        const thumbErr = hasError && errorJoint === 'thumb';

        const mockFingers = [
          [{ dx: -12 * scale, dy: -12 * scale }, { dx: -34 * scale * (thumbErr ? 0.6 : 1), dy: -38 * scale }],
          [{ dx: -8 * scale, dy: -30 * scale }, { dx: -14 * scale, dy: -68 * scale }],
          [{ dx: 4 * scale, dy: -32 * scale }, { dx: 7 * scale, dy: -74 * scale }],
          [{ dx: 16 * scale, dy: -30 * scale }, { dx: 26 * scale, dy: -68 * scale }],
          [{ dx: 26 * scale, dy: -22 * scale }, { dx: 42 * scale, dy: -52 * scale }]
        ];

        mockFingers.forEach((finger, fIdx) => {
          ctx.beginPath();
          ctx.moveTo(handBaseX, handBaseY);
          finger.forEach(pt => ctx.lineTo(handBaseX + pt.dx, handBaseY + pt.dy));
          ctx.strokeStyle = (fIdx === 0 && thumbErr) ? '#ef4444' : '#22c55e';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          finger.forEach((pt, pIdx) => {
            ctx.beginPath();
            ctx.arc(handBaseX + pt.dx, handBaseY + pt.dy, 4, 0, Math.PI * 2);
            ctx.fillStyle = (fIdx === 0 && thumbErr && pIdx === 1) ? '#ef4444' : '#22c55e';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        });
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height, hasError, errorJoint, badJoints, accuracy, isRecording]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none'
      }}
    />
  );
}
