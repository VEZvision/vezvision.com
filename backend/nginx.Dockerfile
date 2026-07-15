FROM nginx:1.27-alpine
COPY deploy/hetzner/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
