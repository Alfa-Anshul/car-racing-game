from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar_color = Column(String, default="#FF3366")
    car_skin = Column(String, default="red")
    total_races = Column(Integer, default=0)
    total_wins = Column(Integer, default=0)
    best_lap_time = Column(Float, default=0.0)
    total_distance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
