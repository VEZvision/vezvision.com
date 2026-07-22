FROM node:22-alpine3.23@sha256:8516dce0483394d5708d4b2ee6cacb79fb1d617ea4e2787c2120bcca92ce372e
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
    && rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx
COPY backend/server.mjs ./server.mjs
COPY backend/email-templates.mjs ./email-templates.mjs
COPY backend/resend-email.mjs ./resend-email.mjs
COPY public/email-logo.png ./email-logo.png
ENV EMAIL_LOGO_PATH=/app/email-logo.png
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
