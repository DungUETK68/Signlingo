# 📱 Hướng Dẫn Cài Đặt & Kiểm Thử Ứng Dụng Di Động Signlingo (Android)

> **Dành cho:** Giảng viên hướng dẫn & Sinh viên phát triển dự án **Signlingo**  
> **Nền tảng:** Android 7.0+ (`minSdk 24`, `targetSdk 36`) — Đóng gói bằng **Capacitor 8** kết nối trực tiếp với hệ thống Backend Production (`https://signlingo.id.vn`).

---

## 1. Tổng Quan Kiến Trúc Phiên Bản Mobile

Phiên bản Android của **Signlingo** nằm trực tiếp trong Monorepo tại thư mục `frontend/android/`, sử dụng chung 100% Backend Core (NestJS + PostgreSQL) và Backend AI (FastAPI + FastDTW) mà không làm thay đổi bất kỳ API nào của bản Web:

- **App ID:** `vn.id.signlingo.app`
- **Tên ứng dụng:** `Signlingo`
- **Máy chủ kết nối mặc định:** `https://signlingo.id.vn`
  - Core Business API: `https://signlingo.id.vn/api`
  - AI Evaluation API: `https://signlingo.id.vn/ai`
  - Video bài học VSL400 & Video cộng đồng: Stream trực tiếp qua HTTPS (`/vsl400_videos/...`, `/uploads/...`) giúp file APK nhẹ, cài đặt nhanh.
- **Nhận diện khung xương AI (MediaPipe Holistic Lite):** Được đóng gói nội bộ ngay trong APK (`dist-mobile/mediapipe/holistic/`) giúp chạy thời gian thực 30–60 FPS không lỗi CORS và không tốn băng thông tải lại mô hình AI.
- **Tính năng Native đã tích hợp:**
  - Quyền Camera Native (`android.permission.CAMERA`) cho phòng **Luyện tập AI**, **Luyện tập câu VSL**, và **Thử thách phản xạ 5 giây**.
  - Tự động phát video bài học mẫu (`mediaPlaybackRequiresUserGesture = false`) & tăng tốc phần cứng WebGL/WebAssembly.
  - Biểu tượng ứng dụng **Adaptive Icon** chuẩn Android 8–15 và màn hình chờ **Splash Screen** thương hiệu Signlingo.
  - Đồng bộ thanh trạng thái **Status Bar** và hỗ trợ vùng an toàn **Safe Area** cho màn hình tai thỏ / Android 15+ Edge-to-Edge.
  - Xử lý **nút Back vật lý / cử chỉ vuốt quay lại** trên Android (đóng Drawer/Modal -> quay về tab gốc -> bấm Back 2 lần để thoát an toàn).

---

## 2. Cách 1: Cài Đặt Trực Tiếp File APK (Nhanh Nhất Cho Giảng Viên)

Sau khi biên dịch, file cài đặt nằm tại:
```text
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### Các bước cài trên điện thoại Android:
1. Sao chép file `app-debug.apk` sang điện thoại Android (qua cáp USB, Zalo, Google Drive, hoặc Telegram).
2. Mở file `app-debug.apk` trên điện thoại bằng trình quản lý tệp (*Files / Tệp của bạn*).
3. Nếu điện thoại hiển thị cảnh báo bảo mật *"Không cho phép cài đặt ứng dụng không rõ nguồn gốc"*, chọn **Cài đặt (Settings)** -> bật **Cho phép từ nguồn này (Allow from this source)** -> quay lại bấm **Cài đặt (Install)**.
4. Mở ứng dụng **Signlingo** trên màn hình chính.
5. Khi truy cập tab **Luyện tập AI** hoặc **Thử thách**, bấm **Cho phép (Allow)** khi Android hỏi quyền sử dụng **Camera**.

---

## 3. Cách 2: Cài Đặt & Chạy Thử Qua Cáp USB Từ Antigravity IDE (Khuyên Dùng Khi Phát Triển)

### Bước 1: Bật chế độ Gỡ lỗi USB trên điện thoại Android
1. Trên điện thoại, vào **Cài đặt (Settings)** -> **Giới thiệu điện thoại (About phone)** -> **Thông tin phần mềm (Software information)**.
2. Chạm liên tiếp **7 lần** vào mục **Số bản dựng (Build number)** (hoặc *Phiên bản MIUI / HyperOS* trên Xiaomi) cho tới khi có thông báo *"Bạn đã là nhà phát triển"*.
3. Quay lại **Cài đặt** -> mở **Tùy chọn nhà phát triển (Developer options)** -> bật **Gỡ lỗi USB (USB debugging)**.
4. Cắm cáp USB kết nối điện thoại với máy tính. Khi màn hình điện thoại hiện hộp thoại *"Cho phép gỡ lỗi USB?"*, chọn **Luôn cho phép từ máy tính này** -> nhấn **Cho phép (Allow)**.

### Bước 2: Build & Cài đặt tự động chỉ với 1 lệnh
Tại thư mục gốc dự án (`Signlingo/`), mở Terminal và chạy:

```powershell
# Biên dịch lại Frontend Mobile, sync Capacitor, build APK và tự động cài + mở trên điện thoại
npm --prefix frontend run mobile:install
```

Hoặc chỉ build ra file APK mà không cần cắm điện thoại:
```powershell
npm --prefix frontend run mobile:apk
```

### Kiểm tra thiết bị đang kết nối & xem log debug (tùy chọn)
```powershell
# Liệt kê điện thoại đang kết nối qua USB
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices

# Mở Chrome trên máy tính và truy cập chrome://inspect/#devices để soi Console / Network của App!
```

---

## 4. Cách 3: Mở Dự Án Bằng Android Studio (Nếu Cần Chạy Máy Ảo Emulator)

Nếu muốn chạy trên máy ảo Android (AVD) hoặc ký file phát hành Release (`.aab` / `.apk` cho Google Play):

```powershell
# 1. Đồng bộ mã nguồn web mới nhất sang Android
npm --prefix frontend run mobile:sync

# 2. Mở thư mục frontend/android trực tiếp bằng Android Studio
npm --prefix frontend run mobile:open
```

Trong Android Studio, chờ Gradle Sync hoàn tất rồi bấm nút **Run (▶)** để chạy trên máy ảo hoặc điện thoại thật.

---

## 5. Quy Trình Cập Nhật Code Sau Này

Bất cứ khi nào bạn chỉnh sửa giao diện React trong `frontend/src/`:
1. **Bản Web** không bị ảnh hưởng (`npm --prefix frontend run build` vẫn build vào `frontend/dist/`).
2. Để cập nhật thay đổi lên **App Android**, chỉ cần chạy:
   ```powershell
   npm --prefix frontend run mobile:install
   ```
   *(Hoặc `npm --prefix frontend run mobile:apk` để xuất file APK mới).*

---

## 6. Xử Lý Sự Cố Thường Gặp

| Tình huống | Cách khắc phục |
| :--- | :--- |
| Camera không mở hoặc báo lỗi quyền | Vào **Cài đặt điện thoại -> Ứng dụng -> Signlingo -> Quyền -> Camera -> Cho phép trong khi dùng ứng dụng**. |
| Điện thoại cắm USB nhưng `adb devices` trống | Đổi sang cáp USB có hỗ trợ truyền dữ liệu (không dùng cáp chỉ sạc), chuyển chế độ USB trên điện thoại sang **Truyền tệp (File Transfer / MTP)** và xác nhận lại hộp thoại *Cho phép gỡ lỗi USB*. |
| Video mẫu không tải được | Kiểm tra kết nối Internet (Wi-Fi/4G) trên điện thoại vì 400 video bài học VSL được phát trực tuyến từ `https://signlingo.id.vn`. |
| Muốn kiểm thử với Backend chạy trên máy tính cục bộ | Mở Chrome DevTools (`chrome://inspect`) -> gõ `localStorage.setItem('signlingo_mobile_server_url', 'http://<IP_LAN_MAY_TINH>')` rồi reload app. Xóa key này để quay về `https://signlingo.id.vn`. |
