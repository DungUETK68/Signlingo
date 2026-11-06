# ==========================================
# 1. Build Stage
# ==========================================
FROM node:22-slim AS builder

WORKDIR /app

# Cấu hình retry cho npm để chống timeout
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# 2. Production Nginx Stage
# ==========================================
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
