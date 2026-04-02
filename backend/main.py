from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import auth, users, races, leaderboard
Base.metadata.create_all(bind=engine)
app = FastAPI(title="TurboRace API")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(auth.router,prefix="/auth",tags=["auth"])
app.include_router(users.router,prefix="/users",tags=["users"])
app.include_router(races.router,prefix="/races",tags=["races"])
app.include_router(leaderboard.router,prefix="/leaderboard",tags=["leaderboard"])
@app.get("/health")
def health(): return {"status":"ok"}
