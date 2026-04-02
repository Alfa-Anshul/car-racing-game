from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..core.database import Base

class Race(Base):
    __tablename__ = "races"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lap_time = Column(Float, nullable=False)
    total_time = Column(Float, nullable=False)
    score = Column(Integer, nullable=False)
    position = Column(Integer, nullable=False)
    track_name = Column(String, default="ALPHA CIRCUIT")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
