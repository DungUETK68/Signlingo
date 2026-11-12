#!/usr/bin/env bash
# ==============================================================================
# Signlingo - Automated VPS Setup & Production Deployment Script
# Hỗ trợ hệ điều hành: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS / Debian 12
# ==============================================================================

set -e

echo "=============================================================================="
echo "🌟 BẮT ĐẦU TRIỂN KHAI HỆ THỐNG HỌC NGÔN NGỮ KÝ HIỆU SIGNLINGO LÊN VPS"
echo "=============================================================================="

echo "🚀 [1/5] Đang cấu hình DNS và cập nhật hệ điều hành..."
# Đảm bảo phân giải tên miền DNS hoạt động ổn định (hỗ trợ cả DNS quốc tế và DNS nội địa VNPT/Viettel)
cat << 'EOF' > /etc/resolv.conf
nameserver 8.8.8.8
nameserver 1.1.1.1
nameserver 203.162.4.190
nameserver 203.162.4.191
nameserver 203.113.131.1
EOF

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

echo "🛡️ [2/5] Thiết lập tường lửa UFW an toàn..."
# Tự động nhận diện cổng SSH đang chạy (tránh lock-out đối với nhà mạng đổi cổng như iNET port 24700)
CURRENT_SSH_PORT=$(ss -tlnp 2>/dev/null | grep -E 'sshd|ssh' | awk '{print $4}' | awk -F':' '{print $NF}' | head -n 1 || echo "")
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 24700/tcp
if [ -n "$CURRENT_SSH_PORT" ]; then
    sudo ufw allow "$CURRENT_SSH_PORT"/tcp
fi
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
    echo "Tạo file .env sản xuất bảo mật..."
    RANDOM_JWT=$(openssl rand -hex 32 2>/dev/null || echo "signlingo_prod_jwt_$(date +%s)")
    RANDOM_PASS=$(openssl rand -hex 16 2>/dev/null || echo "db_pass_$(date +%s)")
    cat << EOF > .env
# PostgreSQL Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=$RANDOM_PASS
DB_NAME=signlingo

# NestJS Backend Core Configuration
PORT=3000
JWT_SECRET=$RANDOM_JWT
JWT_EXPIRATION=7d

# Python AI Service Configuration
AI_PORT=8000
AI_SERVICE_URL=http://backend-ai:8000
EOF
    echo "✅ Đã tự động tạo file .env với JWT Secret và Database Password bảo mật cao."
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

