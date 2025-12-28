# 🎯 Habit Tracker

A beautiful, modern habit tracking application with glassmorphism UI design.

## 🏗️ Project Structure

```
habit-tracker/
├── backend/          # FastAPI Python backend
│   ├── main.py       # API endpoints
│   ├── database.py   # Database models
│   └── habits.db     # SQLite database
├── frontend/         # React + Vite frontend
│   ├── src/          # React components
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
└── README.md
```

## 🚀 Getting Started

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment (if not exists):
   ```bash
   python -m venv .venv
   ```

3. Activate virtual environment:
   ```bash
   # Windows
   .venv\Scripts\activate
   
   # Mac/Linux
   source .venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlmodel
   ```

5. Run the backend:
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

## 🌐 Deployment

### Frontend (Vercel)

The frontend can be deployed to Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure the following settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Backend

The backend is currently configured for local development. For production deployment, consider:
- Railway
- Render
- AWS Lambda
- Google Cloud Run

## 🎨 Features

- ✅ Beautiful glassmorphism UI
- ✅ Track multiple habits
- ✅ Monthly calendar view
- ✅ Progress tracking
- ✅ Streak counting
- ✅ Social leaderboard
- ✅ No authentication required (simplified for demo)

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Recharts
- Axios
- React Router

**Backend:**
- FastAPI
- SQLModel
- SQLite
- Uvicorn

## 📝 License

MIT
