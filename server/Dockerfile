FROM node:20

WORKDIR /app

<<<<<<< HEAD
# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server files
COPY . .

# Expose port 3001
=======
# Kopjo vetëm paketat
COPY server/package*.json ./

# Instalo varësitë
RUN npm install

# Kopjo backend-in
COPY server/ .

# Kopjo client-in brenda në /app/client
COPY client/ ./client

# Aplikacioni dëgjon në portin 3001
>>>>>>> 1428007ddb5566f7042aff630db0e3b92663e312
EXPOSE 3001

CMD ["node", "server.js"]
