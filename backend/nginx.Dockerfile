FROM nginxinc/nginx-unprivileged:1.30.3-alpine
COPY deploy/hetzner/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
