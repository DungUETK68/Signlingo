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
    description="Backend API đánh giá cử chỉ Ngôn ngữ Ký hiệu 'Chào' chuẩn VSL bằng FastDTW",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Nạp khuôn mẫu chuẩn và metadata của từ "Chào"
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(CURRENT_DIR, "models")

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
    - 0.93 - 1.0: Ngón tay mở thẳng chuẩn (Open-B trong từ 'Chào')
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

def process_evaluation(landmarks: List[List[List[float]]]) -> dict:
    global REF_SEQ, META
    if REF_SEQ is None or not META:
        load_benchmark()

    usr_raw = np.array(landmarks, dtype=np.float32)
    if usr_raw.shape[0] < 5:
        return {
            "overall_score": 0.0,
            "passed": False,
            "angle_score": 0.0,
            "position_score": 0.0,
            "bad_joints": list(range(21)),
            "feedbacks": ["Chưa nhận diện đủ chuyển động tay. Hãy đưa bàn tay vào khung hình!"],
        }

    usr_seq = normalize_spatial(usr_raw)
    usr_pose = usr_seq[:, :33, :]

    ref_hand_side = META.get("dominant_hand", "right") if META else "right"
    if REF_SEQ is not None:
        ref_hand_seq = extract_dominant_hand(REF_SEQ, ref_hand_side)
    else:
        ref_hand_seq = usr_seq[:, 54:75, :]

    # Nhận diện tay hoạt động chính của người học trên Webcam
    usr_lh_active = np.sum(np.any(usr_seq[:, 33:54, :] != 0, axis=2))
    usr_rh_active = np.sum(np.any(usr_seq[:, 54:75, :] != 0, axis=2))
    usr_side = "right" if usr_rh_active >= usr_lh_active else "left"
    usr_hand_seq = extract_dominant_hand(usr_seq, usr_side).copy()

    # Lật trục X nếu thực hiện bằng tay trái để đồng bộ với khuôn mẫu chuẩn
    if usr_side != ref_hand_side:
        usr_hand_seq[:, :, 0] = -usr_hand_seq[:, :, 0]

    # 1. Trích xuất phân đoạn động tác chính (Active Gesture Segmentation)
    # Lọc các khung hình bàn tay được nâng lên thực hiện động tác
    wrists_y = usr_hand_seq[:, 0, 1]
    valid_frames = np.where(np.any(usr_hand_seq != 0, axis=(1, 2)))[0]
    if len(valid_frames) >= 5:
        sub_wrists_y = wrists_y[valid_frames]
        min_y = np.min(sub_wrists_y)
        max_y = np.max(sub_wrists_y)
        y_threshold = min_y + 0.60 * (max_y - min_y) if (max_y - min_y) > 0.15 else max_y + 0.1
        active_indices = [idx for idx in valid_frames if wrists_y[idx] <= y_threshold]
        if len(active_indices) >= 5:
            active_usr_hand = usr_hand_seq[active_indices]
            active_usr_pose = usr_pose[active_indices]
        else:
            active_usr_hand = usr_hand_seq[valid_frames]
            active_usr_pose = usr_pose[valid_frames]
    else:
        active_usr_hand = usr_hand_seq
        active_usr_pose = usr_pose

    # 2. Đánh giá hình dáng bàn tay nghiêm ngặt (Handshape: 5 ngón mở thẳng Open-B)
    finger_scores = {}
    bad_joints = []
    feedbacks = []

    for f_name, chain in FINGER_CHAINS.items():
        exts = [get_finger_extension(h, chain) for h in active_usr_hand if np.any(h != 0)]
        avg_ext = float(np.mean(exts)) if exts else 0.5
        
        # Tiêu chuẩn chấm khắt khe (chỉ duỗi thẳng thực sự mới đạt >= 90%):
        # >= 0.93: Duỗi thẳng chuẩn (92 - 100%)
        # 0.84 - 0.93: Cong nhẹ (72 - 91%)
        # 0.70 - 0.84: Gập rõ rệt (50 - 71%)
        # < 0.70: Co quắp (< 50%)
        if avg_ext >= 0.93:
            score = 92.0 + (avg_ext - 0.93) / 0.07 * 8.0
        elif avg_ext >= 0.84:
            score = 72.0 + (avg_ext - 0.84) / 0.09 * 19.0
        elif avg_ext >= 0.70:
            score = 50.0 + (avg_ext - 0.70) / 0.14 * 21.0
        else:
            score = max(15.0, avg_ext / 0.70 * 48.0)

        score = min(100.0, round(score, 1))
        finger_scores[f_name] = score
        
        # Điểm dưới 85% bị coi là chưa chuẩn và đánh dấu đỏ
        if score < 85.0:
            bad_joints.extend(chain[1:])
            feedbacks.append(f"{f_name} chưa duỗi thẳng chuẩn xác ({score}%)")

    angle_score = round(float(np.mean(list(finger_scores.values()))), 1)

    # 3. Đánh giá vị trí tiếp xúc thái dương khắt khe (Location: Temple Proximity)
    # Trong VSL "Chào", ngón tay PHẢI chạm hoặc tiếp cận sát vùng thái dương
    temple_dists = []
    for t_idx, h in enumerate(active_usr_hand):
        p = active_usr_pose[t_idx] if t_idx < len(active_usr_pose) else np.zeros((33, 3))
        # Xác định vị trí thái dương theo bên tay thực hiện
        if usr_side == "right":
            if np.any(p[5] != 0) and np.any(p[8] != 0):
                temple_pos = (p[5][:2] + p[8][:2]) / 2.0
            elif np.any(p[0] != 0):
                temple_pos = p[0][:2] + np.array([-0.25, -0.15])
            else:
                temple_pos = np.array([-0.25, -0.9])
        else:
            if np.any(p[2] != 0) and np.any(p[7] != 0):
                temple_pos = (p[2][:2] + p[7][:2]) / 2.0
            elif np.any(p[0] != 0):
                temple_pos = p[0][:2] + np.array([0.25, -0.15])
            else:
                temple_pos = np.array([0.25, -0.9])

        # Kiểm tra cự ly từ đầu ngón trỏ (8) và ngón giữa (12) tới thái dương
        # Trong VSL 'Chào', ngón tay chạm thái dương (ngang đuôi mắt hoặc cao hơn)
        # Nếu tay ở má/miệng/cằm (y > temple_pos[1] + 0.04), áp dụng hệ số phạt độ cao khắt khe
        frame_dists = []
        for tip_i in [8, 12]:
            tip_pos = h[tip_i][:2]
            raw_d = float(np.linalg.norm(tip_pos - temple_pos))
            y_below = max(0.0, float(tip_pos[1] - (temple_pos[1] + 0.04)))
            eff_d = raw_d + y_below * 4.0
            frame_dists.append(eff_d)
        temple_dists.append(min(frame_dists))

    min_temple_dist = float(np.min(temple_dists)) if temple_dists else 1.0

    # Chấm điểm độ tiếp cận thái dương (Temple Score cực kỳ khắt khe):
    # <= 0.26: Đã chạm hoặc áp sát thái dương chuẩn VSL -> 95 - 100%
    # 0.26 - 0.34: Hơi xa thái dương một chút -> 75 - 89%
    # 0.34 - 0.50: Ở vùng má / tai / miệng hoặc lệch ra ngoài không trung -> 35 - 65%
    # > 0.50: Cách xa thái dương (ngực, cằm hoặc vẫy tự do) -> 10 - 30%
    if min_temple_dist <= 0.26:
        temple_loc_score = 95.0 + min(5.0, (0.26 - min_temple_dist) * 35.0)
    elif min_temple_dist <= 0.34:
        temple_loc_score = 75.0 + (0.34 - min_temple_dist) / 0.08 * 14.0
        feedbacks.append("Đầu ngón tay chưa chạm sát vào vùng thái dương (cần áp sát đuôi mắt/thái dương trước khi vươn ra)")
    elif min_temple_dist <= 0.50:
        temple_loc_score = 35.0 + (0.50 - min_temple_dist) / 0.16 * 35.0
        feedbacks.append("Vị trí tay đang ở vùng má/miệng/tai hoặc lệch ra ngoài thay vì thái dương (ký hiệu 'Chào' bắt buộc chạm thái dương)")
    else:
        temple_loc_score = max(10.0, 30.0 - (min_temple_dist - 0.50) * 35.0)
        feedbacks.append("Chưa đưa tay lên vùng thái dương (đặc trưng cốt lõi của ký hiệu 'Chào')")

    # 4. Đánh giá quỹ đạo chuyển động & Phát hiện động tác vẫy tay (Movement & Waving Detection)
    wrist_x = active_usr_hand[:, 0, 0]
    oscillations = count_macro_oscillations(wrist_x, min_amplitude=0.07)
    is_waving = oscillations >= 2 and len(active_usr_hand) >= 10

    if is_waving:
        feedbacks.append("Động tác đang là vẫy tay qua lại. Ký hiệu 'Chào' trong VSL là chạm nhẹ thái dương rồi đưa dứt khoát ra ngoài, tuyệt đối không vẫy lắc.")

    # Kiểm tra cự ly vươn ra ngoài (Stroke range)
    peak_out_dist = float(np.max(temple_dists)) if temple_dists else 0.5
    stroke_range = peak_out_dist - min_temple_dist
    if stroke_range < 0.18:
        feedbacks.append("Chưa có động tác đưa tay dứt khoát ra ngoài phía trước sau khi chạm thái dương")
        stroke_score = 30.0
    elif stroke_range < 0.28:
        feedbacks.append("Động tác vươn tay ra ngoài còn hơi ngắn, hãy đưa dứt khoát hơn")
        stroke_score = 65.0 + (stroke_range - 0.18) / 0.10 * 20.0
    else:
        stroke_score = 92.0 + min(8.0, (stroke_range - 0.28) * 40.0)

    # So khớp quỹ đạo bằng FastDTW (Hệ số phạt nghiêm ngặt 0.32)
    ref_active = ref_hand_seq[7:45, 0, :2] if len(ref_hand_seq) >= 45 else ref_hand_seq[:, 0, :2]
    usr_active = active_usr_hand[:, 0, :2]
    
    if len(usr_active) >= 3 and len(ref_active) >= 3:
        _, path = fastdtw(ref_active, usr_active, dist=euclidean)
        dtw_errors = [np.linalg.norm(ref_active[r] - usr_active[u]) for r, u in path]
        mean_dtw_err = float(np.mean(dtw_errors))
        raw_dtw_score = max(10.0, min(100.0, 100.0 * float(np.exp(-mean_dtw_err / 0.32))))
    else:
        raw_dtw_score = 50.0

    # Nếu có hiện tượng vẫy tay qua lại, phạt điểm chuyển động xuống <= 20%
    if is_waving:
        move_score = min(20.0, raw_dtw_score * 0.20)
    else:
        move_score = round(0.40 * stroke_score + 0.60 * raw_dtw_score, 1)

    # Điểm vị trí & chuyển động (Euclidean): 50% tiếp cận thái dương + 50% quỹ đạo đưa ra ngoài
    # Áp dụng hệ số x1.2 để giảm độ khắt khe của khoảng cách Euclidean theo yêu cầu
    raw_pos = 0.50 * temple_loc_score + 0.50 * move_score
    position_score = min(100.0, round(raw_pos * 1.2, 1))

    # 5. Tổng kết điểm số toàn diện:
    # 25% Hình dáng ngón tay (Open-B)
    # 75% Vị trí thái dương & Quỹ đạo dứt khoát (tránh trường hợp chỉ giơ tay mở là đạt)
    overall_score = min(100.0, round(0.25 * angle_score + 0.75 * position_score, 1))
    
    # Nếu đang vẫy tay, khống chế trần điểm tối đa không quá 45%
    if is_waving:
        overall_score = min(overall_score, 45.0)

    # MỨC ĐẠT (>= 85.0)
    passed = overall_score >= 85.0

    if not feedbacks and passed:
        feedbacks.append("Tuyệt vời! Cử chỉ 'Chào' của bạn rất chuẩn xác và đúng nhịp độ.")

    return {
        "overall_score": overall_score,
        "passed": passed,
        "angle_score": angle_score,
        "position_score": position_score,
        "finger_details": finger_scores,
        "bad_joints": sorted(list(set(bad_joints))),
        "feedbacks": feedbacks,
    }

@app.post("/api/evaluate/chao")
def evaluate_chao(req: EvaluateRequest):
    return process_evaluation(req.landmarks)

@app.get("/")
def root():
    return {
        "app": "Signlingo AI Scoring Service",
        "status": "online",
        "target_word": "chao",
        "benchmark_loaded": REF_SEQ is not None,
        "passing_threshold": 85.0,
        "endpoints": ["/api/evaluate/chao"]
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "signlingo-backend", "target_word": "chao", "passing_threshold": 85.0}

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
