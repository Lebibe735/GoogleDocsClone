FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server files
COPY . .

# Expose port 3001
EXPOSE 3001

CMD ["node", "server.js"]
