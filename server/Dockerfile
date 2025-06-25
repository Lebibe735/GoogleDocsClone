FROM node:20-alpine

WORKDIR /app

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy server files
COPY server/ .

# Expose port 3001
EXPOSE 3001

CMD ["node", "server.js"]
