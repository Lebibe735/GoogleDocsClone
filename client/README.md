# CollabDocs Frontend

A real-time collaborative document editor frontend built with HTML, CSS, and JavaScript.

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

### Option 2: Deploy via GitHub

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/collabdocs-frontend.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Set the root directory to `client/` (if deploying from the main repo)
   - Click "Deploy"

### Option 3: Deploy via Vercel Dashboard

1. **Zip your client folder:**
   - Select all files in the `client/` directory
   - Create a ZIP file

2. **Upload to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Choose "Upload" option
   - Upload your ZIP file
   - Deploy

## 🔧 Configuration

The deployment uses these configuration files:

- `vercel.json` - Vercel deployment configuration
- `_redirects` - URL rewriting rules
- `package.json` - Project metadata

## 🌐 Environment Variables

Make sure your backend API URL is correctly configured in `script.js`:

```javascript
const API_BASE = "https://your-backend-url.com";
```

## 📁 Project Structure

```
client/
├── index.html          # Main page
├── login.html          # Login page
├── register.html       # Registration page
├── new-document.html   # New document page
├── edit.html           # Document editor
├── script.js           # Main JavaScript
├── edit.js             # Editor JavaScript
├── vercel.json         # Vercel config
├── _redirects          # URL redirects
└── package.json        # Project config
```

## 🔗 Backend Integration

This frontend connects to a Node.js/Express backend. Make sure your backend is also deployed and the API_BASE URL is updated accordingly.

## 🎯 Features

- Real-time document collaboration
- User authentication
- Document creation and editing
- Responsive design
- Modern UI with Tailwind CSS 