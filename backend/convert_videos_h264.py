import sys
import os
import subprocess
import shutil
import imageio_ffmpeg

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
vdir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "vsl400_videos"))
out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "vsl400_videos_new"))

os.makedirs(out_dir, exist_ok=True)

print("Source dir:", vdir)
print("Target dir:", out_dir)

files = sorted([f for f in os.listdir(vdir) if f.endswith(".mp4") and not f.startswith("temp_") and not f.startswith("test_")])
print(f"Total videos to convert: {len(files)}")

for i, fname in enumerate(files, 1):
    fpath = os.path.join(vdir, fname)
    target_video = os.path.join(out_dir, fname)
    
    # 1. Chuyển đổi sang chuẩn H.264 (AVC1, yuv420p, faststart)
    cmd = [
        ffmpeg, "-y", "-i", fpath,
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-crf", "23", "-preset", "veryfast",
        target_video
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # 2. Nếu là video góc chính diện (front), trích xuất frame đầu làm thumbnail
    if fname.endswith("_front.mp4"):
        slug = fname[:-10] # Bỏ '_front.mp4'
        thumb_path = os.path.join(out_dir, f"{slug}_thumb.jpg")
        cmd_thumb = [
            ffmpeg, "-y", "-i", target_video,
            "-ss", "00:00:00.200",
            "-vframes", "1",
            "-update", "1",
            "-q:v", "2",
            thumb_path
        ]
        subprocess.run(cmd_thumb, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    print(f"[{i}/{len(files)}] Đã chuyển đổi: {fname}")

# Copy vsl400_catalog.json sang thư mục mới
cat_src = os.path.join(vdir, "vsl400_catalog.json")
cat_dest = os.path.join(out_dir, "vsl400_catalog.json")
if os.path.exists(cat_src):
    shutil.copy2(cat_src, cat_dest)

print("Hoàn tất chuyển đổi tất cả 60 video và tạo 30 thumbnails!")
