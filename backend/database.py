from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship, Session, select, create_engine
from datetime import date, time

# --- Database Setup ---
sqlite_file_name = "habits.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# --- Models ---

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    
    # Profile Info
    full_name: str
    age: Optional[int] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None  # URL or base64
    
    # Social
    friend_code: str = Field(unique=True, index=True)
    
    habits: List["Habit"] = Relationship(back_populates="user")

# Join table for many-to-many friendships could be here, but let's stick to simple "following" or JSON list if requested.
# But distinct table is cleaner for "friends".
class Friendship(SQLModel, table=True):
    user_id: int = Field(primary_key=True, foreign_key="user.id")
    friend_id: int = Field(primary_key=True, foreign_key="user.id")

class Habit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    icon: str
    target_days: int
    
    # New Fields
    scheduled_time: Optional[str] = None # Store as ISO format "HH:MM"
    current_streak: int = Field(default=0)
    longest_streak: int = Field(default=0)
    
    user_id: int = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="habits")
    
    logs: List["DailyLog"] = Relationship(back_populates="habit")

class DailyLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: date
    completed: bool = True
    
    habit_id: int = Field(foreign_key="habit.id")
    habit: "Habit" = Relationship(back_populates="logs")
