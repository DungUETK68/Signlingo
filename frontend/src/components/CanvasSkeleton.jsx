import React, { useEffect, useRef } from 'react';

/**
 * CanvasSkeleton: Vẽ lưới xương MediaPipe 2D/3D
 * - Upper body Pose (11, 12, 13, 14, 15, 16)
 * - Hands (21 landmarks mỗi bàn tay)
 * - Hỗ trợ đổi màu khớp xương chuẩn xác: Xanh lá (#10b981) nếu đúng, Đỏ rực (#ef4444) nếu lỗi (badJoints)
 * - Hiệu ứng quét radar khi đang thu thập dữ liệu (isRecording)
 */
export default function CanvasSkeleton({ 
  width = 640, 
  height = 480, 
  hasError = false, 
  errorJoint = 'thumb', // 'thumb' | 'wrist' | 'elbow'
  badJoints = [],       // Mảng các index khớp bị lỗi từ backend AI (ví dụ: [1, 2, 3, 4])
  accuracy = 92,
  isRecording = false,
  showGuides = true,
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
    const ctx = canvas.getContext('2d');
    let animationId;
    let frame = 0;

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

    // Tính danh sách các khớp bị đánh dấu lỗi
    let effectiveBadJoints = [...(badJoints || [])];
    if (hasError) {
      if (errorJoint === 'thumb') effectiveBadJoints.push(1, 2, 3, 4);
      if (errorJoint === 'wrist') effectiveBadJoints.push(0);
      if (errorJoint === 'elbow') effectiveBadJoints.push(13, 14);
    }
    const badJointSet = new Set(effectiveBadJoints);

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const t = frame * 0.05;
      const sway = Math.sin(t) * 3;

      // 1. Vẽ khung căn chỉnh hướng dẫn vị trí đứng/ngồi
      if (showGuides) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);

        // Vùng đầu & vai
        ctx.beginPath();
        ctx.ellipse(width / 2, height * 0.25, width * 0.13, height * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Khung căn chỉnh nửa thân trên & bàn tay
        ctx.strokeRect(width * 0.14, height * 0.12, width * 0.72, height * 0.82);
        ctx.restore();
      }

      // Lấy dữ liệu landmarks từ ref mới nhất
      const currentData = landmarksRef?.current || internalDataRef.current;
      const curPose = currentData.poseLandmarks;
      const curLeftHand = currentData.leftHandLandmarks;
      const curRightHand = currentData.rightHandLandmarks;
      const curReal = currentData.realLandmarks;

      // Xác định xem có dữ liệu Holistic hay Hands thực tế không
      const hasHolisticHands = !!(curLeftHand || curRightHand);
      const hasRealHands = curReal && curReal.length > 0;
      const hasAnyRealData = hasHolisticHands || hasRealHands || !!curPose;

      if (hasAnyRealData) {
        // 2. Vẽ thân trên nếu có poseLandmarks từ Holistic
        if (curPose && curPose.length >= 17) {
          ctx.save();
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';

          POSE_UPPER_CONNECTIONS.forEach(([sIdx, eIdx]) => {
            const p1 = curPose[sIdx];
            const p2 = curPose[eIdx];
            if (p1 && p2 && (p1.visibility === undefined || p1.visibility > 0.4)) {
              ctx.beginPath();
              ctx.moveTo(p1.x * width, p1.y * height);
              ctx.lineTo(p2.x * width, p2.y * height);
              ctx.stroke();
            }
          });

          // Vẽ điểm các khớp vai, khuỷu, cổ tay
          [11, 12, 13, 14, 15, 16].forEach(idx => {
            const pt = curPose[idx];
            if (pt && (pt.visibility === undefined || pt.visibility > 0.4)) {
              ctx.beginPath();
              ctx.arc(pt.x * width, pt.y * height, 4.5, 0, Math.PI * 2);
              ctx.fillStyle = '#38bdf8';
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          });
          ctx.restore();
        }

        // 3. Hàm vẽ bàn tay chuẩn MediaPipe với hiệu ứng Đỏ (lỗi) / Xanh (đúng)
        const drawHandLandmarks = (hand) => {
          if (!hand || hand.length === 0) return;

          // Vẽ xương nối (Bones)
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
            const p1 = hand[startIdx];
            const p2 = hand[endIdx];
            if (!p1 || !p2) return;

            const isBad = badJointSet.has(startIdx) || badJointSet.has(endIdx);
            ctx.strokeStyle = isBad ? '#ef4444' : '#10b981';

            ctx.beginPath();
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
            ctx.stroke();
          });

          // Vẽ điểm mốc (Joints)
          hand.forEach((lm, idx) => {
            if (!lm) return;
            const x = lm.x * width;
            const y = lm.y * height;
            const isBad = badJointSet.has(idx);

            ctx.beginPath();
            ctx.arc(x, y, isBad ? 6 : [4, 8, 12, 16, 20].includes(idx) ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = isBad ? '#ef4444' : '#22c55e';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Hiệu ứng sóng radar đỏ nhấp nháy tại khớp lỗi
            if (isBad) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(x, y, 9 + Math.sin(frame * 0.25) * 4, 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
              ctx.lineWidth = 1.8;
              ctx.stroke();
              ctx.restore();
            }
          });
        };

        if (curLeftHand) drawHandLandmarks(curLeftHand);
        if (curRightHand) drawHandLandmarks(curRightHand);

        // Fallback realLandmarks từ hands thông thường nếu không dùng holistic hands
        if (!hasHolisticHands && curReal) {
          curReal.forEach(hand => drawHandLandmarks(hand));
        }

      } else {
        // 4. Khi chưa phát hiện bàn tay hoặc chưa vào vị trí: Vẽ skeleton mockup mượt mà
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

        // Bàn tay mockup
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

      // 5. Nếu đang trong phiên ghi hình AI -> Hiệu ứng sóng radar quét xanh công nghệ
      if (isRecording) {
        ctx.save();
        const scanY = (frame * 5) % height;
        const grad = ctx.createLinearGradient(0, scanY - 35, 0, scanY + 35);
        grad.addColorStop(0, 'rgba(2, 132, 199, 0)');
        grad.addColorStop(0.5, 'rgba(2, 132, 199, 0.28)');
        grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 35, width, 70);

        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height, hasError, errorJoint, badJoints, accuracy, isRecording, showGuides]);

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
