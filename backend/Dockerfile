FROM node:22-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install --omit=dev --ignore-scripts
COPY backend/server.mjs ./server.mjs
COPY backend/email-templates.mjs ./email-templates.mjs
COPY backend/resend-email.mjs ./resend-email.mjs
COPY public/email-logo.png ./email-logo.png
ENV EMAIL_LOGO_PATH=/app/email-logo.png
USER node
EXPOSE 3000
CMD ["npm", "start"]
