from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.race import Race
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
router=APIRouter()
security=HTTPBearer()
def get_current_user(creds:HTTPAuthorizationCredentials=Depends(security),db:Session=Depends(get_db)):
  payload=decode_token(creds.credentials)
  if not payload: raise HTTPException(401,"Invalid token")
  u=db.query(User).filter(User.id==int(payload["sub"])).first()
  if not u: raise HTTPException(404,"Not found")
  return u
class ProfileUpdate(BaseModel):
  avatar_color:Optional[str]=None;car_skin:Optional[str]=None
@router.get("/me")
def me(u:User=Depends(get_current_user),db:Session=Depends(get_db)):
  races=db.query(Race).filter(Race.user_id==u.id).order_by(Race.created_at.desc()).limit(10).all()
  return {"id":u.id,"username":u.username,"email":u.email,"avatar_color":u.avatar_color,"car_skin":u.car_skin,"total_races":u.total_races,"total_wins":u.total_wins,"best_lap_time":u.best_lap_time,"created_at":str(u.created_at),"recent_races":[{"id":r.id,"track":r.track,"position":r.position,"lap_time":r.lap_time,"score":r.score,"created_at":str(r.created_at)} for r in races]}
@router.put("/me")
def update_me(upd:ProfileUpdate,u:User=Depends(get_current_user),db:Session=Depends(get_db)):
  if upd.avatar_color: u.avatar_color=upd.avatar_color
  if upd.car_skin: u.car_skin=upd.car_skin
  db.commit();return {"status":"updated"}
