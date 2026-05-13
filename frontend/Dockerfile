# syntax=docker/dockerfile:1.7

# ── Build stage ───────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ── Runtime stage (nginx) ─────────────────────────
FROM nginx:1.27-alpine
RUN apk add --no-cache curl \
    && addgroup -S app && adduser -S -G app app \
    && chown -R app:app /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -fsS http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
