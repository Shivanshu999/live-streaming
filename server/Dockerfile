FROM node:20-alpine

WORKDIR /app/server

# Install ffmpeg ONCE at build time
RUN apk add --no-cache ffmpeg

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]