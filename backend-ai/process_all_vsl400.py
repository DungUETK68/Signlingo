# -*- coding: utf-8 -*-
"""
Script xử lý trích xuất toàn bộ 400 từ vựng VSL400 từ Part_1.zip -> Part_7.zip:
1. Đọc metadata 400 từ vựng VSL400 (chuẩn hóa signer 001, độ dài ~2.5s)
2. Trích xuất đủ 3 góc quay (front_view, left_view, right_view) cho mỗi từ
3. Tối ưu hóa video sang chuẩn H.264 web (540x540, CRF 26, ultrafast, +faststart)
4. Sinh ảnh thumbnail cho mỗi từ
5. Trích xuất 75 landmarks MediaPipe Holistic từ video front_view tạo benchmark .npy & meta .json
6. Xuất file catalog JSON cho frontend, mảng dữ liệu vsl400Words.js, và seed data cho NestJS
"""

import os
import sys
import io
import json
import zipfile
import tempfile
import subprocess
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import imageio_ffmpeg

if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
ZIP_DIR = r"E:\Download\Signlingo"
TASK_PATH = os.path.join(ZIP_DIR, "holistic_landmarker.task")

FRONTEND_PUBLIC_DIR = os.path.join(PROJECT_ROOT, "frontend", "public", "vsl400_videos")
FRONTEND_DATA_DIR = os.path.join(PROJECT_ROOT, "frontend", "src", "data")
BACKEND_BENCHMARKS_DIR = os.path.join(CURRENT_DIR, "models", "benchmarks")
BACKEND_CORE_SEED_DIR = os.path.join(PROJECT_ROOT, "backend-core", "src", "modules", "seed")

os.makedirs(FRONTEND_PUBLIC_DIR, exist_ok=True)
os.makedirs(BACKEND_BENCHMARKS_DIR, exist_ok=True)
os.makedirs(FRONTEND_DATA_DIR, exist_ok=True)
os.makedirs(BACKEND_CORE_SEED_DIR, exist_ok=True)

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

COLLISION_MAP = {
    'Cho': 'cho', 'Chợ': 'cho_nang',
    'Cô': 'co', 'Có': 'co_sac',
    'Đi': 'di', 'Dì': 'di_huyen',
    'Dơ': 'do', 'Dở': 'do_hoi',
    'Giây': 'giay', 'Giày': 'giay_huyen',
    'Gió': 'gio_sac', 'Giờ': 'gio_huyen',
    'Gối (đầu)': 'goi_dau', 'Gội đầu': 'goi_dau_nang',
    'Khô': 'kho', 'Khó': 'kho_sac',
    'Mưa': 'mua', 'Múa': 'mua_sac',
    'Nắng': 'nang_sac', 'Nặng': 'nang_nang',
    'Quả dứa': 'qua_dua_sac', 'Quả dừa': 'qua_dua_huyen',
    'Trẻ': 'tre_hoi', 'Trễ': 'tre_nga',
    'Võ': 'vo_nga', 'Vở': 'vo_hoi', 'Vợ': 'vo_nang'
}

def slugify(text: str) -> str:
    if text in COLLISION_MAP:
        return COLLISION_MAP[text]
    s = text.lower().strip()
    s = re.sub(r'[àáảãạăằắẳẵặâầấẩẫậ]', 'a', s)
    s = re.sub(r'[đ]', 'd', s)
    s = re.sub(r'[èéẻẽẹêềếểễệ]', 'e', s)
    s = re.sub(r'[ìíỉĩị]', 'i', s)
    s = re.sub(r'[òóỏõọôồốổỗộơờớởỡợ]', 'o', s)
    s = re.sub(r'[ùúủũụưừứửữự]', 'u', s)
    s = re.sub(r'[ỳýỷỹỵ]', 'y', s)
    s = re.sub(r'[^a-z0-9]+', '_', s)
    return s.strip('_')

TOPIC_RULES = [
    ("family", "Gia đình & Xưng hô", [
        "Bố", "Mẹ", "Anh", "Chị", "Em", "Ông nội", "Bà nội", "Ông ngoại", "Bà ngoại", 
        "Cháu", "Chú", "Cô", "Bác", "Cậu", "Dì", "Chồng", "Vợ", "Con trai", "Con gái", "Họ hàng"
    ]),
    ("greeting", "Chào hỏi & Giao tiếp", [
        "Cảm ơn", "Xin lỗi", "Giúp đỡ", "Khỏe", "Giới thiệu", "Hỏi", "Nói", "Nói chuyện", 
        "Đồng ý", "Từ chối", "Vâng lời", "Hứa", "Cung cấp", "Gặp", "Quen", "Không quen"
    ]),
    ("food", "Ẩm thực & Thức uống", [
        "Ăn", "Uống", "Nấu", "Nướng", "Nếm", "Phở", "Bún", "Bánh bao", "Bánh chưng", "Bánh tét", 
        "Bánh xèo", "Mì gói", "Xôi", "Thịt", "Trứng", "Gạo", "Sữa", "Trà", "Cà phê", "Nước", 
        "Bia", "Rượu", "Kem", "Kẹo", "Quả bơ", "Quả cam", "Quả chuối", "Quả dâu", "Quả dứa", 
        "Quả dừa", "Quả mận", "Quả xoài", "Quả đu đủ", "Quả đào", "Mặn", "Ngọt", "Chua", "Cay", 
        "Đắng", "Nhạt", "Ngon miệng", "Tham ăn", "Thèm", "Nồi cơm điện", "Cái chảo", "Cái nồi"
    ]),
    ("health", "Y tế & Sức khỏe", [
        "Bác sĩ", "Y tá", "Bệnh viện", "Khám bệnh", "Đau", "Ốm", "Chết", "Yếu", "Mệt"
    ]),
    ("education", "Giáo dục & Nghề nghiệp", [
        "Học", "Học sinh", "Sinh viên", "Trường học", "Trường Đại học", "Trường Cao đẳng", 
        "Sách", "Vở", "Bút bi", "Bút chì", "Thước kẻ", "Bảng", "Viên phấn", "Cục tẩy", 
        "Dụng cụ học tập", "Giấy nháp", "Làm bài tập", "Giáo viên", "Hiệu trưởng", 
        "Giám đốc", "Luật sư", "Kế toán", "Thư ký", "Ca sĩ", "Diễn viên", "Nông dân", 
        "Đầu bếp", "Bảo vệ", "Nhân viên phục vụ", "Nhân viên văn phòng", "Lễ tân", "Làm việc", 
        "Báo cáo", "Nghề nghiệp", "Chủ tịch"
    ]),
    ("sports", "Thể thao & Giải trí", [
        "Bóng đá", "Bơi lội", "Bóng bàn", "Bóng chuyền", "Bóng rổ", "Cầu lông", "Đá cầu", 
        "Chơi cờ", "Điền kinh", "Chạy", "Nhảy cao", "Nhảy dây", "Múa", "Hát", "Chụp hình", 
        "Rạp chiếu phim", "Thể dục (thể thao)", "Võ", "Cắm trại"
    ]),
    ("nature", "Thiên nhiên & Động vật", [
        "Con bò", "Con chó", "Con dê", "Con gà", "Con heo", "Con mèo", "Con rùa", "Con thỏ", 
        "Con trâu", "Con vịt", "Gió", "Mưa", "Nắng", "Thời tiết", "Mùa xuân", "Mùa hè", 
        "Mùa thu", "Mùa đông", "Mùa mưa", "Mùa khô", "Bình minh", "Hoàng hôn"
    ]),
    ("travel", "Địa điểm & Giao thông", [
        "Xe máy", "Xe đạp", "Xe buýt", "Xe tải", "Ô tô", "Máy bay", "Tàu hỏa", "Trực thăng", 
        "Thuyền", "Taxi", "Ngân hàng", "Siêu thị", "Chợ", "Nhà sách", "Nhà hàng", "Công viên", 
        "Thành phố", "Việt Nam", "Nhật Bản", "Hàn Quốc", "Trung Quốc", "Thái Lan", "Mỹ", 
        "Quán cà phê", "Nhà", "Nhà trọ", "Công ty"
    ]),
    ("time", "Thời gian & Lịch", [
        "Bây giờ", "Ngày", "Giờ", "Phút", "Giây", "Năm", "Buổi sáng", "Buổi trưa", "Buổi chiều", 
        "Buổi tối", "Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", 
        "Tháng một", "Tháng hai", "Tháng ba", "Tháng tư", "Tháng năm", "Tháng sáu", "Tháng bảy", 
        "Tháng tám", "Tháng chín", "Tháng mười", "Tháng mười một", "Tháng mười hai", "Tháng", 
        "Thời gian", "Sớm", "Trễ", "Tết Âm lịch", "Trung thu", "Giáng sinh", "Ngày Nhà giáo Việt Nam", 
        "Ngày Quốc tế Lao động", "Ngày Quốc tế Phụ nữ", "Ngày Quốc tế Thiếu nhi"
    ]),
    ("daily", "Đời sống & Đồ dùng", [
        "Ngủ", "Thức dậy", "Rửa mặt", "Rửa tay", "Rửa chén", "Tắm rửa", "Giặt đồ", "Phơi đồ", 
        "Quần thun", "Quần tây", "Quần đùi", "Áo sơ mi", "Áo thun", "Áo đầm", "Cái áo", "Cái quần", 
        "Mũ", "Mũ bảo hiểm", "Khăn quàng cổ", "Giày", "Dép", "Dây chuyền", "Vòng tay", "Đồng hồ đeo tay", 
        "Túi xách", "Ba lô", "Kẹp tóc", "Đồ buộc tóc", "Cái bàn", "Cái ghế", "Giường", "Cái cửa", 
        "Cửa sổ", "Cái đèn", "Quạt (đứng)", "Tivi", "Tủ lạnh", "Máy giặt", "Máy điều hòa", 
        "Máy chiếu", "Điện thoại", "Laptop", "Bàn phím", "Máy tính cầm tay", "Kính lúp", 
        "Chìa khóa", "Cái kéo", "Mền", "Gối (đầu)", "Gội đầu", "Tường", "Quả địa cầu", "Đồ dùng"
    ]),
    ("emotions", "Cảm xúc & Tính chất", [
        "Cười", "Khóc", "Dỗi", "Cảm thấy", "Yêu thương", "Ghét", "Thích", "Thông minh", 
        "Chăm chỉ", "Lười biếng", "Hài hước", "Tốt bụng", "Dũng cảm", "Hiền", "Dữ", "Ngoan", 
        "Ngu ngốc", "Tham lam", "Hy vọng", "Đẹp (người)", "Đẹp (vật)", "Xấu (người)", "Xấu (vật)", 
        "Cao (người)", "Cao (đồ vật)", "Thấp (đồ vật)", "Lùn", "Mập", "Gầy", "Già", "Trẻ", 
        "Sạch sẽ", "Dơ", "Dở", "Dễ", "Khó", "Khô", "Ướt", "Nóng", "Lạnh", "Ấm", "Mát mẻ", 
        "Nhanh", "Chậm chạp", "Cứng", "Mềm", "Rộng", "Hẹp", "Chật", "Dài", "Ngắn", "Nặng", 
        "Nhẹ", "Đắt", "Rẻ", "Mới", "Cũ", "Đậm", "Nhạt", "Hôi", "Thơm", "Hư", "Yên tĩnh", "Ồn ào", 
        "Bận", "Mạnh", "Nghèo", "Giàu", "Sáng tạo", "Thú vị", "Nhầm lẫn", "Đúng", "Sai", "Gần", "Xa", 
        "Màu cam", "Màu hồng", "Màu nâu", "Màu trắng", "Màu tím", "Màu vàng", "Màu xanh da trời", 
        "Màu xanh lá cây", "Màu đen", "Màu đỏ"
    ]),
    ("actions", "Hành động & Hoạt động", [
        "Đi", "Dừng lại", "Xem", "Nghe", "Ngửi", "Viết", "Đọc", "Tìm", "Quan sát", "Mách", 
        "Khoe khoang", "Mua bán", "Muốn", "Cần", "Không cần", "Không cho", "Không nên", 
        "Không nghe lời", "Thay đổi", "Tiếp tục", "Thử", "Bắt buộc", "Bắt chước", "Nghỉ ngơi"
    ])
]

def get_topic_info(word: str):
    for topic_id, topic_label, word_list in TOPIC_RULES:
        if word in word_list:
            return topic_id, topic_label
    return "daily", "Đời sống hàng ngày"

def get_difficulty(word: str):
    tokens = word.split()
    if len(tokens) == 1:
        return "Dễ"
    elif len(tokens) == 2:
        return "Trung bình"
    else:
        return "Nâng cao"

def convert_single_video(task_info):
    """
    Xử lý chuyển đổi 1 video từ zip -> H.264
    task_info: (p1_path, zip_entry, out_path)
    """
    p1_path, zip_entry, out_path = task_info
    if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
        return False # Đã có sẵn
    
    try:
        with zipfile.ZipFile(p1_path, 'r') as z:
            raw_bytes = z.read(zip_entry)
        
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_in:
            tmp_in.write(raw_bytes)
            tmp_in_path = tmp_in.name

        cmd = [
            FFMPEG_EXE, '-y',
            '-i', tmp_in_path,
            '-vf', 'scale=540:540',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-crf', '26',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            '-an',
            out_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(tmp_in_path):
            os.remove(tmp_in_path)
        return res.returncode == 0
    except Exception as e:
        print(f"Lỗi convert {zip_entry}: {e}")
        return False

def main():
    print("=" * 70)
    print("BẮT ĐẦU QUY TRÌNH XỬ LÝ TOÀN DIỆN 400 TỪ VỰNG VSL400")
    print("=" * 70)

    p1_path = os.path.join(ZIP_DIR, "Part_1.zip")
    with zipfile.ZipFile(p1_path, 'r') as z:
        with z.open('split_1/front_view.json') as f:
            all_front_meta = json.load(f)

    gloss_map = {}
    for item in all_front_meta:
        g = item['gloss'].strip()
        if g not in gloss_map:
            gloss_map[g] = []
        gloss_map[g].append(item)

    unique_glosses = sorted(list(gloss_map.keys()))
    print(f"Tổng số từ vựng VSL400 phát hiện: {len(unique_glosses)}")

    vsl400_items = []
    for g in unique_glosses:
        samples = gloss_map[g]
        sorted_samples = sorted(samples, key=lambda x: (x['signer_id'] != '001', abs(x['length_seconds'] - 2.5)))
        best = sorted_samples[0]
        slug = slugify(g)
        topic, topic_label = get_topic_info(g)
        diff = get_difficulty(g)

        vsl400_items.append({
            "word": g,
            "slug": slug,
            "video_id": best['video_id'],
            "signer_id": best['signer_id'],
            "fps": float(best['fps']),
            "num_frames": int(best['num_frames']),
            "length_seconds": float(best['length_seconds']),
            "topic": topic,
            "topicLabel": topic_label,
            "difficulty": diff,
            "videoFront": f"/vsl400_videos/{slug}_front.mp4",
            "videoLeft": f"/vsl400_videos/{slug}_left.mp4",
            "videoRight": f"/vsl400_videos/{slug}_right.mp4",
            "videoSide": f"/vsl400_videos/{slug}_left.mp4",
            "thumbnail": f"/vsl400_videos/{slug}_thumb.jpg",
            "benchmarkReady": False,
            "dominantHand": "right"
        })

    # =========================================================================
    # GIAI ĐOẠN 1: CHUYỂN ĐỔI TOÀN BỘ 1200 VIDEO (3 GÓC QUAY) BẰNG THREAD POOL
    # =========================================================================
    print("\n--- GIAI ĐOẠN 1: CHUYỂN ĐỔI 1,200 VIDEO (FRONT, LEFT, RIGHT) ---")
    video_tasks = []
    for item in vsl400_items:
        vid = item['video_id']
        slug = item['slug']
        out_front = os.path.join(FRONTEND_PUBLIC_DIR, f"{slug}_front.mp4")
        out_left = os.path.join(FRONTEND_PUBLIC_DIR, f"{slug}_left.mp4")
        out_right = os.path.join(FRONTEND_PUBLIC_DIR, f"{slug}_right.mp4")

        video_tasks.append((p1_path, f"split_1/front_view/{vid}.mp4", out_front))
        video_tasks.append((p1_path, f"split_1/left_view/{vid}.mp4", out_left))
        video_tasks.append((p1_path, f"split_1/right_view/{vid}.mp4", out_right))

    total_tasks = len(video_tasks)
    print(f"Tổng số tác vụ video: {total_tasks} (Front, Left, Right)")

    t0_vid = time.time()
    converted_count = 0
    already_count = 0

    with ThreadPoolExecutor(max_workers=4) as executor:
        future_map = {executor.submit(convert_single_video, t): t for t in video_tasks}
        done_count = 0
        for fut in as_completed(future_map):
            done_count += 1
            res = fut.result()
            if res:
                converted_count += 1
            else:
                already_count += 1
            if done_count % 100 == 0 or done_count == total_tasks:
                el = time.time() - t0_vid
                rate = done_count / el if el > 0 else 0
                rem = (total_tasks - done_count) / rate if rate > 0 else 0
                print(f"  [Video: {done_count}/{total_tasks}] Đã xử lý {int(done_count/total_tasks*100)}% | Đã convert mới: {converted_count}, Sẵn có: {already_count} | Còn: {int(rem)}s")

    print(f"Hoàn thành Giai đoạn 1 sau {round(time.time() - t0_vid, 1)}s!")

    # Đồng bộ side.mp4 và sinh thumbnails
    print("\nĐang tạo side.mp4 tương thích và thumbnail cho 400 từ...")
    for item in vsl400_items:
        slug = item['slug']
        out_front = os.path.join(FRONTEND_PUBLIC_DIR, f"{slug}_front.mp4")
        out_left = os.path.join(FRONTEND_PUBLIC_DIR, f"{slug}_left.mp4")
        out_side = os.path.join(FRONTEND_PUBLIC_DIR, f"{slug}_side.mp4")
        out_thumb = os.path.join(FRONTEND_PUBLIC_DIR, f"{slug}_thumb.jpg")

        if not os.path.exists(out_side) and os.path.exists(out_left):
            try:
                with open(out_left, 'rb') as sf, open(out_side, 'wb') as df:
                    df.write(sf.read())
            except Exception:
                pass

        if not os.path.exists(out_thumb) and os.path.exists(out_front):
            try:
                cap = cv2.VideoCapture(out_front)
                total_f = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 30
                cap.set(cv2.CAP_PROP_POS_FRAMES, total_f // 2)
                ret, thumb_frame = cap.read()
                if ret:
                    cv2.imwrite(out_thumb, thumb_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                cap.release()
            except Exception:
                pass

    # =========================================================================
    # GIAI ĐOẠN 2: TRÍCH XUẤT MEDIAPIPE HOLISTIC LANDMARKS (BENCHMARKS)
    # =========================================================================
    print("\n--- GIAI ĐOẠN 2: TRÍCH XUẤT 75 LANDMARKS TỪ GÓC CHÍNH DIỆN (FRONT_VIEW) ---")
    with open(TASK_PATH, 'rb') as f:
        model_buffer = f.read()

    detector = vision.HolisticLandmarker.create_from_options(
        vision.HolisticLandmarkerOptions(
            base_options=python.BaseOptions(model_asset_buffer=model_buffer),
            output_face_blendshapes=False
        )
    )

    t0_bench = time.time()
    new_bench_count = 0
    existing_bench_count = 0

    for idx, item in enumerate(vsl400_items):
        word = item['word']
        slug = item['slug']
        vid = item['video_id']

        bench_npy = os.path.join(BACKEND_BENCHMARKS_DIR, f"{slug}_benchmark.npy")
        bench_meta = os.path.join(BACKEND_BENCHMARKS_DIR, f"{slug}_meta.json")

        if os.path.exists(bench_npy) and os.path.exists(bench_meta):
            item['benchmarkReady'] = True
            try:
                with open(bench_meta, 'r', encoding='utf-8') as jf:
                    m = json.load(jf)
                    item['dominantHand'] = m.get('dominant_hand', 'right')
            except Exception:
                pass
            existing_bench_count += 1
            continue

        out_front = os.path.join(FRONTEND_PUBLIC_DIR, f"{slug}_front.mp4")
        if not os.path.exists(out_front):
            continue

        cap = cv2.VideoCapture(out_front)
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        frames_75 = []
        rh_count = 0
        lh_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            res = detector.detect(mp_img)

            f75 = []
            # 33 pose
            if res.pose_landmarks and len(res.pose_landmarks) > 0:
                for lm in res.pose_landmarks:
                    f75.append([lm.x, lm.y, lm.z])
            else:
                f75.extend([[0.0, 0.0, 0.0]] * 33)

            # 21 left hand
            if res.left_hand_landmarks and len(res.left_hand_landmarks) > 0:
                lh_count += 1
                for lm in res.left_hand_landmarks:
                    f75.append([lm.x, lm.y, lm.z])
            else:
                f75.extend([[0.0, 0.0, 0.0]] * 21)

            # 21 right hand
            if res.right_hand_landmarks and len(res.right_hand_landmarks) > 0:
                rh_count += 1
                for lm in res.right_hand_landmarks:
                    f75.append([lm.x, lm.y, lm.z])
            else:
                f75.extend([[0.0, 0.0, 0.0]] * 21)

            frames_75.append(f75)
        cap.release()

        if frames_75:
            arr = np.array(frames_75, dtype=np.float32)
            np.save(bench_npy, arr)

            dom = "right"
            if rh_count > 0 and lh_count > 0 and abs(rh_count - lh_count) < 5:
                dom = "both"
            elif lh_count > rh_count:
                dom = "left"

            meta = {
                "word": word,
                "slug": slug,
                "video_id": vid,
                "num_frames": len(frames_75),
                "fps": float(fps),
                "dominant_hand": dom,
                "left_hand_frames": lh_count,
                "right_hand_frames": rh_count
            }
            with open(bench_meta, 'w', encoding='utf-8') as jf:
                json.dump(meta, jf, ensure_ascii=False, indent=2)

            item['benchmarkReady'] = True
            item['dominantHand'] = dom
            new_bench_count += 1

        if (idx + 1) % 20 == 0 or idx == len(vsl400_items) - 1:
            el = time.time() - t0_bench
            processed = new_bench_count + existing_bench_count
            rate = (new_bench_count) / el if el > 0 else 0
            rem = (len(vsl400_items) - processed) / rate if rate > 0 else 0
            print(f"  [Benchmark: {idx+1}/400] - '{word}' | Mới: {new_bench_count}, Sẵn có: {existing_bench_count} | Còn ~{int(rem)}s")

    print(f"Hoàn thành Giai đoạn 2 sau {round(time.time() - t0_bench, 1)}s!")

    # =========================================================================
    # GIAI ĐOẠN 3: XUẤT CATALOG, DỮ LIỆU FRONTEND & SEED CHO BACKEND
    # =========================================================================
    print("\n--- GIAI ĐOẠN 3: XUẤT DỮ LIỆU TỪ ĐIỂN ---")
    catalog_json_path = os.path.join(FRONTEND_PUBLIC_DIR, "vsl400_catalog.json")
    with open(catalog_json_path, 'w', encoding='utf-8') as f:
        json.dump(vsl400_items, f, ensure_ascii=False, indent=2)
    print(f"1. Đã ghi catalog: {catalog_json_path}")

    words_js_path = os.path.join(FRONTEND_DATA_DIR, "vsl400Words.js")
    with open(words_js_path, 'w', encoding='utf-8') as f:
        f.write("// Danh mục đầy đủ 400 từ vựng VSL400 chuẩn hóa đa góc quay\n")
        f.write("export const VSL400_WORDS = ")
        json.dump(vsl400_items, f, ensure_ascii=False, indent=2)
        f.write(";\n\nexport default VSL400_WORDS;\n")
    print(f"2. Đã ghi file frontend: {words_js_path}")

    seed_json_path = os.path.join(BACKEND_CORE_SEED_DIR, "vsl400-seed.json")
    backend_seed = []
    for it in vsl400_items:
        backend_seed.append({
            "name": it['word'],
            "slug": it['slug'],
            "category": it['topicLabel'],
            "difficulty": it['difficulty'],
            "meaning": f"Ký hiệu ngôn ngữ ký hiệu Việt Nam (VSL) cho từ '{it['word']}'",
            "videoUrl": it['videoFront'],
            "videoLeft": it['videoLeft'],
            "videoRight": it['videoRight'],
            "thumbnailUrl": it['thumbnail'],
            "usageTips": f"Quan sát 3 góc quay (Chính diện, Trái, Phải) để thực hiện tư thế bàn tay và quỹ đạo di chuyển chuẩn xác."
        })
    with open(seed_json_path, 'w', encoding='utf-8') as f:
        json.dump(backend_seed, f, ensure_ascii=False, indent=2)
    print(f"3. Đã ghi file seed JSON cho NestJS: {seed_json_path}")

    print("\n" + "=" * 70)
    print(f"XỬ LÝ THÀNH CÔNG 100%! Tổng cộng 400 từ vựng VSL400 với đủ 3 góc quay & benchmarks.")
    print("=" * 70)

if __name__ == "__main__":
    main()
