# 🚀 Complete Deployment Guide & Problem Resolution

## 📋 Table of Contents
1. [Repository Structure](#repository-structure)
2. [Deployment Platforms](#deployment-platforms)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Railway)](#backend-deployment-railway)
5. [Problems Encountered & Solutions](#problems-encountered--solutions)
6. [Current Configuration](#current-configuration)
7. [Verification Steps](#verification-steps)

---

## 📦 Repository Structure

### Frontend Repository
- **GitHub URL:** `https://github.com/benedicttashkent-rgb/loyalty-frontend.git`
- **Local Path:** `d:\27\benedict_caf_loyalty`
- **Framework:** React + Vite
- **Build Command:** `npm run build`
- **Output Directory:** `build`

### Backend Repository
- **GitHub URL:** `https://github.com/benedicttashkent-rgb/loyalty-backend.git`
- **Local Path:** `d:\27\loyalty-backend`
- **Framework:** Node.js + Express
- **Entry Points:**
  - API Server: `src/index.js`
  - Telegram Bot: `src/routes/telegram-polling.js`

---

## 🌐 Deployment Platforms

### Frontend: Vercel
- **Platform:** Vercel (https://vercel.com)
- **Deployment URL:** `https://loyalty-frontend-six.vercel.app`
- **Framework Detection:** Vite (auto-detected)
- **Build Settings:**
  - Build Command: `npm run build`
  - Output Directory: `build`
  - Install Command: `npm install`

### Backend: Railway
- **Platform:** Railway (https://railway.app)
- **Deployment URL:** `https://web-production-9dbea.up.railway.app`
- **Services:** 2 separate services
  1. **API Service** - Main backend API
  2. **TGBOT Service** - Telegram bot polling

---

## 🎨 Frontend Deployment (Vercel)

### Configuration Files

#### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm run start",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!manifest\\.json|favicon\\.ico|.*\\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

#### `src/config/api.js` (CRITICAL - Hardcoded Railway URL)
```javascript
// src/config/api.js
// НИЧЕГО СЛОЖНОГО - ПРОСТО КОНСТАНТА

const API_BASE_URL = 'https://web-production-9dbea.up.railway.app/api';

export const getApiUrl = (endpoint = '') => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  console.log('🔥 API URL:', url);
  return url;
};

export default API_BASE_URL;
```

### Deployment Process
1. **Connect Repository:**
   - Vercel Dashboard → New Project
   - Import from GitHub: `benedicttashkent-rgb/loyalty-frontend`
   - Framework: Vite (auto-detected)

2. **Build Configuration:**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `build` (from `vite.config.mjs`)
   - Install Command: `npm install`

3. **Deployment:**
   - Automatic on every push to `main` branch
   - Manual redeploy available in Dashboard

---

## ⚙️ Backend Deployment (Railway)

### Service 1: API Service

#### Configuration
- **Service Name:** `BACKEND` (or similar)
- **Start Command:** `npm run start:api`
- **Procfile:** `web: npm run start:api`
- **Port:** Railway auto-assigns (typically 8080)
- **Health Check:** `GET /health`

#### `package.json` Scripts
```json
{
  "scripts": {
    "start": "node start-bot.js",
    "start:api": "node src/index.js",
    "start:bot": "node src/routes/telegram-polling.js",
    "bot": "node src/routes/telegram-polling.js"
  }
}
```

#### `Procfile`
```
web: npm run start:api
```

#### Environment Variables (Railway Dashboard)
```
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEB_APP_URL=https://loyalty-frontend-six.vercel.app
FRONTEND_URL=https://loyalty-frontend-six.vercel.app
IIKO_API_LOGIN=...
IIKO_API_PASSWORD=...
IIKO_ORGANIZATION_ID=...
AUTO_SYNC_ENABLED=false
```

### Service 2: TGBOT Service

#### Configuration
- **Service Name:** `TGBOT` (or similar)
- **Start Command:** `npm start` (runs `start-bot.js`)
- **Procfile.bot:** `web: npm start`
- **Purpose:** Telegram bot polling

#### `start-bot.js`
```javascript
require('dotenv').config();
console.log('🤖 Starting Telegram Bot Service...');
console.log('📡 Service Type: BOT');
console.log('💚 This is the bot service entry point');
require('./src/routes/telegram-polling.js');
```

#### `Procfile.bot`
```
web: npm start
```

#### Environment Variables (Railway Dashboard)
```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEB_APP_URL=https://loyalty-frontend-six.vercel.app
DATABASE_URL=postgresql://...
```

### Deployment Process
1. **Create Services:**
   - Railway Dashboard → New Project
   - Add Service → GitHub Repo: `benedicttashkent-rgb/loyalty-backend`
   - Create second service for bot

2. **Configure API Service:**
   - Set Start Command: `npm run start:api`
   - Add `Procfile` with `web: npm run start:api`
   - Add all environment variables

3. **Configure Bot Service:**
   - Set Start Command: `npm start`
   - Add `Procfile.bot` with `web: npm start`
   - Add bot-specific environment variables

4. **Deployment:**
   - Automatic on every push to `main` branch
   - Manual redeploy available in Dashboard

---

## 🐛 Problems Encountered & Solutions

### Problem 1: 405 Method Not Allowed on Frontend

#### Symptoms
- Registration requests going to `https://loyalty-frontend-six.vercel.app/api/auth/send-otp`
- Status Code: `405 Method Not Allowed`
- Error: Vercel static site cannot handle POST requests

#### Root Cause
- Frontend was using `import.meta.env.VITE_API_BASE_URL` which was `undefined` in production
- Fallback to relative path `/api/...` sent requests to Vercel instead of Railway

#### Solution
1. **Created `src/config/api.js`** with hardcoded Railway URL
2. **Replaced all `VITE_API_BASE_URL` references** with `getApiUrl()` from config
3. **Updated files:**
   - `src/pages/signup/index.jsx`
   - `src/utils/apiClient.js`
   - `src/config/restaurant.config.js`

#### Files Changed
- `src/config/api.js` (created)
- `src/pages/signup/index.jsx` (all API calls)
- `src/utils/apiClient.js` (import fix)
- `src/config/restaurant.config.js` (import fix)

---

### Problem 2: 401 Unauthorized for manifest.json

#### Symptoms
- Console error: `Manifest fetch from .../manifest.json failed, code 401`
- PWA features not working

#### Root Cause
- `vercel.json` rewrites were blocking static files
- `manifest.json` was being treated as a route

#### Solution
- Updated `vercel.json` rewrites to exclude static files:
  ```json
  "source": "/((?!manifest\\.json|favicon\\.ico|.*\\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)).*)"
  ```
- Added specific headers for `manifest.json`

---

### Problem 3: Bot Service Running API Instead of Bot

#### Symptoms
- Both Railway services running API
- Bot not responding to Telegram messages
- Logs showing API server instead of bot polling

#### Root Cause
- Railway auto-detecting wrong start command
- `npm start` was pointing to wrong script
- `package.json` had incorrect script configuration

#### Solution
1. **Created `start-bot.js`** entry point for bot
2. **Updated `package.json`:**
   - `"start": "node start-bot.js"` (for bot service)
   - `"start:api": "node src/index.js"` (for API service)
3. **Created separate Procfiles:**
   - `Procfile`: `web: npm run start:api` (API)
   - `Procfile.bot`: `web: npm start` (Bot)

---

### Problem 4: Bot Container Stopping After One Message

#### Symptoms
- Bot processes one message then stops
- Railway shows "Stopping Container"
- No continuous polling

#### Root Cause
- Polling loop not properly maintaining connection
- No heartbeat mechanism
- Process exiting after handling update

#### Solution
1. **Updated `src/routes/telegram-polling.js`:**
   - Used `setImmediate(getUpdates)` for continuous polling
   - Added heartbeat logging every 5 minutes
   - Improved error handling for 401 and 409 errors
   - Added webhook deletion on startup

2. **Key Changes:**
   ```javascript
   // Continuous polling
   setImmediate(getUpdates);
   
   // Heartbeat
   setInterval(() => {
     if (pollingActive) {
       console.log(`💓 Bot heartbeat: ${new Date().toISOString()}`);
     }
   }, 30000);
   ```

---

### Problem 5: Environment Variables Not Applying

#### Symptoms
- `import.meta.env.VITE_API_BASE_URL` showing `undefined` in production
- Requests still going to Vercel
- Environment variable set in Vercel but not working

#### Root Cause
- Vite environment variables only apply at build time
- Variable not set for Production environment
- Project not rebuilt after adding variable

#### Solution
- **NUCLEAR OPTION:** Hardcoded Railway URL in `src/config/api.js`
- Removed all `VITE_API_BASE_URL` dependencies
- All API calls now use `getApiUrl()` from config

---

### Problem 6: CORS Errors

#### Symptoms
- Browser console: `CORS policy: No 'Access-Control-Allow-Origin'`
- Requests blocked by browser

#### Root Cause
- Backend CORS not configured for Vercel domain
- `FRONTEND_URL` not set in Railway

#### Solution
1. **Backend CORS Configuration** (`src/index.js`):
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:4028',
       'https://loyalty-frontend-six.vercel.app',
       'https://*.vercel.app',
       process.env.FRONTEND_URL
     ].filter(Boolean),
     credentials: true
   }));
   ```

2. **Railway Environment Variable:**
   ```
   FRONTEND_URL=https://loyalty-frontend-six.vercel.app
   ```

---

## ⚙️ Current Configuration

### Frontend API Configuration

#### `src/config/api.js`
```javascript
const API_BASE_URL = 'https://web-production-9dbea.up.railway.app/api';

export const getApiUrl = (endpoint = '') => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  console.log('🔥 API URL:', url);
  return url;
};

export default API_BASE_URL;
```

#### Usage in Code
```javascript
import { getApiUrl } from '../../config/api';

// In signup page
const apiUrl = getApiUrl('auth/send-otp');
// Result: https://web-production-9dbea.up.railway.app/api/auth/send-otp
```

### Backend CORS Configuration

#### `src/index.js`
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:4028',
    'https://loyalty-frontend-six.vercel.app',
    'https://*.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
```

### Telegram Bot Configuration

#### `src/services/telegram/telegramBotService.js`
```javascript
constructor() {
  this.token = process.env.TELEGRAM_BOT_TOKEN;
  this.webAppUrl = process.env.TELEGRAM_WEB_APP_URL;
  
  if (!this.token) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set.');
  }
  if (!this.webAppUrl) {
    console.error('❌ TELEGRAM_WEB_APP_URL is not set.');
  }
}
```

---

## ✅ Verification Steps

### Frontend Verification

1. **Check Deployment:**
   - Visit: `https://loyalty-frontend-six.vercel.app`
   - Should load without errors

2. **Check API Configuration:**
   - Open DevTools (F12) → Console
   - Should see: `🔥 API URL: https://web-production-9dbea.up.railway.app/api/...`

3. **Test Registration:**
   - Try to register
   - Network tab should show requests to Railway, not Vercel
   - Request URL: `https://web-production-9dbea.up.railway.app/api/auth/send-otp`

4. **Check manifest.json:**
   - Visit: `https://loyalty-frontend-six.vercel.app/manifest.json`
   - Should return JSON, not 401

### Backend Verification

1. **Check API Service:**
   - Visit: `https://web-production-9dbea.up.railway.app/health`
   - Should return: `{"status":"ok",...}`

2. **Check API Endpoints:**
   - Test: `POST https://web-production-9dbea.up.railway.app/api/auth/send-otp`
   - Should return JSON response

3. **Check Bot Service:**
   - Railway Dashboard → TGBOT Service → Logs
   - Should see: `🤖 Starting Telegram Bot Polling...`
   - Should see: `💓 Bot heartbeat: ...` (every 5 minutes)

4. **Test Telegram Bot:**
   - Send `/start` to bot
   - Should receive welcome message with Web App button

---

## 📝 Key Files Reference

### Frontend
- `src/config/api.js` - API base URL configuration
- `src/pages/signup/index.jsx` - Registration page (uses `getApiUrl()`)
- `src/utils/apiClient.js` - API client utility
- `src/config/restaurant.config.js` - Restaurant config (uses API_BASE_URL)
- `vercel.json` - Vercel deployment configuration

### Backend
- `src/index.js` - API server entry point
- `src/routes/telegram-polling.js` - Bot polling service
- `start-bot.js` - Bot service entry point
- `Procfile` - API service start command
- `Procfile.bot` - Bot service start command
- `package.json` - Scripts configuration

---

## 🔄 Deployment Workflow

### Frontend (Vercel)
1. Push to `main` branch → Auto-deploy
2. Vercel builds: `npm run build`
3. Output: `build/` directory
4. Deploys to: `https://loyalty-frontend-six.vercel.app`

### Backend (Railway)
1. Push to `main` branch → Auto-deploy both services
2. API Service: Runs `npm run start:api`
3. Bot Service: Runs `npm start` (→ `start-bot.js`)
4. Deploys to: `https://web-production-9dbea.up.railway.app`

---

## 🎯 Summary

### What Works Now
✅ Frontend deployed to Vercel  
✅ Backend API deployed to Railway  
✅ Telegram bot deployed to Railway (separate service)  
✅ All API calls go to Railway (hardcoded URL)  
✅ CORS configured correctly  
✅ Bot polling continuously  
✅ manifest.json accessible  

### Current State
- **Frontend:** `https://loyalty-frontend-six.vercel.app`
- **Backend API:** `https://web-production-9dbea.up.railway.app`
- **API Base URL:** Hardcoded in `src/config/api.js`
- **No Environment Variables Needed:** All URLs hardcoded

### If Something Breaks
1. Check Railway logs for backend issues
2. Check Vercel logs for frontend build issues
3. Verify Railway URL hasn't changed
4. Update `src/config/api.js` if Railway URL changes
5. Redeploy both services

---

## 📞 Quick Reference

### URLs
- **Frontend:** https://loyalty-frontend-six.vercel.app
- **Backend:** https://web-production-9dbea.up.railway.app
- **Health Check:** https://web-production-9dbea.up.railway.app/health

### Repositories
- **Frontend:** https://github.com/benedicttashkent-rgb/loyalty-frontend.git
- **Backend:** https://github.com/benedicttashkent-rgb/loyalty-backend.git

### Critical Files
- `src/config/api.js` - **CHANGE THIS IF RAILWAY URL CHANGES**
- `src/index.js` - Backend CORS configuration
- `src/routes/telegram-polling.js` - Bot polling logic

---

**Last Updated:** January 12, 2026  
**Status:** ✅ All systems operational
