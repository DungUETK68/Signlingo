# ==========================================
# 1. Build Stage
# ==========================================
FROM node:22-slim AS builder

WORKDIR /app

# Cấu hình retry cho npm để chống rớt mạng / ECONNRESET
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./

RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src/ ./src/

RUN npm run build

# Loại bỏ devDependencies để thu gọn node_modules cho bản production
RUN npm prune --production && npm cache clean --force

# ==========================================
# 2. Production Stage (Siêu nhẹ & Không cần tải lại npm)
# ==========================================
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
