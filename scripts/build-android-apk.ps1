# ==============================================================================
# Signlingo Android APK Build & USB Install Helper Script (Windows PowerShell)
# ==============================================================================
# Cách dùng:
#   .\scripts\build-android-apk.ps1            -> Build frontend mobile + sync + biên dịch app-debug.apk
#   .\scripts\build-android-apk.ps1 -Install   -> Build APK và cài thẳng lên điện thoại Android đang cắm cáp USB
#   .\scripts\build-android-apk.ps1 -Release   -> Biên dịch bản Release (chưa ký keystore)
# ==============================================================================

param(
    [switch]$Install,
    [switch]$Release,
    [switch]$SkipWebBuild
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $RepoRoot "frontend"
$AndroidDir = Join-Path $FrontendDir "android"

# 1. Tự động cấu hình JAVA_HOME (ưu tiên JDK 21)
if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME "bin\javac.exe"))) {
    $jdkCandidates = @(
        "C:\Program Files\Java\jdk-21",
        "C:\Program Files\Android\Android Studio\jbr",
        "C:\Program Files\Eclipse Adoptium\jdk-21*"
    )
    foreach ($cand in $jdkCandidates) {
        $resolved = Get-Item $cand -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($resolved -and (Test-Path (Join-Path $resolved.FullName "bin\javac.exe"))) {
            $env:JAVA_HOME = $resolved.FullName
            break
        }
    }
}

if (-not $env:JAVA_HOME) {
    Write-Error "Không tìm thấy JDK 21. Vui lòng cài đặt JDK 21 và thiết lập biến môi trường JAVA_HOME."
    exit 1
}

# 2. Tự động cấu hình ANDROID_HOME
if (-not $env:ANDROID_HOME -or -not (Test-Path $env:ANDROID_HOME)) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $defaultSdk) {
        $env:ANDROID_HOME = $defaultSdk
        $env:ANDROID_SDK_ROOT = $defaultSdk
    }
}

if (-not $env:ANDROID_HOME -or -not (Test-Path $env:ANDROID_HOME)) {
    Write-Error "Không tìm thấy Android SDK tại $env:LOCALAPPDATA\Android\Sdk. Vui lòng cài Android Studio hoặc Android Command-Line Tools."
    exit 1
}

$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

# Đảm bảo file local.properties trỏ đúng Android SDK
$escapedSdk = $env:ANDROID_HOME.Replace("\", "\\")
Set-Content -Path (Join-Path $AndroidDir "local.properties") -Value "sdk.dir=$escapedSdk" -Encoding ASCII

Write-Host "☕ JAVA_HOME    = $env:JAVA_HOME" -ForegroundColor Cyan
Write-Host "🤖 ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Cyan

# 3. Build bundle Web tối ưu cho Mobile và đồng bộ sang dự án Android Capacitor
if (-not $SkipWebBuild) {
    Write-Host "`n📦 Bước 1/2: Đóng gói Frontend Mobile (dist-mobile) & Sync Capacitor..." -ForegroundColor Yellow
    Push-Location $FrontendDir
    try {
        npm run mobile:sync
        if ($LASTEXITCODE -ne 0) { throw "Lỗi khi chạy npm run mobile:sync" }
    } finally {
        Pop-Location
    }
}

# 4. Biên dịch file APK bằng Gradle Wrapper
# Xử lý đường dẫn Windows có ký tự tiếng Việt (VD: "Dự án") bằng NTFS Junction thuần ASCII
# giúp gradlew.bat & Android AAPT2 hoạt động 100% ổn định mà vẫn xuất APK về đúng thư mục gốc
$gradleWorkDir = $AndroidDir
if ($AndroidDir -match "[^\x00-\x7F]") {
    $asciiJunction = Join-Path $env:LOCALAPPDATA "SignlingoWorkspace"
    if (Test-Path $asciiJunction) {
        $existingItem = Get-Item $asciiJunction -Force
        if ($existingItem.LinkType -eq "Junction") {
            [System.IO.Directory]::Delete($asciiJunction)
        }
    }
    if (-not (Test-Path $asciiJunction)) {
        New-Item -ItemType Junction -Path $asciiJunction -Target $RepoRoot | Out-Null
    }
    $gradleWorkDir = Join-Path $asciiJunction "frontend\android"
    Write-Host "🔗 Sử dụng đường dẫn ASCII ánh xạ cho Gradle: $gradleWorkDir" -ForegroundColor DarkCyan
}

$gradleTask = if ($Release) { "assembleRelease" } else { "assembleDebug" }
Write-Host "`n🛠️ Bước 2/2: Biên dịch Android APK (.\gradlew.bat $gradleTask)..." -ForegroundColor Yellow

Push-Location $gradleWorkDir
try {
    & .\gradlew.bat $gradleTask
    if ($LASTEXITCODE -ne 0) { throw "Lỗi biên dịch Gradle ($gradleTask)" }
} finally {
    Pop-Location
}

$apkRelPath = if ($Release) {
    "app\build\outputs\apk\release\app-release-unsigned.apk"
} else {
    "app\build\outputs\apk\debug\app-debug.apk"
}
$apkFullPath = Join-Path $AndroidDir $apkRelPath

if (-not (Test-Path $apkFullPath)) {
    Write-Error "Không tìm thấy file APK đầu ra tại: $apkFullPath"
    exit 1
}

$sizeMB = [math]::Round((Get-Item $apkFullPath).Length / 1MB, 2)
Write-Host "`n✅ BIÊN DỊCH APK THÀNH CÔNG!" -ForegroundColor Green
Write-Host "   📱 File APK : $apkFullPath" -ForegroundColor Green
Write-Host "   📏 Dung lượng: $sizeMB MB" -ForegroundColor Green

# 5. Tự động cài đặt và mở ứng dụng trên điện thoại Android cắm USB (nếu truyền -Install)
if ($Install) {
    Write-Host "`n🔌 Đang kiểm tra điện thoại Android kết nối qua USB (ADB)..." -ForegroundColor Yellow
    $devices = & adb devices
    Write-Host $devices
    $connected = $devices | Select-String -Pattern "\tdevice$"
    if (-not $connected) {
        Write-Warning "Chưa thấy điện thoại Android ở trạng thái 'device'."
        Write-Host "👉 Hãy kiểm tra:" -ForegroundColor Yellow
        Write-Host "   1. Cắm cáp USB truyền dữ liệu giữa điện thoại và máy tính."
        Write-Host "   2. Trên điện thoại: Cài đặt -> Giới thiệu điện thoại -> Bấm 7 lần vào 'Số bản dựng' để bật Tùy chọn nhà phát triển."
        Write-Host "   3. Vào Tùy chọn nhà phát triển -> Bật 'Gỡ lỗi USB (USB Debugging)'."
        Write-Host "   4. Nhấn 'Cho phép' (Allow) trên thông báo xác nhận gỡ lỗi USB hiện lên trên màn hình điện thoại."
        exit 1
    }

    Write-Host "📲 Đang cài đặt Signlingo lên điện thoại..." -ForegroundColor Cyan
    & adb install -r $apkFullPath
    if ($LASTEXITCODE -ne 0) { throw "Lỗi khi cài đặt APK qua ADB." }

    Write-Host "🚀 Đang tự động mở ứng dụng Signlingo trên điện thoại..." -ForegroundColor Green
    & adb shell monkey -p vn.id.signlingo.app -c android.intent.category.LAUNCHER 1 | Out-Null
    Write-Host "🎉 Hoàn tất! Ứng dụng Signlingo đã sẵn sàng trên điện thoại của bạn." -ForegroundColor Green
}
