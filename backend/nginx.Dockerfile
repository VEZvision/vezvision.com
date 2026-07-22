FROM nginxinc/nginx-unprivileged:1.30.3-alpine@sha256:b3f2436575bd5be7386518084d842dac414ab4962712afa31e99e0942a56e3b2
USER root
RUN apk upgrade --no-cache
USER 101
COPY deploy/hetzner/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
