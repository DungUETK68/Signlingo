# ==============================================================================
# Signlingo Android APK Build & USB Install Helper Script (Windows PowerShell)
# ==============================================================================
# Usage:
#   .\scripts\build-android-apk.ps1            -> Build mobile frontend + sync + assembleDebug APK
#   .\scripts\build-android-apk.ps1 -Install   -> Build APK and install/launch on USB Android phone
#   .\scripts\build-android-apk.ps1 -Release   -> Assemble unsigned release APK
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

# 1. Locate JDK 21 automatically
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
    Write-Error "JDK 21 not found. Please install JDK 21 and set JAVA_HOME."
    exit 1
}

# 2. Locate Android SDK automatically
if (-not $env:ANDROID_HOME -or -not (Test-Path $env:ANDROID_HOME)) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $defaultSdk) {
        $env:ANDROID_HOME = $defaultSdk
        $env:ANDROID_SDK_ROOT = $defaultSdk
    }
}

if (-not $env:ANDROID_HOME -or -not (Test-Path $env:ANDROID_HOME)) {
    Write-Error "Android SDK not found at $env:LOCALAPPDATA\Android\Sdk."
    exit 1
}

$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

# Write local.properties pointing to Android SDK
$escapedSdk = $env:ANDROID_HOME.Replace("\", "\\")
Set-Content -Path (Join-Path $AndroidDir "local.properties") -Value "sdk.dir=$escapedSdk" -Encoding ASCII

Write-Host "[Signlingo] JAVA_HOME    = $env:JAVA_HOME" -ForegroundColor Cyan
Write-Host "[Signlingo] ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Cyan

# 3. Build optimized mobile web bundle and sync Capacitor Android
if (-not $SkipWebBuild) {
    Write-Host "`n[Step 1/2] Building Frontend Mobile (dist-mobile) and syncing Capacitor..." -ForegroundColor Yellow
    Push-Location $FrontendDir
    try {
        npm run mobile:sync
        if ($LASTEXITCODE -ne 0) { throw "Failed running npm run mobile:sync" }
    } finally {
        Pop-Location
    }
}

# 4. Assemble APK via Gradle Wrapper
# Map non-ASCII workspace paths (e.g., Vietnamese folder names) via an ASCII NTFS Junction
# so gradlew.bat and Android AAPT2 compile cleanly while writing outputs back to the repo
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
    Write-Host "[Signlingo] Using ASCII junction path for Gradle: $gradleWorkDir" -ForegroundColor DarkCyan
}

$gradleTask = if ($Release) { "assembleRelease" } else { "assembleDebug" }
Write-Host "`n[Step 2/2] Building Android APK (.\gradlew.bat $gradleTask)..." -ForegroundColor Yellow

Push-Location $gradleWorkDir
try {
    & .\gradlew.bat $gradleTask
    if ($LASTEXITCODE -ne 0) { throw "Gradle build failed ($gradleTask)" }
} finally {
    Pop-Location
}

$apkRelPath = if ($Release) {
    $signedCandidate = Join-Path $AndroidDir "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $signedCandidate) {
        $namedRelease = Join-Path $AndroidDir "app\build\outputs\apk\release\signlingo-release.apk"
        Copy-Item -Path $signedCandidate -Destination $namedRelease -Force
        "app\build\outputs\apk\release\signlingo-release.apk"
    } else {
        "app\build\outputs\apk\release\app-release-unsigned.apk"
    }
} else {
    "app\build\outputs\apk\debug\app-debug.apk"
}
$apkFullPath = Join-Path $AndroidDir $apkRelPath

if (-not (Test-Path $apkFullPath)) {
    Write-Error "Output APK not found at: $apkFullPath"
    exit 1
}

$sizeMB = [math]::Round((Get-Item $apkFullPath).Length / 1MB, 2)
Write-Host "`n[SUCCESS] APK BUILD COMPLETED!" -ForegroundColor Green
Write-Host "   APK Path : $apkFullPath" -ForegroundColor Green
Write-Host "   APK Size : $sizeMB MB" -ForegroundColor Green

# 5. Optional: Install and launch on connected USB Android device
if ($Install) {
    Write-Host "`n[ADB] Checking connected USB Android devices..." -ForegroundColor Yellow
    $devices = & adb devices
    Write-Host $devices
    $connected = $devices | Select-String -Pattern "\tdevice$"
    if (-not $connected) {
        Write-Warning "No Android device in 'device' state detected."
        Write-Host "Please enable USB Debugging on your phone, connect via USB data cable, and tap Allow." -ForegroundColor Yellow
        exit 1
    }

    Write-Host "[ADB] Installing Signlingo APK on device..." -ForegroundColor Cyan
    & adb install -r $apkFullPath
    if ($LASTEXITCODE -ne 0) { throw "Failed installing APK via ADB." }

    Write-Host "[ADB] Launching Signlingo on device..." -ForegroundColor Green
    & adb shell monkey -p vn.id.signlingo.app -c android.intent.category.LAUNCHER 1 | Out-Null
    Write-Host "[DONE] Signlingo is installed and running on your Android phone." -ForegroundColor Green
}
