from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.race import Race
from app.models.user import User
from app.routers.users import get_current_user
router=APIRouter()
class RaceResult(BaseModel):
  track:str;position:int;lap_time:float;total_time:float;score:int;car_used:str
@router.post("/submit")
def submit(r:RaceResult,u:User=Depends(get_current_user),db:Session=Depends(get_db)):
  race=Race(user_id=u.id,track=r.track,position=r.position,lap_time=r.lap_time,total_time=r.total_time,score=r.score,car_used=r.car_used)
  db.add(race)
  u.total_races+=1
  if r.position==1: u.total_wins+=1
  if u.best_lap_time==0.0 or r.lap_time<u.best_lap_time: u.best_lap_time=r.lap_time
  db.commit();return {"status":"saved","score":r.score}
@router.get("/history")
def history(u:User=Depends(get_current_user),db:Session=Depends(get_db)):
  return [{"id":r.id,"track":r.track,"position":r.position,"lap_time":r.lap_time,"score":r.score,"created_at":str(r.created_at)} for r in db.query(Race).filter(Race.user_id==u.id).order_by(Race.created_at.desc()).limit(20).all()]
