from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.race import Race
from app.models.user import User
from app.routers.users import get_current_user

router = APIRouter()

class RaceResult(BaseModel):
    track: str
    position: int
    lap_time: float
    total_time: float
    score: int
    car_used: str

@router.post("/submit")
def submit_race(result: RaceResult, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    race = Race(
        user_id=current_user.id,
        track=result.track,
        position=result.position,
        lap_time=result.lap_time,
        total_time=result.total_time,
        score=result.score,
        car_used=result.car_used
    )
    db.add(race)
    current_user.total_races += 1
    if result.position == 1:
        current_user.total_wins += 1
    if current_user.best_lap_time == 0.0 or result.lap_time < current_user.best_lap_time:
        current_user.best_lap_time = result.lap_time
    db.commit()
    return {"status": "saved", "score": result.score}

@router.get("/history")
def race_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    races = db.query(Race).filter(Race.user_id == current_user.id).order_by(Race.created_at.desc()).limit(20).all()
    return [{"id": r.id, "track": r.track, "position": r.position, "lap_time": r.lap_time, "score": r.score, "created_at": str(r.created_at)} for r in races]
