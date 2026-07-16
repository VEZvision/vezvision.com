FROM node:22-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install --omit=dev --ignore-scripts
COPY backend/server.mjs ./server.mjs
COPY backend/email-templates.mjs ./email-templates.mjs
USER node
EXPOSE 3000
CMD ["npm", "start"]
