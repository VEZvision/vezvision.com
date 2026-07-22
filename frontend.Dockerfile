FROM node:22-bookworm-slim@sha256:6c74791e557ce11fc957704f6d4fe134a7bc8d6f5ca4403205b2966bd488f6b3 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npx playwright install --with-deps chromium
COPY . .
ARG VITE_API_URL
ARG VITE_SITE_URL
ARG VITE_PUBLIC_ASSETS_URL
ARG VITE_SENTRY_DSN
ARG VITE_GA_ID
ARG VITE_TURNSTILE_SITE_KEY
ARG VITE_ENABLE_SMOOTH_SCROLL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_PUBLIC_ASSETS_URL=$VITE_PUBLIC_ASSETS_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_GA_ID=$VITE_GA_ID
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
ENV VITE_ENABLE_SMOOTH_SCROLL=$VITE_ENABLE_SMOOTH_SCROLL
RUN test -n "$VITE_TURNSTILE_SITE_KEY" || (echo "VITE_TURNSTILE_SITE_KEY is required for a production image" >&2; exit 1)
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30.3-alpine@sha256:b3f2436575bd5be7386518084d842dac414ab4962712afa31e99e0942a56e3b2
USER root
RUN apk upgrade --no-cache
USER 101
COPY --from=build /app/generated/frontend-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
