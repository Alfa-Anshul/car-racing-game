from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    car_skin = Column(String, default="red")
    total_races = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    best_lap_time = Column(Float, nullable=True)
    high_score = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
