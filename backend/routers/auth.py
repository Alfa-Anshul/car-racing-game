from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import verify_password,get_password_hash,create_access_token
from app.models.user import User
router=APIRouter()
class RegisterReq(BaseModel):
  username:str;email:str;password:str
class LoginReq(BaseModel):
  username:str;password:str
@router.post("/register")
def register(req:RegisterReq,db:Session=Depends(get_db)):
  if db.query(User).filter(User.username==req.username).first(): raise HTTPException(400,"Username taken")
  if db.query(User).filter(User.email==req.email).first(): raise HTTPException(400,"Email taken")
  u=User(username=req.username,email=req.email,hashed_password=get_password_hash(req.password))
  db.add(u);db.commit();db.refresh(u)
  return {"access_token":create_access_token({"sub":str(u.id)}),"token_type":"bearer","username":u.username,"user_id":u.id}
@router.post("/login")
def login(req:LoginReq,db:Session=Depends(get_db)):
  u=db.query(User).filter(User.username==req.username).first()
  if not u or not verify_password(req.password,u.hashed_password): raise HTTPException(401,"Invalid credentials")
  return {"access_token":create_access_token({"sub":str(u.id)}),"token_type":"bearer","username":u.username,"user_id":u.id}
