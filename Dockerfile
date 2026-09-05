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

# NEXT_PUBLIC_* değişkenleri build anında koda gömülür → compose'dan build args
# olarak gelir. Coolify bunları otomatik enjekte ediyordu; burada elle geçiyoruz.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRAPI_URL
# R2/CDN taban adresi public'tir; .env gelmese de resimler kırılmasın diye default veriyoruz
ARG NEXT_PUBLIC_R2_BASE_URL=https://cdn.mitenya.com
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL \
    NEXT_PUBLIC_R2_BASE_URL=$NEXT_PUBLIC_R2_BASE_URL \
    NEXT_TELEMETRY_DISABLED=1

# Next.js production build
RUN yarn build


# ===============================
# 2) Runtime stage
# ===============================
FROM node:22.12.0-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl

# Standalone cikti: Next, sunucuyu ve yalnizca gercekten kullanilan node_modules'u
# .next/standalone icine kendisi topluyor. `next start` calismadigi icin runtime'da
# next.config.ts okunmuyor (config build'e gomulu) — src/ kopyalamaya gerek yok.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000

CMD ["node", "server.js"]
