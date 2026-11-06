import json
import os
import shutil
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pydantic import BaseModel
from scipy.spatial.distance import euclidean
from fastdtw import fastdtw
import uvicorn

app = FastAPI(
    title="Signlingo AI Scoring Service",
    description="Backend API đánh giá cử chỉ Ngôn ngữ Ký hiệu chuẩn VSL",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Nạp khuôn mẫu chuẩn và metadata của từ "Chào" và thư viện VSL400 benchmarks
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(CURRENT_DIR, "models")
BENCHMARKS_DIR = os.path.join(MODELS_DIR, "benchmarks")

REF_SEQ = None
META = {}

def load_benchmark():
    global REF_SEQ, META
    benchmark_file = os.path.join(MODELS_DIR, "chao_benchmark.npy")
    meta_file = os.path.join(MODELS_DIR, "chao_meta.json")
    if os.path.exists(benchmark_file) and os.path.exists(meta_file):
        try:
            REF_SEQ = np.load(benchmark_file)
            with open(meta_file, "r", encoding="utf-8") as f:
                META = json.load(f)
        except Exception as e:
            print(f"Error loading {benchmark_file}: {e}")

load_benchmark()

def get_word_benchmark(word_slug: str):
    """Nạp benchmark động theo slug từ vựng VSL400"""
    clean_slug = (word_slug or "chao").lower().replace("-", "_").strip()
    
    # 1. Thử tìm trong benchmarks directory
    if os.path.exists(BENCHMARKS_DIR):
        npy_path = os.path.join(BENCHMARKS_DIR, f"{clean_slug}_benchmark.npy")
        meta_path = os.path.join(BENCHMARKS_DIR, f"{clean_slug}_meta.json")
        if os.path.exists(npy_path) and os.path.exists(meta_path):
            try:
                seq = np.load(npy_path)
                with open(meta_path, "r", encoding="utf-8") as jf:
                    meta = json.load(jf)
                return seq, meta
            except Exception as e:
                print(f"Error loading {npy_path}: {e}")

    # 2. Fallback về chao_benchmark
    global REF_SEQ, META
    if REF_SEQ is None:
        load_benchmark()
    return REF_SEQ, META

# Chuỗi xương từng ngón tay theo MediaPipe (gốc khớp nối -> đầu ngón)
FINGER_CHAINS = {
    "Ngón cái": [0, 1, 2, 3, 4],
    "Ngón trỏ": [0, 5, 6, 7, 8],
    "Ngón giữa": [0, 9, 10, 11, 12],
    "Ngón áp út": [0, 13, 14, 15, 16],
    "Ngón út": [0, 17, 18, 19, 20]
}

class EvaluateRequest(BaseModel):
    landmarks: List[List[List[float]]]  # Shape: (M_frames, 75, 3)

def normalize_spatial(sequence: np.ndarray) -> np.ndarray:
    """Chuẩn hóa tọa độ theo vai hoặc trọng tâm thân trên"""
    norm_seq = np.zeros_like(sequence)
    for t in range(sequence.shape[0]):
        frame = sequence[t]
        left_shoulder, right_shoulder = frame[11], frame[12]
        
        # Nếu phát hiện được 2 vai rõ ràng
        d_shoulder = np.linalg.norm(left_shoulder - right_shoulder)
        if d_shoulder > 0.08 and np.any(left_shoulder != 0) and np.any(right_shoulder != 0):
            p_center = (left_shoulder + right_shoulder) / 2.0
            scale = d_shoulder
        else:
            # Fallback nếu vai bị che khuất: sử dụng mũi hoặc ước tính chuẩn
            nose = frame[0]
            if np.any(nose != 0):
                p_center = nose + np.array([0.0, 0.25, 0.0], dtype=np.float32)
                scale = 0.35
            else:
                p_center = np.array([0.5, 0.5, 0.0], dtype=np.float32)
                scale = 0.35

        mask = np.any(frame != 0, axis=1)
        norm_seq[t, mask] = (frame[mask] - p_center) / scale
    return norm_seq

def extract_dominant_hand(seq: np.ndarray, hand_side: str) -> np.ndarray:
    """Lấy chuỗi 21 điểm của bàn tay (Trái: 33..54, Phải: 54..75)"""
    if hand_side == "left":
        return seq[:, 33:54, :]
    return seq[:, 54:75, :]

def get_finger_extension(hand: np.ndarray, chain: list) -> float:
    """Tính độ duỗi thẳng của ngón tay (tỷ lệ khoảng cách thẳng / độ dài các đốt)
    - 0.93 - 1.0: Ngón tay mở thẳng chuẩn (Open-B)
    - < 0.85: Ngón tay bị co gập hoặc quắp
    """
    p_mcp, p_tip = chain[1], chain[-1]
    direct = np.linalg.norm(hand[p_tip] - hand[p_mcp])
    total = sum(np.linalg.norm(hand[chain[i+1]] - hand[chain[i]]) for i in range(1, len(chain)-1))
    return float(direct / max(1e-4, total))

def count_macro_oscillations(signal: np.ndarray, min_amplitude: float = 0.08) -> int:
    """Đếm số lần đổi hướng chuyển động biên độ lớn để phát hiện hiện tượng vẫy tay lắc qua lắc lại"""
    turning_points = []
    direction = 0
    extreme_val = signal[0]
    for val in signal[1:]:
        diff = val - extreme_val
        if direction == 0:
            if abs(diff) >= min_amplitude:
                direction = 1 if diff > 0 else -1
                extreme_val = val
        elif direction == 1:
            if val > extreme_val:
                extreme_val = val
            elif extreme_val - val >= min_amplitude:
                turning_points.append(extreme_val)
                direction = -1
                extreme_val = val
        elif direction == -1:
            if val < extreme_val:
                extreme_val = val
            elif val - extreme_val >= min_amplitude:
                turning_points.append(extreme_val)
                direction = 1
                extreme_val = val
    return len(turning_points)

def detect_active_motion_range(hand_seq: np.ndarray, fps: float = 25.0):
    """
    Tự động phát hiện khoảng thời gian thực hiện cử chỉ [start_frame, end_frame].
    Dựa trên vận tốc cổ tay và chuyển động của các ngón tay.
    """
    T = len(hand_seq)
    if T < 5:
        return 0, max(0, T - 1), 0.0, round(max(0, T - 1) / max(1.0, fps), 2)

    wrist_pts = hand_seq[:, 0, :2]
    wrist_vel = np.zeros(T)
    for t in range(1, T):
        wrist_vel[t] = np.linalg.norm(wrist_pts[t] - wrist_pts[t-1])

    tip_indices = [4, 8, 12, 16, 20]
    finger_vel = np.zeros(T)
    for t in range(1, T):
        f_diff = sum(np.linalg.norm(hand_seq[t, tip] - hand_seq[t-1, tip]) for tip in tip_indices)
        finger_vel[t] = f_diff / 5.0

    motion_energy = wrist_vel * 1.5 + finger_vel
    window_size = 3
    smooth_energy = np.convolve(motion_energy, np.ones(window_size)/window_size, mode='same')

    base_thresh = float(np.mean(smooth_energy) + 0.25 * np.std(smooth_energy))
    active_thresh = max(0.012, base_thresh)

    active_frames = np.where(smooth_energy >= active_thresh)[0]
    if len(active_frames) == 0:
        valid_y = np.where(np.any(hand_seq != 0, axis=(1, 2)))[0]
        if len(valid_y) > 0:
            return int(valid_y[0]), int(valid_y[-1]), round(valid_y[0]/fps, 2), round(valid_y[-1]/fps, 2)
        return 0, T - 1, 0.0, round((T - 1)/fps, 2)

    start_frame = max(0, int(active_frames[0]) - 2)
    end_frame = min(T - 1, int(active_frames[-1]) + 2)

    start_sec = round(start_frame / fps, 2)
    end_sec = round(end_frame / fps, 2)
    return start_frame, end_frame, start_sec, end_sec

def process_evaluation(landmarks: List[List[List[float]]], word_slug: str = "chao") -> dict:
    clean_slug = (word_slug or "chao").lower().replace("-", "_").strip()
    ref_seq, meta = get_word_benchmark(clean_slug)
    word_display = meta.get("word", meta.get("gloss", clean_slug.capitalize()))
    ref_fps = float(meta.get("fps", 25.0))
    user_fps = 25.0

    usr_raw = np.array(landmarks, dtype=np.float32)
    if usr_raw.shape[0] < 5:
        return {
            "word": word_display,
            "word_slug": clean_slug,
            "overall_score": 0.0,
            "passed": False,
            "dtw_score": 0.0,
            "angle_score": 0.0,
            "position_score": 0.0,
            "user_action_start_sec": 0.0,
            "ref_action_start_sec": 0.0,
            "time_offset_sec": 0.0,
            "bad_joints": list(range(21)),
            "feedbacks": ["Chưa nhận diện đủ chuyển động tay. Hãy đưa bàn tay vào khung hình!"],
        }

    usr_seq = normalize_spatial(usr_raw)
    usr_pose = usr_seq[:, :33, :]
    T_u = len(usr_seq)

    # 1. Nhận diện tay hoạt động chính & cử động 2 tay của người học
    u_lh_valid = [t for t in range(T_u) if np.any(usr_seq[t, 33:54] != 0)]
    u_rh_valid = [t for t in range(T_u) if np.any(usr_seq[t, 54:75] != 0)]

    u_lh_disp = float(np.max([np.linalg.norm(usr_seq[t, 33, :2] - usr_seq[u_lh_valid[0], 33, :2]) for t in u_lh_valid])) if len(u_lh_valid) > 1 else 0.0
    u_rh_disp = float(np.max([np.linalg.norm(usr_seq[t, 54, :2] - usr_seq[u_rh_valid[0], 54, :2]) for t in u_rh_valid])) if len(u_rh_valid) > 1 else 0.0

    u_is_two_handed = u_lh_disp >= 0.50 and u_rh_disp >= 0.50
    u_side = "right" if u_rh_disp >= u_lh_disp else "left"
    u_hand_seq = extract_dominant_hand(usr_seq, u_side).copy()

    # Active gesture segmentation của người học
    wrists_y = u_hand_seq[:, 0, 1]
    valid_frames = np.where(np.any(u_hand_seq != 0, axis=(1, 2)))[0]
    if len(valid_frames) >= 5:
        sub_y = wrists_y[valid_frames]
        min_y = np.min(sub_y)
        max_y = np.max(sub_y)
        y_thresh = min_y + 0.60 * (max_y - min_y) if (max_y - min_y) > 0.15 else max_y + 0.1
        active_indices = [idx for idx in valid_frames if wrists_y[idx] <= y_thresh]
        if len(active_indices) < 3: active_indices = valid_frames
    else:
        active_indices = valid_frames if len(valid_frames) > 0 else list(range(T_u))

    active_u_hand = u_hand_seq[active_indices]
    active_u_pose = usr_pose[active_indices]

    # 2. Phân tích đặc trưng của khuôn mẫu chuẩn (Benchmark Reference)
    ref_norm = normalize_spatial(ref_seq)
    T_r = len(ref_norm)
    r_lh_valid = [t for t in range(T_r) if np.any(ref_norm[t, 33:54] != 0)]
    r_rh_valid = [t for t in range(T_r) if np.any(ref_norm[t, 54:75] != 0)]

    r_lh_disp = float(np.max([np.linalg.norm(ref_norm[t, 33, :2] - ref_norm[r_lh_valid[0], 33, :2]) for t in r_lh_valid])) if len(r_lh_valid) > 1 else 0.0
    r_rh_disp = float(np.max([np.linalg.norm(ref_norm[t, 54, :2] - ref_norm[r_rh_valid[0], 54, :2]) for t in r_rh_valid])) if len(r_rh_valid) > 1 else 0.0

    r_is_two_handed = r_lh_disp >= 0.70 and r_rh_disp >= 0.70
    r_side = "right" if r_rh_disp >= r_lh_disp else "left"

    r_hand_seq = extract_dominant_hand(ref_norm, r_side)
    r_wrists_y = r_hand_seq[:, 0, 1]
    r_valid_frames = np.where(np.any(r_hand_seq != 0, axis=(1, 2)))[0]
    if len(r_valid_frames) >= 5:
        r_sub_y = r_wrists_y[r_valid_frames]
        r_min_y = np.min(r_sub_y)
        r_max_y = np.max(r_sub_y)
        r_thresh_y = r_min_y + 0.60 * (r_max_y - r_min_y) if (r_max_y - r_min_y) > 0.15 else r_max_y + 0.1
        r_active_idx = [idx for idx in r_valid_frames if r_wrists_y[idx] <= r_thresh_y]
        if len(r_active_idx) < 3: r_active_idx = r_valid_frames
    else:
        r_active_idx = r_valid_frames if len(r_valid_frames) > 0 else list(range(T_r))

    active_r_hand = r_hand_seq[r_active_idx]

    # Tính thời gian bắt đầu hành động cho Tua lại so sánh (FastDTW Synchronization)
    u_start, u_end, user_action_start_sec, user_action_end_sec = detect_active_motion_range(u_hand_seq, fps=user_fps)
    r_start, r_end, ref_action_start_sec, ref_action_end_sec = detect_active_motion_range(r_hand_seq, fps=ref_fps)
    time_offset_sec = round(user_action_start_sec - ref_action_start_sec, 2)

    feedbacks = []
    bad_joints = []

    # =========================================================================
    # 3A. ĐÁNH GIÁ CHUẨN XÁC RIÊNG CHO TỪ "CHÀO" (CHẶT CHẼ HƠN THEO YÊU CẦU)
    # =========================================================================
    if clean_slug == "chao":
        finger_scores = {}
        # Đánh giá 5 ngón mở thẳng Open-B chuẩn
        for f_name, chain in FINGER_CHAINS.items():
            exts = [get_finger_extension(h, chain) for h in active_u_hand if np.any(h != 0)]
            avg_ext = float(np.mean(exts)) if exts else 0.5
            if avg_ext >= 0.93:
                sc = 90.0 + (avg_ext - 0.93) / 0.07 * 10.0
            elif avg_ext >= 0.85:
                sc = 70.0 + (avg_ext - 0.85) / 0.08 * 19.0
            elif avg_ext >= 0.72:
                sc = 50.0 + (avg_ext - 0.72) / 0.13 * 19.0
            else:
                sc = max(15.0, avg_ext / 0.72 * 48.0)
            sc = min(100.0, round(sc, 1))
            finger_scores[f_name] = sc
            if sc < 80.0:
                bad_joints.extend(chain[1:])
                feedbacks.append(f"{f_name} chưa duỗi thẳng chuẩn xác ({sc}%)")

        angle_score = round(float(np.mean(list(finger_scores.values()))), 1)

        # Cự ly chạm thái dương (chấm chặt hơn, giảm dung sai khoảng cách Euclidean)
        temple_dists = []
        for t_idx, h in enumerate(active_u_hand):
            p = active_u_pose[t_idx] if t_idx < len(active_u_pose) else np.zeros((33, 3))
            if u_side == "right":
                temple_pos = (p[5][:2] + p[8][:2]) / 2.0 if (np.any(p[5] != 0) and np.any(p[8] != 0)) else np.array([-0.25, -0.9])
            else:
                temple_pos = (p[2][:2] + p[7][:2]) / 2.0 if (np.any(p[2] != 0) and np.any(p[7] != 0)) else np.array([0.25, -0.9])

            f_dists = [float(np.linalg.norm(h[tip_i][:2] - temple_pos)) + max(0.0, float(h[tip_i][1] - (temple_pos[1] + 0.04))) * 4.0 for tip_i in [8, 12]]
            temple_dists.append(min(f_dists))

        min_temple_dist = float(np.min(temple_dists)) if temple_dists else 1.0

        # Ngưỡng Euclidean chặt chẽ:
        # <= 0.20: Chạm chuẩn sát thái dương -> 92 - 100%
        # 0.20 - 0.28: Hơi xa thái dương -> 70 - 89%
        # 0.28 - 0.42: Ở má / miệng / lệch ra ngoài -> 35 - 69%
        # > 0.42: Không chạm thái dương -> 10 - 30%
        if min_temple_dist <= 0.20:
            temple_loc_score = 92.0 + min(8.0, (0.20 - min_temple_dist) * 45.0)
        elif min_temple_dist <= 0.28:
            temple_loc_score = 70.0 + (0.28 - min_temple_dist) / 0.08 * 21.0
            feedbacks.append("Đầu ngón tay chưa chạm sát vào vùng thái dương (cần áp sát đuôi mắt/thái dương trước khi vươn ra)")
        elif min_temple_dist <= 0.42:
            temple_loc_score = 35.0 + (0.42 - min_temple_dist) / 0.14 * 34.0
            feedbacks.append("Vị trí tay đang ở vùng má/miệng hoặc lệch ra ngoài thay vì thái dương")
        else:
            temple_loc_score = max(10.0, 30.0 - (min_temple_dist - 0.42) * 40.0)
            feedbacks.append("Chưa đưa tay lên vùng thái dương (đặc trưng cốt lõi của ký hiệu 'Chào')")

        # Cự ly vươn ra ngoài dứt khoát
        peak_dist = float(np.max(temple_dists)) if temple_dists else 0.5
        stroke_range = peak_dist - min_temple_dist
        if stroke_range >= 0.26:
            stroke_score = 90.0 + min(10.0, (stroke_range - 0.26) * 40.0)
        elif stroke_range >= 0.16:
            stroke_score = 65.0 + (stroke_range - 0.16) / 0.10 * 24.0
            feedbacks.append("Động tác vươn tay ra ngoài còn hơi ngắn, hãy đưa dứt khoát hơn")
        else:
            stroke_score = 30.0
            feedbacks.append("Chưa có động tác đưa tay dứt khoát ra ngoài phía trước sau khi chạm thái dương")

        # Kiểm tra vẫy tay
        wrist_x = active_u_hand[:, 0, 0]
        oscillations = count_macro_oscillations(wrist_x, min_amplitude=0.12)
        is_waving = oscillations >= 3 and len(active_u_hand) >= 12
        if is_waving:
            feedbacks.append("Động tác đang là vẫy tay qua lại. Ký hiệu 'Chào' chạm nhẹ thái dương rồi đưa dứt khoát ra ngoài.")

        # Điểm vị trí & chuyển động: KHÔNG nhân hệ số 1.2 phóng đại để đảm bảo chấm chặt hơn
        position_score = min(100.0, round(0.50 * temple_loc_score + 0.50 * stroke_score, 1))
        overall_score = min(100.0, round(0.25 * angle_score + 0.75 * position_score, 1))
        if is_waving:
            overall_score = min(overall_score, 45.0)

    # =========================================================================
    # 3B. ĐÁNH GIÁ CÁC TỪ VỰNG KHÁC THEO ĐẶC TRƯNG CHUẨN CỦA TỪ ĐÓ
    # =========================================================================
    else:
        # 1. So khớp hình thái bàn tay (Handshape / Finger Extensions)
        finger_scores = {}
        for f_name, chain in FINGER_CHAINS.items():
            u_exts = [get_finger_extension(h, chain) for h in active_u_hand if np.any(h != 0)]
            r_exts = [get_finger_extension(h, chain) for h in active_r_hand if np.any(h != 0)]
            u_avg = float(np.mean(u_exts)) if u_exts else 0.5
            r_avg = float(np.mean(r_exts)) if r_exts else 0.85
            diff = abs(u_avg - r_avg)
            if diff <= 0.14:
                sc = 90.0 + (0.14 - diff) / 0.14 * 10.0
            elif diff <= 0.24:
                sc = 72.0 + (0.24 - diff) / 0.10 * 17.0
            elif diff <= 0.36:
                sc = 45.0 + (0.36 - diff) / 0.12 * 26.0
            else:
                sc = max(10.0, 45.0 - (diff - 0.36) * 70.0)
            sc = min(100.0, round(sc, 1))
            finger_scores[f_name] = sc
            if sc < 75.0:
                bad_joints.extend(chain[1:])
                feedbacks.append(f"{f_name} tư thế ngón tay chưa khớp mẫu từ '{word_display}' ({sc}%)")

        angle_score = round(float(np.mean(list(finger_scores.values()))), 1)

        # 2. Vị trí không gian của bàn tay (Hand Location Euclidean Distance)
        # Đồng bộ trục x nếu người học thực hiện bằng tay trái
        u_hand_eval = active_u_hand.copy()
        if u_side != r_side:
            u_hand_eval[:, :, 0] = -u_hand_eval[:, :, 0]

        u_loc = np.mean(u_hand_eval[:, 0, :2], axis=0) if len(u_hand_eval) > 0 else np.array([0.0, 0.0])
        r_loc = np.mean(active_r_hand[:, 0, :2], axis=0) if len(active_r_hand) > 0 else np.array([0.0, 0.0])
        dist_loc = float(np.linalg.norm(u_loc - r_loc))

        # Tiêu chuẩn chấm vị trí khắt khe (Euclidean Distance chặt chẽ):
        # <= 0.15: Rất chuẩn xác vị trí -> 90 - 100%
        # 0.15 - 0.26: Khớp tương đối -> 70 - 89%
        # 0.26 - 0.40: Lệch vị trí khá xa -> 35 - 69%
        # > 0.40: Sai hoàn toàn vị trí thực hiện (ví dụ làm ở thái dương thay vì ở miệng/ngực) -> 10 - 30%
        if dist_loc <= 0.15:
            loc_score = 90.0 + (0.15 - dist_loc) / 0.15 * 10.0
        elif dist_loc <= 0.26:
            loc_score = 70.0 + (0.26 - dist_loc) / 0.11 * 19.0
            feedbacks.append(f"Vị trí bàn tay hơi lệch so với mẫu cử chỉ '{word_display}'")
        elif dist_loc <= 0.40:
            loc_score = 35.0 + (0.40 - dist_loc) / 0.14 * 34.0
            feedbacks.append(f"Vị trí đặt tay chưa đúng khu vực cử chỉ của từ '{word_display}'")
        else:
            loc_score = max(10.0, 30.0 - (dist_loc - 0.40) * 50.0)
            feedbacks.append(f"Sai vị trí: cử chỉ '{word_display}' cần thực hiện đúng vị trí mẫu (không đưa lên thái dương hoặc sai chỗ).")

        # Kiểm tra hai tay nếu từ vựng yêu cầu 2 tay
        if r_is_two_handed and not u_is_two_handed:
            loc_score = max(15.0, loc_score - 30.0)
            feedbacks.append(f"Ký hiệu '{word_display}' yêu cầu thực hiện bằng CẢ 2 BÀN TAY!")

        # 3. Quỹ đạo chuyển động (Movement Trajectory / Stroke)
        u_stroke_vec = u_hand_eval[-1, 0, :2] - u_hand_eval[0, 0, :2] if len(u_hand_eval) >= 2 else np.array([0.0, 0.0])
        r_stroke_vec = active_r_hand[-1, 0, :2] - active_r_hand[0, 0, :2] if len(active_r_hand) >= 2 else np.array([0.0, 0.0])

        u_mag = float(np.linalg.norm(u_stroke_vec))
        r_mag = float(np.linalg.norm(r_stroke_vec))

        if r_mag >= 0.10 and u_mag >= 0.08:
            # So sánh hướng chuyển động (cosine similarity)
            cos_sim = float(np.dot(u_stroke_vec, r_stroke_vec) / (u_mag * r_mag + 1e-6))
            if cos_sim >= 0.70:
                m_score = 90.0 + min(10.0, (cos_sim - 0.70) / 0.30 * 10.0)
            elif cos_sim >= 0.20:
                m_score = 65.0 + (cos_sim - 0.20) / 0.50 * 24.0
                feedbacks.append(f"Hướng di chuyển tay hơi lệch so với cử chỉ '{word_display}'")
            else:
                m_score = 30.0
                feedbacks.append(f"Hướng chuyển động của tay đi ngược hoặc sai hướng mẫu của từ '{word_display}'")
        else:
            # Ký hiệu tĩnh hoặc biên độ chuyển động nhỏ
            m_score = 85.0 if abs(u_mag - r_mag) < 0.18 else 50.0

        position_score = min(100.0, round(0.60 * loc_score + 0.40 * m_score, 1))
        overall_score = min(100.0, round(0.40 * angle_score + 0.60 * position_score, 1))

    passed = overall_score >= 80.0
    if not feedbacks and passed:
        feedbacks.append(f"Tuyệt vời! Cử chỉ '{word_display}' của bạn rất chuẩn xác.")

    return {
        "word": word_display,
        "word_slug": clean_slug,
        "overall_score": overall_score,
        "passed": passed,
        "dtw_score": overall_score,
        "angle_score": angle_score,
        "position_score": position_score,
        "user_action_start_sec": user_action_start_sec,
        "ref_action_start_sec": ref_action_start_sec,
        "time_offset_sec": time_offset_sec,
        "finger_details": finger_scores,
        "bad_joints": sorted(list(set(bad_joints))),
        "feedbacks": feedbacks,
    }

@app.post("/api/evaluate/{word_slug}")
def evaluate_word(word_slug: str, req: EvaluateRequest):
    return process_evaluation(req.landmarks, word_slug=word_slug)

@app.post("/api/evaluate/chao")
def evaluate_chao(req: EvaluateRequest):
    return process_evaluation(req.landmarks, word_slug="chao")

@app.get("/api/benchmarks")
def list_benchmarks():
    """Danh sách các benchmark từ vựng VSL400 sẵn sàng chấm điểm"""
    benchmarks = []
    if os.path.exists(BENCHMARKS_DIR):
        for f in sorted(os.listdir(BENCHMARKS_DIR)):
            if f.endswith("_meta.json"):
                try:
                    with open(os.path.join(BENCHMARKS_DIR, f), "r", encoding="utf-8") as jf:
                        benchmarks.append(json.load(jf))
                except Exception:
                    pass
    return {"total": len(benchmarks), "benchmarks": benchmarks}

@app.get("/")
def root():
    return {
        "app": "Signlingo AI Scoring Service",
        "status": "online",
        "target_word": "chao",
        "benchmark_loaded": REF_SEQ is not None,
        "passing_threshold": 80.0,
        "endpoints": ["/api/evaluate/chao", "/api/evaluate/{word_slug}"]
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "signlingo-backend", "target_word": "chao", "passing_threshold": 80.0}

DATA_DIR = os.path.join(CURRENT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
CUSTOM_WORDS_FILE = os.path.join(DATA_DIR, "custom_words.json")

FRONTEND_UPLOADS_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "frontend", "public", "uploads"))
os.makedirs(FRONTEND_UPLOADS_DIR, exist_ok=True)

def load_custom_words() -> List[Dict[str, Any]]:
    if os.path.exists(CUSTOM_WORDS_FILE):
        try:
            with open(CUSTOM_WORDS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_custom_words(words: List[Dict[str, Any]]):
    with open(CUSTOM_WORDS_FILE, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)

@app.post("/api/upload_video")
async def upload_video(file: UploadFile = File(...)):
    try:
        ext = os.path.splitext(file.filename)[1]
        if not ext:
            ext = ".mp4"
        safe_name = f"video_{int(time.time() * 1000)}{ext.lower()}"
        dest_path = os.path.join(FRONTEND_UPLOADS_DIR, safe_name)
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        video_url = f"/uploads/{safe_name}"
        return {
            "success": True,
            "filename": safe_name,
            "videoUrl": video_url,
            "message": "Video đã được tải lên thành công!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu video: {str(e)}")

class CustomWordModel(BaseModel):
    id: Optional[str] = None
    word: str
    topic: str
    topicLabel: str
    dialect: str
    description: str
    videoFront: str
    videoSide: Optional[str] = None
    difficulty: Optional[str] = "Dễ"
    duration: Optional[str] = "3 phút"
    handShape: Optional[str] = None
    movement: Optional[str] = None
    details: Optional[str] = None
    isCustom: Optional[bool] = True

@app.get("/api/words")
def get_words():
    return load_custom_words()

@app.post("/api/words")
def add_word(word: CustomWordModel):
    words = load_custom_words()
    word_dict = word.dict()
    if not word_dict.get("id"):
        word_dict["id"] = f"w-custom-{int(time.time() * 1000)}"
    word_dict["createdAt"] = time.time()
    words = [w for w in words if w.get("id") != word_dict["id"]]
    words.append(word_dict)
    save_custom_words(words)
    return {"success": True, "word": word_dict}

@app.delete("/api/words/{word_id}")
def delete_word(word_id: str):
    words = load_custom_words()
    words = [w for w in words if w.get("id") != word_id]
    save_custom_words(words)
    return {"success": True, "deleted_id": word_id}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
