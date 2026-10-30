import json
import os
import sys
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def extract_75_landmarks(res):
    """Thu thập 33 điểm Pose + 21 điểm Tay trái + 21 điểm Tay phải = (75, 3)"""
    pose = np.zeros((33, 3), dtype=np.float32)
    lh = np.zeros((21, 3), dtype=np.float32)
    rh = np.zeros((21, 3), dtype=np.float32)

    if res.pose_landmarks:
        for i, lm in enumerate(res.pose_landmarks):
            pose[i] = [lm.x, lm.y, lm.z]
    if res.left_hand_landmarks:
        for i, lm in enumerate(res.left_hand_landmarks):
            lh[i] = [lm.x, lm.y, lm.z]
    if res.right_hand_landmarks:
        for i, lm in enumerate(res.right_hand_landmarks):
            rh[i] = [lm.x, lm.y, lm.z]

    return np.vstack([pose, lh, rh])  # Shape: (75, 3)


def normalize_spatial(sequence):
    """Chuẩn hóa tọa độ không gian theo trung điểm hai vai (Pose 11, 12)
    và chia tỷ lệ theo khoảng cách hai vai (d_shoulder)
    """
    norm_seq = np.zeros_like(sequence)
    for t in range(sequence.shape[0]):
        frame = sequence[t]
        left_shoulder, right_shoulder = frame[11], frame[12]
        p_center = (left_shoulder + right_shoulder) / 2.0
        d_shoulder = np.linalg.norm(left_shoulder - right_shoulder)
        if d_shoulder < 1e-6:
            d_shoulder = 1.0

        # Chỉ chuẩn hóa các điểm phát hiện được (khác 0)
        mask = np.any(frame != 0, axis=1)
        norm_seq[t, mask] = (frame[mask] - p_center) / d_shoulder
    return norm_seq


def build_benchmark(video_path="chao.mp4"):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "holistic_landmarker.task")
    if not os.path.exists(model_path):
        print(f"❌ Không tìm thấy model {model_path}")
        return False

    with open(model_path, "rb") as f:
        model_data = f.read()

    base_options = python.BaseOptions(model_asset_buffer=model_data)
    options = vision.HolisticLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE
    )
    detector = vision.HolisticLandmarker.create_from_options(options)

    if not os.path.isabs(video_path):
        video_path = os.path.join(current_dir, video_path)

    if not os.path.exists(video_path):
        print(f"❌ Không tìm thấy file '{video_path}' trong thư mục backend!")
        return False

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    frames_lm = []
    left_hand_count = 0
    right_hand_count = 0

    print(f"[*] Dang trich xuat khung xuong tu video '{video_path}'...")
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        res = detector.detect(mp_img)

        has_lh = res.left_hand_landmarks is not None and len(res.left_hand_landmarks) > 0
        has_rh = res.right_hand_landmarks is not None and len(res.right_hand_landmarks) > 0

        # Lưu khung hình có ít nhất 1 bàn tay
        if has_lh or has_rh:
            if has_lh:
                left_hand_count += 1
            if has_rh:
                right_hand_count += 1
            frames_lm.append(extract_75_landmarks(res))

    cap.release()

    if len(frames_lm) < 5:
        print(f"[!] Loi: Video qua ngan hoac chi nhan dien duoc {len(frames_lm)} frames co ban tay!")
        return False

    seq = np.array(frames_lm, dtype=np.float32)
    norm_seq = normalize_spatial(seq)

    dominant_hand = "right" if right_hand_count >= left_hand_count else "left"

    models_dir = os.path.join(current_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    np.save(os.path.join(models_dir, "chao_benchmark.npy"), norm_seq)

    meta = {
        "gloss": "Chào",
        "num_active_frames": int(len(norm_seq)),
        "fps": float(fps),
        "dominant_hand": dominant_hand,
        "left_hand_frames": left_hand_count,
        "right_hand_frames": right_hand_count,
    }
    with open(os.path.join(models_dir, "chao_meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print("[+] Huan luyen khuon mau chuan thanh cong!")
    print(f"   - So khung hinh cu chi: {len(norm_seq)} frames")
    print(f"   - Tay chinh phat hien trong video: Tay {dominant_hand.upper()} (LH: {left_hand_count}, RH: {right_hand_count})")
    print("   - Da luu: models/chao_benchmark.npy va models/chao_meta.json")
    return True


if __name__ == "__main__":
    build_benchmark("chao.mp4")
