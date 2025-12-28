from fastapi import FastAPI, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date, timedelta
import calendar
from contextlib import asynccontextmanager
import secrets
from pydantic import BaseModel

from database import Habit, DailyLog, User, Friendship, create_db_and_tables, get_session, engine

# --- App ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Create default user if not exists
    with Session(engine) as session:
        existing = session.exec(select(User).where(User.username == "default_user")).first()
        if not existing:
            default_user = User(
                username="default_user",
                password_hash="",  # No password needed
                full_name="Habit Tracker User",
                age=25,
                bio="Building better habits every day",
                profile_picture="https://api.dicebear.com/7.x/avataaars/svg?seed=HabitMaster",
                friend_code=secrets.token_hex(4).upper()
            )
            session.add(default_user)
            session.commit()
    yield

app = FastAPI(lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Get Default User ---
def get_current_user(session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == "default_user")).first()
    if not user:
        raise HTTPException(status_code=500, detail="Default user not found")
    return user

# --- Pydantic Schemas ---
class UserPublic(BaseModel):
    username: str
    full_name: str
    friend_code: str
    profile_picture: Optional[str]

class HabitCreate(BaseModel):
    name: str
    icon: str = "📝"
    target_days: int = 30
    scheduled_time: str = "09:00"

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    scheduled_time: Optional[str] = None

class ToggleRequest(BaseModel):
    habit_id: int
    date: date

# --- Endpoints: User Info ---

@app.get("/users/me", response_model=UserPublic)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Endpoints: Social ---

@app.post("/friends/add/{friend_code}")
def add_friend(friend_code: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    friend = session.exec(select(User).where(User.friend_code == friend_code)).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend code not found")
    if friend.id == current_user.id:
         raise HTTPException(status_code=400, detail="Cannot add yourself")
         
    existing = session.exec(select(Friendship).where(Friendship.user_id == current_user.id, Friendship.friend_id == friend.id)).first()
    if existing:
        return {"status": "already friends"}
        
    relation = Friendship(user_id=current_user.id, friend_id=friend.id)
    session.add(relation)
    session.commit()
    return {"status": "added", "friend_name": friend.full_name}

@app.get("/leaderboard")
def get_leaderboard(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Get friends IDs
    friendships = session.exec(select(Friendship).where(Friendship.user_id == current_user.id)).all()
    friend_ids = [f.friend_id for f in friendships]
    friend_ids.append(current_user.id) # Include self
    
    leaderboard = []
    
    # Calculate simple score: total logs in current month
    today = date.today()
    start_date = date(today.year, today.month, 1)
    
    users = session.exec(select(User).where(User.id.in_(friend_ids))).all()
    
    for user in users:
        # Join User -> Habit -> DailyLog
        # A bit inefficient loop query, but ok for SaaS prototype
        habits = session.exec(select(Habit).where(Habit.user_id == user.id)).all()
        habit_ids = [h.id for h in habits]
        
        if not habit_ids:
            score = 0
            completion_rate = 0
        else:
            logs_count = session.exec(select(DailyLog).where(DailyLog.habit_id.in_(habit_ids), DailyLog.date >= start_date)).all()
            score = len(logs_count) 
            
            # Rate? Total potential = habits * days_so_far
            days_passed = today.day
            total_potential = len(habits) * days_passed
            completion_rate = int((score / total_potential * 100)) if total_potential > 0 else 0

        leaderboard.append({
            "username": user.username,
            "full_name": user.full_name,
            "profile_picture": user.profile_picture,
            "score": completion_rate,
            "is_me": user.id == current_user.id
        })
    
    # Sort by score desc
    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    return leaderboard


# --- Endpoints: Habits ---

@app.get("/habits", response_model=List[Habit])
def get_habits(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(select(Habit).where(Habit.user_id == current_user.id)).all()

@app.post("/habits", response_model=Habit)
def create_habit(habit: HabitCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_habit = Habit(
        name=habit.name,
        icon=habit.icon,
        target_days=habit.target_days,
        scheduled_time=habit.scheduled_time,
        user_id=current_user.id
    )
    session.add(db_habit)
    session.commit()
    session.refresh(db_habit)
    return db_habit

@app.patch("/habits/{habit_id}", response_model=Habit)
def update_habit(habit_id: int, habit_update: HabitUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    if habit_update.name is not None: habit.name = habit_update.name
    if habit_update.icon is not None: habit.icon = habit_update.icon
    if habit_update.scheduled_time is not None: habit.scheduled_time = habit_update.scheduled_time
    
    session.add(habit)
    session.commit()
    session.refresh(habit)
    return habit

@app.post("/toggle")
def toggle_habit(request: ToggleRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    habit = session.get(Habit, request.habit_id)
    if not habit or habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Habit not found")

    statement = select(DailyLog).where(
        DailyLog.habit_id == request.habit_id,
        DailyLog.date == request.date
    )
    existing_log = session.exec(statement).first()
    
    if existing_log:
        session.delete(existing_log)
        # Recalculate streak? For prototype, maybe simple logic:
        # If toggling OFF today, streak might break. 
        # Ideally we recalculate entire streak.
        # For MVP: simple decrement if it was today.
        session.commit()
        return {"status": "removed"}
    else:
        new_log = DailyLog(habit_id=request.habit_id, date=request.date, completed=True)
        session.add(new_log)
        
        # Streak Logic
        # Check if yesterday was completed
        yesterday = request.date - timedelta(days=1)
        prev_log = session.exec(select(DailyLog).where(DailyLog.habit_id == request.habit_id, DailyLog.date == yesterday)).first()
        
        if prev_log:
            habit.current_streak += 1
        else:
            # If we toggle a past date, this simple logic fails. 
            # But assume user toggles TODAY usually. 
            # If toggling today and yesterday not done, streak = 1.
            habit.current_streak = 1
            
        if habit.current_streak > habit.longest_streak:
            habit.longest_streak = habit.current_streak
            
        session.add(habit)
        session.commit()
        return {"status": "added", "new_streak": habit.current_streak}

@app.get("/dashboard/{year}/{month}")
def get_dashboard_data(year: int, month: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    try:
        _, last_day = calendar.monthrange(year, month)
        start_date = date(year, month, 1)
        end_date = date(year, month, last_day)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date")

    # Get User Habits
    habits = session.exec(select(Habit).where(Habit.user_id == current_user.id).order_by(Habit.scheduled_time)).all()
    habit_ids = [h.id for h in habits]
    
    # Filter logs
    logs = []
    if habit_ids:
        logs = session.exec(select(DailyLog).where(DailyLog.habit_id.in_(habit_ids), DailyLog.date >= start_date, DailyLog.date <= end_date)).all()
    
    total_habits = len(habits)

    # Calculate Aggregates
    daily_aggregates = []
    daily_counts = {d: 0 for d in range(1, last_day + 1)}

    for log in logs:
        if log.date.month == month:
            daily_counts[log.date.day] += 1

    for day in range(1, last_day + 1):
        count = daily_counts[day]
        percent = (count / total_habits * 100) if total_habits > 0 else 0
        daily_aggregates.append({
            "date": f"{year}-{month:02d}-{day:02d}",
            "day": day,
            "completed_count": count,
            "total_active": total_habits,
            "percent": int(percent)
        })

    completed_count = len(logs)
    target_total = total_habits * last_day

    return {
        "user_info": {
            "name": current_user.full_name,
            "friend_code": current_user.friend_code,
            "pic": current_user.profile_picture
        },
        "habits": habits,
        "logs": logs,
        "stats": {
            "daily_aggregates": daily_aggregates,
            "overall_progress": {"completed": completed_count, "total": target_total},
            "total_habits": total_habits
        },
        "meta": {
            "year": year, 
            "month": month,
            "days_in_month": last_day
        }
    }
