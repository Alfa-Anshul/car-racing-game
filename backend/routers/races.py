from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..core.database import get_db
from ..models.user import User
from ..models.race import Race
from .users import get_current_user

router = APIRouter()

class RaceSubmit(BaseModel):
    lap_time: float
    total_time: float
    score: int
    position: int
    track_name: str = "ALPHA CIRCUIT"

@router.post("/submit")
def submit_race(req: RaceSubmit, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    race = Race(user_id=user.id, lap_time=req.lap_time, total_time=req.total_time,
                score=req.score, position=req.position, track_name=req.track_name)
    db.add(race)
    user.total_races += 1
    if req.position == 1:
        user.wins += 1
    if user.best_lap_time is None or req.lap_time < user.best_lap_time:
        user.best_lap_time = req.lap_time
    if req.score > user.high_score:
        user.high_score = req.score
    db.commit()
    return {"message": "Race recorded", "score": req.score}

@router.get("/history")
def race_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    races = db.query(Race).filter(Race.user_id == user.id).order_by(Race.created_at.desc()).limit(20).all()
    return [{"lap_time": r.lap_time, "score": r.score, "position": r.position,
             "track_name": r.track_name, "created_at": r.created_at.isoformat()} for r in races]
