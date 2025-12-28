# 🚀 RENDER DEPLOYMENT GUIDE - FastAPI Backend

## 📋 Table of Contents
1. [Pre-Deployment Verification](#pre-deployment-verification)
2. [Render Account Setup](#render-account-setup)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Render Configuration Settings](#render-configuration-settings)
5. [Environment Variables](#environment-variables)
6. [Testing Your Deployment](#testing-your-deployment)
7. [Common Mistakes & Solutions](#common-mistakes--solutions)
8. [Why --host 0.0.0.0 is Required](#why---host-0000-is-required)
9. [Connecting Frontend to Backend](#connecting-frontend-to-backend)

---

## ✅ Pre-Deployment Verification

### 1. Backend is Deployment-Ready ✅

Your FastAPI backend has been verified and updated:

**✅ Checklist:**
- [x] `app = FastAPI()` is properly exposed in `main.py` (line 33)
- [x] `requirements.txt` includes all dependencies
- [x] Health check endpoints added (`/` and `/health`)
- [x] CORS configured for production
- [x] Environment variable support added
- [x] Database initialization on startup
- [x] Gunicorn added for production server

### 2. Files Verified

```
backend/
├── main.py              ✅ Contains app = FastAPI()
├── database.py          ✅ Database models and setup
├── requirements.txt     ✅ All dependencies listed
├── .gitignore           ✅ Excludes __pycache__, .venv, *.db
└── habits.db            ⚠️  Will be created on Render (ephemeral)
```

### 3. Requirements.txt Updated ✅

Your `requirements.txt` now includes:
```
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlmodel==0.0.22
pydantic==2.10.6
gunicorn==21.2.0
```

**Why each dependency:**
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server with performance extras
- `sqlmodel` - Database ORM
- `pydantic` - Data validation
- `gunicorn` - Production-grade process manager

---

## 🌐 Render Account Setup

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email
4. Verify your email

### Step 2: Connect GitHub Repository

1. Make sure your code is pushed to GitHub
2. Render will ask for GitHub access
3. Grant access to your `habit-tracker` repository

---

## 📦 Step-by-Step Deployment

### Step 1: Create New Web Service

1. Log in to https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"Web Service"**

### Step 2: Connect Repository

1. Find your `habit-tracker` repository in the list
2. Click **"Connect"**
3. If not visible, click "Configure account" to grant access

### Step 3: Configure Service

Fill in the following settings **EXACTLY**:

```
┌─────────────────────────────────────────────────────────┐
│ Name:              habit-tracker-api                    │
│ Region:            Oregon (US West) or closest to you   │
│ Branch:            main                                 │
│ Root Directory:    backend                    ⚠️ KEY!  │
│ Runtime:           Python 3                             │
│ Build Command:     pip install -r requirements.txt     │
│ Start Command:     uvicorn main:app --host 0.0.0.0     │
│                    --port $PORT                         │
│ Instance Type:     Free                                 │
└─────────────────────────────────────────────────────────┘
```

**CRITICAL SETTINGS:**

| Setting | Value | Why |
|---------|-------|-----|
| **Root Directory** | `backend` | Points to your FastAPI code |
| **Build Command** | `pip install -r requirements.txt` | Installs dependencies |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` | Starts server |

### Step 4: Environment Variables

Click **"Advanced"** and add:

```
Key:   FRONTEND_URL
Value: https://your-app.vercel.app
```

Replace `your-app.vercel.app` with your actual Vercel URL.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will start building
3. Wait 2-5 minutes for deployment
4. You'll get a URL like: `https://habit-tracker-api.onrender.com`

---

## ⚙️ Render Configuration Settings

### Detailed Explanation

#### 1. Root Directory: `backend`

**Why?**
- Your project structure has `backend/` and `frontend/` folders
- Render needs to know where your Python code is
- Without this, Render looks in the root and won't find `main.py`

**What happens:**
```
❌ Without Root Directory:
Render looks for: /main.py (not found)

✅ With Root Directory = backend:
Render looks for: /backend/main.py (found!)
```

#### 2. Build Command: `pip install -r requirements.txt`

**Why?**
- Installs all Python dependencies
- Runs during the build phase
- Ensures all packages are available

**What happens:**
```bash
# Render executes:
cd backend
pip install -r requirements.txt

# Installs:
# - fastapi
# - uvicorn
# - sqlmodel
# - pydantic
# - gunicorn
```

#### 3. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Why each part:**

```bash
uvicorn           # ASGI server
main:app          # Import app from main.py
--host 0.0.0.0    # Listen on all network interfaces
--port $PORT      # Use Render's assigned port
```

**Breaking it down:**

| Part | Explanation |
|------|-------------|
| `uvicorn` | Production ASGI server for FastAPI |
| `main:app` | Load `app` object from `main.py` file |
| `--host 0.0.0.0` | Accept connections from any IP (required for Render) |
| `--port $PORT` | Render sets this environment variable (usually 10000) |

---

## 🔍 Why --host 0.0.0.0 is Required

### The Problem with 127.0.0.1

**Local Development:**
```bash
# This works locally:
uvicorn main:app --host 127.0.0.1 --port 8000

# 127.0.0.1 = localhost (only your computer can access)
```

**Production (Render):**
```bash
# This FAILS on Render:
uvicorn main:app --host 127.0.0.1 --port 10000

# Why? Render's load balancer can't reach 127.0.0.1
# 127.0.0.1 only accepts connections from the same machine
```

### The Solution: 0.0.0.0

```bash
# This works on Render:
uvicorn main:app --host 0.0.0.0 --port 10000

# 0.0.0.0 = All network interfaces
# Accepts connections from:
# - Render's load balancer ✅
# - External internet ✅
# - Your Vercel frontend ✅
```

### Visual Explanation

```
┌─────────────────────────────────────────────────────┐
│ 127.0.0.1 (localhost)                               │
│ ┌─────────────────┐                                 │
│ │   Your App      │ ← Only accepts local requests  │
│ └─────────────────┘                                 │
│         ↑                                           │
│         │ ❌ External requests blocked              │
│         │                                           │
│    [Internet]                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 0.0.0.0 (all interfaces)                            │
│ ┌─────────────────┐                                 │
│ │   Your App      │ ← Accepts all requests         │
│ └─────────────────┘                                 │
│         ↑                                           │
│         │ ✅ External requests allowed              │
│         │                                           │
│    [Internet]                                       │
└─────────────────────────────────────────────────────┘
```

### Security Note

**Is 0.0.0.0 safe?**

✅ **YES** - When behind Render's infrastructure:
- Render provides SSL/TLS encryption
- Render handles DDoS protection
- Your CORS settings control which frontends can access it
- Render's firewall protects your service

---

## 🧪 Testing Your Deployment

### Step 1: Check Deployment Status

1. Go to Render dashboard
2. Click on your service
3. Check "Logs" tab for errors
4. Wait for "Live" status (green)

### Step 2: Test Health Check

Open your browser and visit:
```
https://your-app.onrender.com/
```

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "Habit Tracker API is running",
  "version": "1.0.0"
}
```

### Step 3: Test API Documentation

Visit:
```
https://your-app.onrender.com/docs
```

**You should see:**
- FastAPI Swagger UI
- List of all endpoints
- Interactive API testing interface

**Try it:**
1. Click on `GET /habits`
2. Click "Try it out"
3. Click "Execute"
4. Should return `[]` (empty array) or your habits

### Step 4: Test Specific Endpoints

**Test Dashboard Endpoint:**
```
https://your-app.onrender.com/dashboard/2025/1
```

**Expected:** JSON with dashboard data

**Test Health:**
```
https://your-app.onrender.com/health
```

**Expected:**
```json
{"status": "ok"}
```

---

## 🐛 Common Mistakes & Solutions

### Mistake #1: Forgot Root Directory

**Symptom:**
```
Error: Could not find main.py
Build failed
```

**Solution:**
1. Go to Settings
2. Set "Root Directory" to `backend`
3. Click "Save Changes"
4. Trigger manual deploy

---

### Mistake #2: Wrong Start Command

**Symptom:**
```
Error: Address already in use
Error: Permission denied
```

**Wrong Commands:**
```bash
❌ python main.py
❌ uvicorn main:app --port 8000
❌ uvicorn main:app --host 127.0.0.1
```

**Correct Command:**
```bash
✅ uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Why:**
- Render assigns port dynamically via `$PORT` env var
- Must use `0.0.0.0` to accept external connections
- `$PORT` is usually 10000 but can change

---

### Mistake #3: Missing Dependencies

**Symptom:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
1. Check `requirements.txt` exists in `backend/` folder
2. Verify all dependencies are listed
3. Ensure Build Command is: `pip install -r requirements.txt`

---

### Mistake #4: CORS Not Configured

**Symptom:**
- Backend works in `/docs`
- Frontend gets CORS error

**Solution:**
1. Add environment variable in Render:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
2. Redeploy

---

### Mistake #5: Database File Not Persisting

**Symptom:**
- Habits disappear after redeploy
- Database resets

**Explanation:**
- Render's free tier has **ephemeral filesystem**
- `habits.db` is recreated on each deploy
- Data is lost on restart

**Solutions:**

**Option A: Use Render PostgreSQL (Recommended)**
1. Create PostgreSQL database on Render
2. Update `database.py` to use PostgreSQL
3. Add `psycopg2-binary` to requirements.txt

**Option B: Accept Ephemeral Data (Development)**
- Good for testing
- Data resets on each deploy
- Free and simple

**Option C: Use External Database**
- Supabase (PostgreSQL)
- PlanetScale (MySQL)
- MongoDB Atlas

---

### Mistake #6: Forgot to Push to GitHub

**Symptom:**
- Old code is deployed
- Changes don't appear

**Solution:**
```bash
git add .
git commit -m "Update backend for production"
git push
```

Render auto-deploys on push!

---

## 🔗 Connecting Frontend to Backend

### Step 1: Get Your Render URL

After deployment, you'll have:
```
https://habit-tracker-api.onrender.com
```

### Step 2: Update Vercel Environment Variable

1. Go to https://vercel.com
2. Select your project
3. Go to Settings → Environment Variables
4. Update `VITE_API_URL`:
   ```
   Name:  VITE_API_URL
   Value: https://habit-tracker-api.onrender.com
   ```
5. Click Save

### Step 3: Update Backend CORS

Your backend already has environment variable support!

In Render:
1. Go to Environment
2. Add:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Save and redeploy

### Step 4: Redeploy Frontend

```bash
git add .
git commit -m "Update API URL"
git push
```

Vercel auto-deploys!

### Step 5: Test End-to-End

1. Visit your Vercel URL
2. Dashboard should load
3. Try creating a habit
4. Check browser console for errors

---

## 📊 Deployment Checklist

### Before Deploying:

- [ ] Code pushed to GitHub
- [ ] `requirements.txt` is complete
- [ ] `main.py` has `app = FastAPI()`
- [ ] Health check endpoints added
- [ ] CORS configured

### During Deployment:

- [ ] Root Directory set to `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Environment variable `FRONTEND_URL` added

### After Deployment:

- [ ] Visit `/` - health check works
- [ ] Visit `/docs` - Swagger UI loads
- [ ] Test `/habits` endpoint
- [ ] Update Vercel `VITE_API_URL`
- [ ] Test frontend connection
- [ ] Create a habit to verify

---

## 🎯 Expected Results

### Successful Deployment Shows:

✅ **Render Dashboard:**
- Status: "Live" (green)
- Latest deploy: "Deploy live"
- No errors in logs

✅ **Health Check (`/`):**
```json
{
  "status": "healthy",
  "message": "Habit Tracker API is running",
  "version": "1.0.0"
}
```

✅ **API Docs (`/docs`):**
- Swagger UI loads
- All endpoints listed
- Can test endpoints

✅ **Frontend Connection:**
- Dashboard loads
- Can create habits
- No CORS errors

---

## 🚀 Next Steps

1. **Deploy to Render** (follow this guide)
2. **Get your Render URL** (e.g., `https://habit-tracker-api.onrender.com`)
3. **Update Vercel env var** (`VITE_API_URL`)
4. **Add Vercel URL to Render** (`FRONTEND_URL`)
5. **Test everything works!**

---

## 📞 Troubleshooting Resources

If you encounter issues:

1. **Check Render Logs:**
   - Dashboard → Your Service → Logs
   - Look for error messages

2. **Test Backend Directly:**
   - Visit `/docs` to test endpoints
   - Check if database initializes

3. **Check CORS:**
   - Browser console for CORS errors
   - Verify `FRONTEND_URL` is set

4. **Common Issues:**
   - See "Common Mistakes" section above
   - Check Render status page

---

**You're ready to deploy! 🎉**

Follow the steps carefully, and you'll have a live backend in minutes!
