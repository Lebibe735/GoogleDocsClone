# CollabDocs Backend Deployment

This guide shows how to deploy the Node.js backend using Docker.

## 🐳 Docker Deployment Options

### Option 1: Render (Recommended)

1. **Push your code to GitHub** (make sure the server folder is in the root)

2. **Sign up at [Render](https://render.com/)**

3. **Create a new Web Service:**
   - Connect your GitHub repository
   - Set **Root Directory** to: `server`
   - Set **Environment** to: `Docker`
   - Render will automatically detect the Dockerfile

4. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - Add any other environment variables your app needs

5. **Deploy!**

### Option 2: Railway

1. **Sign up at [Railway](https://railway.app/)**

2. **Create a new project:**
   - Connect your GitHub repository
   - Set the root directory to `server`
   - Railway will auto-detect the Dockerfile

3. **Add environment variables** in the Railway dashboard

4. **Deploy!**

### Option 3: Fly.io

1. **Install Fly CLI:**
   ```bash
   npm install -g @flyio/flyctl
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Deploy:**
   ```bash
   cd server
   fly launch
   ```

## 🔧 Docker Configuration

### Dockerfile Structure:
```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

### Important Notes:

1. **Root Directory**: When deploying, specify `server/` as the root directory
2. **Dockerfile Path**: The Dockerfile is located at `server/Dockerfile`
3. **Port**: The app runs on port 3001
4. **Environment Variables**: Make sure to set all required environment variables

## 🌐 Connecting Frontend to Backend

After deploying the backend, update your frontend's API_BASE URL in `client/script.js`:

```javascript
const API_BASE = "https://your-backend-url.onrender.com";
// or
const API_BASE = "https://your-backend-url.railway.app";
// or
const API_BASE = "https://your-backend-url.fly.dev";
```

## 📁 Project Structure for Deployment

```
your-repo/
├── client/           # Frontend (deploy to Vercel)
│   ├── index.html
│   ├── script.js
│   └── ...
└── server/           # Backend (deploy with Docker)
    ├── Dockerfile
    ├── package.json
    ├── server.js
    └── ...
```

## 🚀 Quick Deploy Commands

### Render:
```bash
# Just push to GitHub and use Render dashboard
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Railway:
```bash
# Same as Render - use dashboard
```

### Fly.io:
```bash
cd server
fly launch
fly deploy
``` 