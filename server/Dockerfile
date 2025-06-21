FROM node:20

WORKDIR /app

# Kopjo vetëm paketat
COPY server/package*.json ./

# Instalo varësitë
RUN npm install

# Kopjo backend-in
COPY server/ .

# Kopjo client-in brenda në /app/client
COPY client/ ./client

# Aplikacioni dëgjon në portin 3001
EXPOSE 3001

CMD ["node", "server.js"]
