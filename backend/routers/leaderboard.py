from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.race import Race
from app.models.user import User
router=APIRouter()
@router.get("/")
def leaderboard(db:Session=Depends(get_db)):
  rows=db.query(User.id,User.username,User.avatar_color,User.car_skin,func.sum(Race.score).label("total_score"),func.count(Race.id).label("total_races"),func.min(Race.lap_time).label("best_lap")).join(Race,Race.user_id==User.id).group_by(User.id).order_by(func.sum(Race.score).desc()).limit(50).all()
  return [{"rank":i+1,"username":r.username,"avatar_color":r.avatar_color,"total_score":r.total_score or 0,"total_races":r.total_races or 0,"best_lap":round(r.best_lap or 0,2)} for i,r in enumerate(rows)]
