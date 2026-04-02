from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.race import Race
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(401, "Invalid token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

class ProfileUpdate(BaseModel):
    avatar_color: Optional[str] = None
    car_skin: Optional[str] = None

@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    races = db.query(Race).filter(Race.user_id == current_user.id).order_by(Race.created_at.desc()).limit(10).all()
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "avatar_color": current_user.avatar_color,
        "car_skin": current_user.car_skin,
        "total_races": current_user.total_races,
        "total_wins": current_user.total_wins,
        "best_lap_time": current_user.best_lap_time,
        "total_distance": current_user.total_distance,
        "created_at": current_user.created_at,
        "recent_races": [
            {"id": r.id, "track": r.track, "position": r.position, "lap_time": r.lap_time, "score": r.score, "created_at": r.created_at}
            for r in races
        ]
    }

@router.put("/me")
def update_profile(update: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if update.avatar_color:
        current_user.avatar_color = update.avatar_color
    if update.car_skin:
        current_user.car_skin = update.car_skin
    db.commit()
    db.refresh(current_user)
    return {"status": "updated"}
