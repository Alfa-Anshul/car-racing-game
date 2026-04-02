from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..core.database import get_db
from ..core.security import decode_token
from ..models.user import User
from ..models.race import Race
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

class UpdateUserRequest(BaseModel):
    car_skin: Optional[str] = None

@router.get("/me")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    races = db.query(Race).filter(Race.user_id == user.id).order_by(Race.created_at.desc()).limit(10).all()
    return {
        "id": user.id, "username": user.username, "email": user.email,
        "car_skin": user.car_skin, "total_races": user.total_races,
        "wins": user.wins, "best_lap_time": user.best_lap_time, "high_score": user.high_score,
        "recent_races": [{"lap_time": r.lap_time, "score": r.score, "position": r.position,
                          "track_name": r.track_name, "created_at": r.created_at.isoformat()} for r in races]
    }

@router.put("/me")
def update_me(req: UpdateUserRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.car_skin:
        user.car_skin = req.car_skin
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "car_skin": user.car_skin}
