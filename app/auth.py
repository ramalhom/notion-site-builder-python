import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Request, Depends, HTTPException, status
import hashlib
from sqlmodel import Session, select
from .database import get_session
from .models import User

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "b38fdb8f-8ad4-400e-99e8-150255016787") # Fallback for dev
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week
COOKIE_NAME = "admin_session"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    # Pre-hash with SHA256 to consistently bypass Bcrypt's 72-byte limit
    # This also protects against certain library-level bugs.
    pwd_sha256 = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    return pwd_context.verify(pwd_sha256, hashed_password)

def get_password_hash(password):
    # Pre-hash with SHA256 to consistently bypass Bcrypt's 72-byte limit.
    pwd_sha256 = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return pwd_context.hash(pwd_sha256)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request, db: Session = Depends(get_session)):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
    except JWTError:
        return None
    
    user = db.exec(select(User).where(User.username == username)).first()
    return user

async def require_admin(user: User = Depends(get_current_user)):
    if not user:
        # Redirect to login instead of just 401
        raise HTTPException(
            status_code=status.HTTP_303_SEE_OTHER,
            headers={"Location": "/login"}
        )
    return user
