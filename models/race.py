from sqlalchemy import Column,Integer,String,DateTime,Float,ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
class Race(Base):
  __tablename__="races"
  id=Column(Integer,primary_key=True,index=True)
  user_id=Column(Integer,ForeignKey("users.id"),nullable=False)
  track=Column(String,default="circuit_1")
  position=Column(Integer,default=1)
  lap_time=Column(Float,nullable=False)
  total_time=Column(Float,nullable=False)
  score=Column(Integer,default=0)
  car_used=Column(String,default="red")
  created_at=Column(DateTime(timezone=True),server_default=func.now())
