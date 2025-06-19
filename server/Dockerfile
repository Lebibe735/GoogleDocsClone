# Përdor imazhin zyrtar të Node.js nga Docker Hub
FROM node:20

# Vendos direktorinë e punës brenda container-it
WORKDIR /app

# Kopjo vetëm paketat për të cache-uar më mirë dependencat
COPY package*.json ./

# Instalo varësitë (do përdorë cache nëse nuk ka ndryshime)
RUN npm install

# Kopjo pjesën tjetër të aplikacionit
COPY . .

# Eksporto portin që aplikacioni dëgjon (sigurohu që është 3001 në server.js)
EXPOSE 3001

# Komanda për nisjen e aplikacionit
CMD ["node", "server.js"]
