#!/usr/bin/env bash
# ==============================================================================
# Signlingo - Automated VPS Setup & Production Deployment Script
# Hỗ trợ hệ điều hành: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS / Debian 12
# ==============================================================================

set -e

echo "=============================================================================="
echo "🌟 BẮT ĐẦU TRIỂN KHAI HỆ THỐNG HỌC NGÔN NGỮ KÝ HIỆU SIGNLINGO LÊN VPS"
echo "=============================================================================="

echo "🚀 [1/5] Đang cập nhật hệ điều hành và các gói tiện ích..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw openssl

# Tự động tạo 2GB Swap file nếu RAM máy chủ nhỏ (< 3GB) để chống tràn bộ nhớ khi build Docker
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}' || echo "4000000")
if [ "$TOTAL_RAM_KB" -lt 3145728 ]; then
    if [ ! -f /swapfile ]; then
        echo "🧠 [Bộ nhớ ảo] Phát hiện RAM < 3GB, đang tự động tạo 2GB Swap file để đảm bảo build Docker 100% không bị đứng..."
        sudo fallocate -l 2G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        echo "✅ Đã kích hoạt 2GB Swap file thành công!"
    fi
fi

echo "🛡️ [2/5] Thiết lập tường lửa UFW an toàn (Mở cổng 22, 80, 443)..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

echo "🐳 [3/5] Cài đặt Docker & Docker Compose Engine chính thức..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker đã được cài đặt thành công."
else
    echo "✅ Docker đã có sẵn trên máy chủ."
fi

echo "⚙️ [4/5] Thiết lập file cấu hình môi trường .env an toàn..."
if [ ! -f .env ]; then
    echo "Tạo file .env từ .env.example..."
    cp .env.example .env
    RANDOM_JWT=$(openssl rand -hex 32 2>/dev/null || echo "signlingo_prod_jwt_$(date +%s)")
    RANDOM_PASS=$(openssl rand -hex 16 2>/dev/null || echo "db_pass_$(date +%s)")
    sed -i "s/signlingo_super_secret_jwt_key_2026_very_secure/$RANDOM_JWT/g" .env
    sed -i "s/DB_PASSWORD=postgres/DB_PASSWORD=$RANDOM_PASS/g" .env
    echo "✅ Đã tự động tạo JWT Secret và Database Password bảo mật cao."
else
    echo "✅ Đã tìm thấy file .env hiện có."
fi

echo "🚀 [5/5] Đang tải & build toàn bộ các container Signlingo (Core, AI, Frontend, PostgreSQL)..."
docker compose up -d --build

echo ""
echo "=============================================================================="
echo "🎉 CHÚC MỪNG! HỆ THỐNG SIGNLINGO ĐÃ ĐƯỢC TRIỂN KHAI THÀNH CÔNG!"
echo "=============================================================================="
docker compose ps
echo ""
PUBLIC_IP=$(curl -s ifconfig.me || echo "IP_CỦA_MÁY_CHỦ")
echo "🌐 Bạn có thể truy cập website ngay tại:"
echo "   http://$PUBLIC_IP"
echo ""
echo "👉 Khi đã trỏ tên miền qua Cloudflare, website sẽ tự động chạy HTTPS an toàn!"
echo "=============================================================================="

