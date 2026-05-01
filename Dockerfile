# ===============================
# 1) Build stage
# ===============================
FROM node:22.12.0-alpine AS builder

WORKDIR /app

# Sadece yarn kullandığımız için
COPY package.json yarn.lock ./

# Bağımlılıkları kur
RUN yarn install --frozen-lockfile

# Projenin geri kalanını kopyala
COPY . .

# Next.js production build
RUN NODE_OPTIONS="--max-old-space-size=4096" yarn build


# ===============================
# 2) Runtime stage
# ===============================
FROM node:22.12.0-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl

# Gerekli dosyaları kopyala
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/cache-handler.js ./cache-handler.js

EXPOSE 3000

CMD ["yarn", "start"]
