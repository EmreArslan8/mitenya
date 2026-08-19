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
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL \
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

# Gerekli dosyaları kopyala
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# next.config.ts runtime'da da gerekli (redirects/rewrites/headers okunması için)
COPY --from=builder /app/next.config.ts ./next.config.ts

ENV PORT=3000
EXPOSE 3000

CMD ["yarn", "start"]
