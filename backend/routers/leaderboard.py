from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.user import User

router = APIRouter()

@router.get("/")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.high_score.desc()).limit(50).all()
    return [{"username": u.username, "high_score": u.high_score, "wins": u.wins,
             "best_lap_time": u.best_lap_time, "total_races": u.total_races} for u in users]
